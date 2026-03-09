const { verificarToken } = require('../utils/token');
const User = require('../models/User');

// ─── Fuente única de verdad de áreas — debe coincidir con AREAS_SISTEMA del frontend ──
const AREAS_VALIDAS = new Set([
  'recursos-humanos',
  'secretaria',
  'tesoreria',
  'obras-publicas',
  'desarrollo-social',
  'seguridad-publica',
  'catastro',
  'servicios-publicos',
  'transparencia-informatica',
]);

/**
 * Normaliza un areaId al formato kebab-case canónico.
 * Permite que el frontend envíe variantes sin romper la API:
 *   'Recursos Humanos'  → 'recursos-humanos'
 *   'recursos_humanos'  → 'recursos-humanos'
 *   'Tesorería'         → 'tesoreria'
 *   'recursos-humanos'  → 'recursos-humanos' (ya correcto, sin cambio)
 */
const normalizarAreaId = (valor) => {
  if (!valor || typeof valor !== 'string') return null;
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // tildes: á→a, é→e
    .replace(/\s+/g, '-')  // espacios → guiones
    .replace(/_/g, '-');   // underscores → guiones
};

// ─── authMiddleware ───────────────────────────────────────────────────────────
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verificarToken(token);

    const user = await User.findById(decoded.uid).select('-passwordHash');
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    if (!user.activo) return res.status(403).json({ error: 'Usuario inactivo' });

    req.user = {
      uid:   user._id.toString(),
      rol:   user.rol,
      areas: user.areasPermitidas,
      doc:   user,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }
};

// ─── soloAdmin ────────────────────────────────────────────────────────────────
const soloAdmin = (req, res, next) => {
  if (req.user?.rol !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso solo para administradores' });
  }
  next();
};

// ─── puedeRegistrarUsuarios ───────────────────────────────────────────────────
const puedeRegistrarUsuarios = (req, res, next) => {
  if (!['ADMIN', 'JEFE_AREA'].includes(req.user?.rol)) {
    return res.status(403).json({ error: 'No tienes permiso para registrar usuarios' });
  }
  next();
};

// ─── puedeGestionarMembretadas ────────────────────────────────────────────────
// Separa explícitamente quién puede escribir/eliminar membretadas.
// EMPLEADO y ASISTENTE quedan bloqueados aquí — no en el controller.
const puedeGestionarMembretadas = (req, res, next) => {
  if (!['ADMIN', 'JEFE_AREA'].includes(req.user?.rol)) {
    return res.status(403).json({
      error: 'No tienes permiso para gestionar hojas membretadas',
    });
  }
  next();
};

// ─── areaGuard ────────────────────────────────────────────────────────────────
/**
 * 1. Extrae areaId de body / query / params.
 * 2. Lo normaliza a kebab-case.
 * 3. Valida que sea un área del sistema.
 * 4. Verifica que el usuario tenga acceso.
 * 5. Reescribe req.body/query/params con el valor normalizado
 *    → los controllers siempre reciben el ID canónico, sin importar
 *      lo que mandó el frontend.
 */
const areaGuard = (required = true) => (req, res, next) => {
  if (!required) return next();

  const rawAreaId =
    req.body?.areaId ||
    req.query?.areaId ||
    req.params?.areaId;

  if (!rawAreaId) {
    return res.status(400).json({ error: 'areaId es requerido' });
  }

  const areaId = normalizarAreaId(rawAreaId);

  if (!AREAS_VALIDAS.has(areaId)) {
    return res.status(400).json({
      error: `El área "${rawAreaId}" no es válida`,
      areasDisponibles: [...AREAS_VALIDAS],
    });
  }

  // Reescribir con el valor canónico para que los controllers no repitan este trabajo
  if (req.body?.areaId !== undefined)   req.body.areaId   = areaId;
  if (req.query?.areaId !== undefined)  req.query.areaId  = areaId;
  if (req.params?.areaId !== undefined) req.params.areaId = areaId;

  if (req.user.rol === 'ADMIN') return next();

  if (!req.user.areas.includes(areaId)) {
    return res.status(403).json({
      error: `No tienes permiso para operar en el área "${areaId}"`,
    });
  }

  next();
};

module.exports = {
  authMiddleware,
  soloAdmin,
  puedeRegistrarUsuarios,
  puedeGestionarMembretadas,
  areaGuard,
  normalizarAreaId,
  AREAS_VALIDAS,
};
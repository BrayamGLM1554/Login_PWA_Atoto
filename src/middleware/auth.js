const { verificarToken } = require('../utils/token');
const User = require('../models/User');

// ─── Fuente única de verdad de áreas — debe coincidir con AREAS_SISTEMA del frontend ──
const AREAS_VALIDAS = new Set([
  'Recursos Humanos',
  'Secretaría',
  'Tesorería',
  'Obras Públicas',
  'Desarrollo Social',
  'Seguridad Pública',
  'Catastro',
  'Servicios Públicos',
  'Transparencia e Informática',
]);

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
 * 2. Solo aplica trim (sin convertir a kebab-case).
 * 3. Valida que sea un área del sistema.
 * 4. Verifica que el usuario tenga acceso.
 * 5. Reescribe req.body/query/params con el valor limpio.
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

  const areaId = rawAreaId.trim();

  if (!AREAS_VALIDAS.has(areaId)) {
    return res.status(400).json({
      error: `El área "${rawAreaId}" no es válida`,
      areasDisponibles: [...AREAS_VALIDAS],
    });
  }

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
  AREAS_VALIDAS,
};
const { verificarToken } = require('../utils/token');
const User = require('../models/User');

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
      uid: user._id.toString(),
      rol: user.rol,
      areas: user.areasPermitidas,
      doc: user,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }
};

const soloAdmin = (req, res, next) => {
  if (req.user?.rol !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso solo para administradores' });
  }
  next();
};

// ADMIN y JEFE_AREA (Jefe de Area, Director, Coordinador) pueden registrar usuarios
const puedeRegistrarUsuarios = (req, res, next) => {
  const rolesPermitidos = ['ADMIN', 'JEFE_AREA'];
  if (!rolesPermitidos.includes(req.user?.rol)) {
    return res.status(403).json({ error: 'No tienes permiso para registrar usuarios' });
  }
  next();
};

// areaGuard - valida que el usuario tenga acceso al area solicitada
const areaGuard = (required = true) => (req, res, next) => {
  if (!required) return next();
  
  const areaId = req.body.areaId || req.query.areaId || req.params.areaId;
  
  if (!areaId) {
    return res.status(400).json({ error: 'areaId es requerido' });
  }

  if (req.user.rol === 'ADMIN') return next();

  if (!req.user.areas.includes(areaId)) {
    return res.status(403).json({ error: 'No tienes permiso para operar en esta area' });
  }

  next();
};

module.exports = { authMiddleware, soloAdmin, puedeRegistrarUsuarios, areaGuard };
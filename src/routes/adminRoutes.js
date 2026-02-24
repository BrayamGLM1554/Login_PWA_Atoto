const router = require('express').Router();
const {
  crearUsuario,
  actualizarAreas,
  listarUsuarios,
  obtenerUsuario,
  toggleActivo,
  subirAvatar,
} = require('../controllers/adminController');
const { authMiddleware, soloAdmin, puedeRegistrarUsuarios } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Avatar: cualquier usuario autenticado puede cambiar su propio avatar
router.post('/users/:id/avatar', authMiddleware, upload.single('avatar'), subirAvatar);

// Crear y listar usuarios: ADMIN y JEFE_AREA
router.post('/users', authMiddleware, puedeRegistrarUsuarios, crearUsuario);
router.get('/users', authMiddleware, puedeRegistrarUsuarios, listarUsuarios);

// Solo ADMIN: ver detalle, modificar areas, activar/desactivar
router.use(authMiddleware, soloAdmin);

router.get('/users/:id', obtenerUsuario);
router.patch('/users/:id/areas', actualizarAreas);
router.patch('/users/:id/toggle', toggleActivo);

module.exports = router;
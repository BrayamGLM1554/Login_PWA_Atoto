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

// Avatar: cualquier usuario autenticado puede cambiar su propio avatar,
// el ADMIN puede cambiar el de cualquiera
router.post('/users/:id/avatar', authMiddleware, upload.single('avatar'), subirAvatar);

// Crear usuario: ADMIN y JEFE_AREA (Jefe de Area, Director, Coordinador)
router.post('/users', authMiddleware, puedeRegistrarUsuarios, crearUsuario);

// El resto solo para ADMIN
router.use(authMiddleware, soloAdmin);

router.get('/users', listarUsuarios);
router.get('/users/:id', obtenerUsuario);
router.patch('/users/:id/areas', actualizarAreas);
router.patch('/users/:id/toggle', toggleActivo);

module.exports = router;
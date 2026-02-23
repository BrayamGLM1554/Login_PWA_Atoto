const router = require('express').Router();
const {
  crearUsuario,
  actualizarAreas,
  listarUsuarios,
  obtenerUsuario,
  toggleActivo,
  subirAvatar,
} = require('../controllers/adminController');
const { authMiddleware, soloAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Avatar: cualquier usuario autenticado puede cambiar su propio avatar,
// el ADMIN puede cambiar el de cualquiera
router.post('/users/:id/avatar', authMiddleware, upload.single('avatar'), subirAvatar);

// El resto solo para ADMIN
router.use(authMiddleware, soloAdmin);

router.get('/users', listarUsuarios);
router.post('/users', crearUsuario);
router.get('/users/:id', obtenerUsuario);
router.patch('/users/:id/areas', actualizarAreas);
router.patch('/users/:id/toggle', toggleActivo);

module.exports = router;
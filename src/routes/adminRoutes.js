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

// Todas las rutas requieren auth + ser ADMIN
router.use(authMiddleware, soloAdmin);

router.get('/users', listarUsuarios);
router.post('/users', crearUsuario);
router.get('/users/:id', obtenerUsuario);
router.patch('/users/:id/areas', actualizarAreas);
router.patch('/users/:id/toggle', toggleActivo);
router.post('/users/:id/avatar', upload.single('avatar'), subirAvatar);

module.exports = router;

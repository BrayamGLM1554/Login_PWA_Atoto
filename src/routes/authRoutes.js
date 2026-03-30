const router = require('express').Router();
const { login, perfil } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { resetearPassword } = require('../controllers/authController');

router.post('/login', login);
router.get('/perfil', authMiddleware, perfil);
router.patch('/users/:id/password', authMiddleware, puedeRegistrarUsuarios, resetearPassword);

module.exports = router;

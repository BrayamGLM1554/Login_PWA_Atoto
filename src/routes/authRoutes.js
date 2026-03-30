const router = require('express').Router();
const { login, perfil, resetearPassword } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/login', login);
router.get('/perfil', authMiddleware, perfil);
router.patch('/users/:id/password', authMiddleware, resetearPassword);

module.exports = router;

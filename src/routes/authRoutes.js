const router = require('express').Router();
const { login, perfil } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/login', login);
router.get('/perfil', authMiddleware, perfil);

module.exports = router;

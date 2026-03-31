const router = require('express').Router();
const { login, perfil, resetearPassword } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User'); // ← faltaba esto

router.post('/login', login);
router.get('/perfil', authMiddleware, perfil);
router.patch('/users/:id/password', authMiddleware, resetearPassword);
router.patch('/aceptar-aviso', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.uid, {
      avisoPrivacidadAceptado: true,
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar aviso' });
  }
});

module.exports = router;

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generarToken } = require('../utils/token');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos' });
    }

    // Cargar usuario con passwordHash
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    if (!user.activo) {
      return res.status(403).json({ error: 'Usuario inactivo. Contacta al administrador' });
    }

    const passwordValido = await user.compararPassword(password);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    // Registrar sesion
    const ahora = new Date();
    user.ultimoLogin = user.loginActual || null;
    user.loginActual = ahora;
    await user.save();

    const token = generarToken(user);

    return res.json({
      token,
      perfil: user.toProfile(),
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.resetearPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaPassword } = req.body;

    if (!nuevaPassword || nuevaPassword.length < 6) {
      return res.status(400).json({ 
        error: 'La nueva contraseña debe tener al menos 6 caracteres' 
      });
    }

    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Nadie puede resetear la contraseña de un ADMIN
    if (usuario.rol === 'ADMIN') {
      return res.status(403).json({ 
        error: 'No se puede modificar la contraseña de un administrador' 
      });
    }

    // JEFE_AREA solo puede resetear contraseñas de usuarios que él creó
    if (req.user.rol === 'JEFE_AREA') {
      const fueCreado = usuario.creadoPor?.toString() === req.user.uid;
      if (!fueCreado) {
        return res.status(403).json({ 
          error: 'Solo puedes modificar la contraseña de usuarios que tú registraste' 
        });
      }
    }

    const salt = await bcrypt.genSalt(12);
    usuario.passwordHash = await bcrypt.hash(nuevaPassword, salt);
    await usuario.save();

    return res.json({ 
      mensaje: `Contraseña actualizada para ${usuario.nombre} ${usuario.apellidos}` 
    });
  } catch (error) {
    console.error('Error reseteando contraseña:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.perfil = async (req, res) => {
  try {
    return res.json({ perfil: req.user.doc.toProfile() });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

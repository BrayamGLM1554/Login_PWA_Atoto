const jwt = require('jsonwebtoken');

// Calcula expiración de Lunes a Sabado (6 dias)
const getTokenExpiration = () => {
  const now = new Date();
  const dia = now.getDay(); // 0=Dom, 1=Lun ... 6=Sab
  
  // Si es domingo (0), el token expira el sabado siguiente (6 dias)
  // Si es cualquier otro dia, expira en 6 dias naturales
  const exp = new Date(now);
  exp.setDate(exp.getDate() + 6);
  
  // Asegurar que no expire en domingo - ajustar al sabado
  if (exp.getDay() === 0) {
    exp.setDate(exp.getDate() - 1);
  }
  
  // Expirar a las 23:59 del dia calculado
  exp.setHours(23, 59, 59, 0);
  
  return Math.floor(exp.getTime() / 1000);
};

const generarToken = (user) => {
  const exp = getTokenExpiration();
  
  return jwt.sign(
    {
      uid: user._id,
      rol: user.rol,
      areas: user.areasPermitidas,
      exp,
    },
    process.env.JWT_SECRET
  );
};

const verificarToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generarToken, verificarToken };

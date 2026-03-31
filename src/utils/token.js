const jwt = require('jsonwebtoken');

const activityStore = new Map(); // { jti -> lastActivity (timestamp ms) }

const INACTIVITY_LIMIT_MS = 10 * 60 * 1000; // 10 minutos

const generarJti = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

// ─── Genera token sin expiración fija ───────────────────────────────────────
const generarToken = (user) => {
  const jti = generarJti();

  const token = jwt.sign(
    {
      uid: user._id,
      rol: user.rol,
      areas: user.areasPermitidas,
      jti,
    },
    process.env.JWT_SECRET
    // Sin exp — la expiración la maneja el activityStore
  );

  activityStore.set(jti, Date.now());

  return token;
};

// ─── Verifica token + inactividad ───────────────────────────────────────────
const verificarToken = (token) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET);

  const lastActivity = activityStore.get(payload.jti);

  if (!lastActivity) {
    throw new Error('Sesión no encontrada o ya cerrada');
  }

  if (Date.now() - lastActivity > INACTIVITY_LIMIT_MS) {
    activityStore.delete(payload.jti);
    throw new Error('Sesión expirada por inactividad');
  }

  // Renueva el timer en cada request
  activityStore.set(payload.jti, Date.now());

  return payload;
};

// ─── Cierre de sesión explícito ─────────────────────────────────────────────
const revocarToken = (token) => {
  try {
    const payload = jwt.decode(token);
    if (payload?.jti) activityStore.delete(payload.jti);
  } catch (_) {}
};

module.exports = { generarToken, verificarToken, revocarToken };
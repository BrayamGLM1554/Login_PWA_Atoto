const router = require('express').Router();
const {
  subirHojaMembretada,
  listarHojasMembretadas,
  obtenerHojasPorArea,
  obtenerHojaMembretada,
  eliminarHojaMembretada,
} = require('../controllers/membretadasController');

const { authMiddleware, puedeGestionarMembretadas, areaGuard } = require('../middleware/auth');
const { uploadMembretada } = require('../config/cloudinary');

router.use(authMiddleware);

// ── Lectura — todos los roles autenticados ───────────────────────────────────
router.get('/',              listarHojasMembretadas);
router.get('/area/:areaId',  obtenerHojasPorArea);
router.get('/:id',           obtenerHojaMembretada);

// ── Subir — solo ADMIN y JEFE_AREA ───────────────────────────────────────────
// Orden: verificar rol → subir archivo → validar y normalizar areaId
router.post(
  '/',
  puedeGestionarMembretadas,
  uploadMembretada.single('archivo'),
  areaGuard(true),
  subirHojaMembretada
);

// ── Eliminar — solo ADMIN y JEFE_AREA ────────────────────────────────────────
router.delete('/:id', puedeGestionarMembretadas, eliminarHojaMembretada);

module.exports = router;
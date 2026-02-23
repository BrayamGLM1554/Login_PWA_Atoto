const router = require('express').Router();
const { listarRegistros, crearRegistro, obtenerRegistro } = require('../controllers/registrosController');
const { authMiddleware, areaGuard } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', listarRegistros);
router.post('/', areaGuard(true), crearRegistro);
router.get('/:id', obtenerRegistro);

module.exports = router;

const Registro = require('../models/Registro');

exports.listarRegistros = async (req, res) => {
  try {
    const { page = 1, limit = 20, areaId } = req.query;
    const skip = (page - 1) * limit;

    let filtro = {};

    if (req.user.rol === 'ADMIN') {
      if (areaId) filtro.areaId = areaId;
    } else {
      // Usuarios solo ven sus areas
      filtro.areaId = { $in: req.user.areas };
      if (areaId && req.user.areas.includes(areaId)) {
        filtro.areaId = areaId;
      }
    }

    const [registros, total] = await Promise.all([
      Registro.find(filtro)
        .populate('creadoPor', 'nombre apellidos email puesto')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Registro.countDocuments(filtro),
    ]);

    return res.json({
      registros,
      paginacion: {
        total,
        pagina: Number(page),
        paginas: Math.ceil(total / limit),
        limite: Number(limit),
      },
    });
  } catch (error) {
    console.error('Error listando registros:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.crearRegistro = async (req, res) => {
  try {
    // areaGuard ya valido el acceso al area
    const { areaId, data } = req.body;

    if (!areaId || !data) {
      return res.status(400).json({ error: 'areaId y data son requeridos' });
    }

    const registro = new Registro({
      areaId,
      creadoPor: req.user.uid, // backend controla este campo
      data,
    });

    await registro.save();
    await registro.populate('creadoPor', 'nombre apellidos email puesto');

    return res.status(201).json({
      mensaje: 'Registro creado exitosamente',
      registro,
    });
  } catch (error) {
    console.error('Error creando registro:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.obtenerRegistro = async (req, res) => {
  try {
    const registro = await Registro.findById(req.params.id)
      .populate('creadoPor', 'nombre apellidos email puesto');

    if (!registro) return res.status(404).json({ error: 'Registro no encontrado' });

    // Validar acceso al area
    if (req.user.rol !== 'ADMIN' && !req.user.areas.includes(registro.areaId)) {
      return res.status(403).json({ error: 'No tienes acceso a este registro' });
    }

    return res.json({ registro });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

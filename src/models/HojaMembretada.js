const mongoose = require('mongoose');

const hojaMembretadaSchema = new mongoose.Schema(
  {
    areaId: { type: String, required: true, trim: true, index: true },
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true, default: '' },
    archivo: {
      url:        { type: String, required: true }, // URL original (pdf o imagen)
      previewUrl: { type: String, default: null },  // URL de preview como imagen (jpg)
      publicId:   { type: String, required: true },
      formato:    { type: String },
      bytes:      { type: Number },
    },
    activa:    { type: Boolean, default: true, index: true },
    subidaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

hojaMembretadaSchema.index({ areaId: 1, activa: 1, createdAt: -1 });

module.exports = mongoose.model('HojaMembretada', hojaMembretadaSchema, 'hojas_membretadas');

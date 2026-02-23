const mongoose = require('mongoose');

const registroSchema = new mongoose.Schema({
  areaId: { type: String, required: true, trim: true },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

registroSchema.index({ areaId: 1 });
registroSchema.index({ creadoPor: 1 });

module.exports = mongoose.model('Registro', registroSchema, 'registros');

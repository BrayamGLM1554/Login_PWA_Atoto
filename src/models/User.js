const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Mapa de puestos a roles
const PUESTO_ROL_MAP = {
  'jefe de area': 'JEFE_AREA',
  'jefe de área': 'JEFE_AREA',
  'director': 'JEFE_AREA',
  'coordinador': 'JEFE_AREA',
  'empleado': 'EMPLEADO',
  'asistente': 'ASISTENTE',
  'operativo': 'EMPLEADO',
};

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellidos: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  rol: { type: String, enum: ['ADMIN', 'JEFE_AREA', 'EMPLEADO', 'ASISTENTE'], default: 'EMPLEADO' },
  puesto: { type: String, required: true, trim: true },
  areasPermitidas: { type: [String], default: [] },
  avatar: {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
  },
  activo: { type: Boolean, default: true },
  ultimoLogin: { type: Date, default: null },
  loginActual: { type: Date, default: null },
  // Quien registro a este usuario (null si fue el seed/admin inicial)
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

// Derivar rol del puesto automáticamente (si no es ADMIN)
userSchema.pre('save', function (next) {
  if (this.rol !== 'ADMIN') {
    const puestoLower = this.puesto.toLowerCase();
    this.rol = PUESTO_ROL_MAP[puestoLower] || 'EMPLEADO';
  }
  next();
});

userSchema.methods.compararPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toProfile = function () {
  return {
    id: this._id,
    nombre: this.nombre,
    apellidos: this.apellidos,
    nombreCompleto: `${this.nombre} ${this.apellidos}`,
    email: this.email,
    rol: this.rol,
    puesto: this.puesto,
    areasPermitidas: this.areasPermitidas,
    avatar: this.avatar?.url || null,
    activo: this.activo,
    ultimoLogin: this.ultimoLogin,
    loginActual: this.loginActual,
    createdAt: this.createdAt,
    creadoPor: this.creadoPor || null,
  };
};

module.exports = mongoose.model('User', userSchema, 'users');
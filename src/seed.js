require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Import after connecting
  const User = require('./models/User');
  
  const adminExiste = await User.findOne({ rol: 'ADMIN' });
  if (adminExiste) {
    console.log('✅ Ya existe un administrador:', adminExiste.email);
    process.exit(0);
  }
  
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  
  // Usar insertOne para saltarse los hooks y forzar rol ADMIN
  const result = await User.collection.insertOne({
    nombre: 'Super',
    apellidos: 'Admin',
    email: 'admin@municipio.gob.mx',
    passwordHash,
    puesto: 'Administrador del Sistema',
    rol: 'ADMIN',
    areasPermitidas: [],
    activo: true,
    ultimoLogin: null,
    loginActual: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  console.log('✅ Admin creado exitosamente - ID:', result.insertedId);
  console.log('   Email: admin@municipio.gob.mx');
  console.log('   Password: Admin123!');
  console.log('   ⚠️  CAMBIA LA CONTRASEÑA EN PRODUCCION');
  
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

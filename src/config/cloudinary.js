const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer guarda el archivo en memoria (Buffer), luego lo subimos
// manualmente al SDK de Cloudinary v2 — sin dependencias con conflictos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imagenes'), false);
    }
  },
});

// Helper para subir un buffer a Cloudinary
const subirACloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'auth-api/avatars',
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });

    stream.end(buffer);
  });
};

module.exports = { cloudinary, upload, subirACloudinary };

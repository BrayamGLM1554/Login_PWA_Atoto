const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** Solo imágenes, máx 5 MB — para avatares */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imagenes'), false);
    }
  },
});

/** Imágenes Y PDF, máx 10 MB — para hojas membretadas */
const uploadMembretada = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const permitidos = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (permitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpg, png, webp) o PDF'), false);
    }
  },
});

/** Sube un buffer a Cloudinary — avatares */
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

/**
 * Sube una hoja membretada (imagen o PDF) a Cloudinary.
 *
 * Tanto imágenes como PDFs usan resource_type: 'image'.
 * Esto permite que Cloudinary procese el PDF y genere una
 * vista previa visual de la primera página.
 *
 * El resultado incluye un campo extra `previewUrl` listo para
 * usar en un <img> del frontend — para PDFs es la URL con
 * extensión .jpg que Cloudinary sirve automáticamente.
 */
const subirMembretadaACloudinary = (buffer, areaId, options = {}) => {
  return new Promise((resolve, reject) => {
    const esPDF = options._esPDF === true;
    delete options._esPDF;

    const uploadOptions = {
      folder: `auth-api/membretadas/${areaId}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
      // resource_type 'image' habilita transformaciones y preview
      // tanto para imágenes normales como para PDFs
      resource_type: 'image',
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        reject(error);
      } else {
        // previewUrl: URL lista para mostrar en <img> sin config extra
        // Para PDFs Cloudinary sirve la primera página como imagen
        // simplemente cambiando la extensión en la URL
        result.previewUrl = esPDF
          ? result.secure_url.replace(/\.pdf$/i, '.jpg')
          : result.secure_url;

        resolve(result);
      }
    });

    stream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  upload,
  uploadMembretada,
  subirACloudinary,
  subirMembretadaACloudinary,
};
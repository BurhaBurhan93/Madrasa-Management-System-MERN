const multer = require('multer');

// Memory storage - files are stored in memory as Buffer objects
// This works perfectly with GridFS for MongoDB Atlas uploads
const storage = multer.memoryStorage();

// File filter - only allow images by default
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg|bmp|ico/;
  const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('image/');

  if (extname || mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, svg, bmp, ico)'), false);
  }
};

// General file filter - allows images and documents
const generalFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

// Upload middleware for single image (max 5MB)
const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
});

// Upload middleware for multiple images (max 10 files, 5MB each)
const uploadImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 10,
  },
});

// Upload middleware for documents (max 10MB)
const uploadDocument = multer({
  storage,
  fileFilter: generalFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
});

// Upload middleware for multiple documents (max 10 files, 10MB each)
const uploadDocuments = multer({
  storage,
  fileFilter: generalFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
});

module.exports = {
  uploadImage,
  uploadImages,
  uploadDocument,
  uploadDocuments,
  storage,
  imageFileFilter,
  generalFileFilter,
};

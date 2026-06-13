const express = require('express');
const router = express.Router();
const { uploadImage, uploadImages, uploadDocument, uploadDocuments } = require('../../config/multer');
const uploadController = require('./uploadController');

// Image routes
router.post('/image', uploadImage.single('image'), uploadController.uploadImage);
router.post('/images', uploadImages.array('images', 10), uploadController.uploadImages);

// Document routes
router.post('/document', uploadDocument.single('document'), uploadController.uploadDocument);
router.post('/documents', uploadDocuments.array('documents', 10), uploadController.uploadDocuments);

// File retrieval & deletion
router.get('/files/:fileId', uploadController.getFile);
router.get('/files/:fileId/info', uploadController.getFileInfo);
router.delete('/files/:fileId', uploadController.deleteFile);

module.exports = router;

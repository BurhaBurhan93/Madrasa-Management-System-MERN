const gridfsService = require('../../services/gridfsService');

/**
 * Upload a single image
 * POST /api/uploads/image
 */
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await gridfsService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      {
        uploadedBy: req.user?.id || 'anonymous',
        category: req.body.category || 'general',
      }
    );

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: result,
    });
  } catch (error) {
    console.error('[Upload] Error uploading image:', error);
    res.status(500).json({ success: false, message: 'Error uploading image', error: error.message });
  }
};

/**
 * Upload multiple images
 * POST /api/uploads/images
 */
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const results = await gridfsService.uploadMultipleFiles(
      req.files,
      {
        uploadedBy: req.user?.id || 'anonymous',
        category: req.body.category || 'general',
      }
    );

    res.status(201).json({
      success: true,
      message: `${results.length} images uploaded successfully`,
      data: results,
    });
  } catch (error) {
    console.error('[Upload] Error uploading images:', error);
    res.status(500).json({ success: false, message: 'Error uploading images', error: error.message });
  }
};

/**
 * Upload a document (PDF, DOC, etc.)
 * POST /api/uploads/document
 */
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await gridfsService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      {
        uploadedBy: req.user?.id || 'anonymous',
        category: req.body.category || 'document',
      }
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: result,
    });
  } catch (error) {
    console.error('[Upload] Error uploading document:', error);
    res.status(500).json({ success: false, message: 'Error uploading document', error: error.message });
  }
};

/**
 * Upload multiple documents
 * POST /api/uploads/documents
 */
exports.uploadDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const results = await gridfsService.uploadMultipleFiles(
      req.files,
      {
        uploadedBy: req.user?.id || 'anonymous',
        category: req.body.category || 'document',
      }
    );

    res.status(201).json({
      success: true,
      message: `${results.length} documents uploaded successfully`,
      data: results,
    });
  } catch (error) {
    console.error('[Upload] Error uploading documents:', error);
    res.status(500).json({ success: false, message: 'Error uploading documents', error: error.message });
  }
};

/**
 * Get/serve a file from GridFS
 * GET /api/uploads/files/:fileId
 */
exports.getFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const result = await gridfsService.getFileStream(fileId);

    if (!result) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const { stream, file } = result;

    res.set({
      'Content-Type': file.contentType,
      'Content-Length': file.length,
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'Cache-Control': 'public, max-age=31536000',
    });

    stream.pipe(res);
  } catch (error) {
    console.error('[Upload] Error getting file:', error);
    res.status(500).json({ success: false, message: 'Error retrieving file', error: error.message });
  }
};

/**
 * Get file info (metadata) without downloading
 * GET /api/uploads/files/:fileId/info
 */
exports.getFileInfo = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await gridfsService.getFileInfo(fileId);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        fileId: file._id.toString(),
        filename: file.filename,
        mimetype: file.contentType,
        size: file.length,
        uploadDate: file.uploadDate,
        metadata: file.metadata,
      },
    });
  } catch (error) {
    console.error('[Upload] Error getting file info:', error);
    res.status(500).json({ success: false, message: 'Error getting file info', error: error.message });
  }
};

/**
 * Delete a file from GridFS
 * DELETE /api/uploads/files/:fileId
 */
exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    await gridfsService.deleteFile(fileId);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('[Upload] Error deleting file:', error);
    res.status(500).json({ success: false, message: 'Error deleting file', error: error.message });
  }
};

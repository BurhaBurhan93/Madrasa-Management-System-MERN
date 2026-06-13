const mongoose = require('mongoose');
const { GridFSBucket, ObjectId } = require('mongodb');

let gfsBucket;

/**
 * Initialize GridFS bucket - call once after DB connection
 */
const initGridFS = () => {
  if (!gfsBucket) {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('MongoDB connection not established. Call initGridFS after connectDB.');
    }
    gfsBucket = new GridFSBucket(db, { bucketName: 'uploads' });
    console.log('[GridFS] ✅ GridFS bucket initialized (bucket: uploads)');
  }
  return gfsBucket;
};

/**
 * Get the GridFS bucket instance
 */
const getBucket = () => {
  if (!gfsBucket) initGridFS();
  return gfsBucket;
};

/**
 * Upload a file buffer to GridFS
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {string} filename - Original filename
 * @param {string} mimetype - MIME type
 * @param {object} metadata - Optional metadata (e.g., { userId, category })
 * @returns {Promise<object>} - { fileId, filename, mimetype, size, url }
 */
const uploadFile = (buffer, filename, mimetype, metadata = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const bucket = getBucket();
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: mimetype,
        metadata: {
          ...metadata,
          uploadedAt: new Date(),
        },
      });

      uploadStream.on('finish', () => {
        resolve({
          fileId: uploadStream.id.toString(),
          filename,
          mimetype,
          size: buffer.length,
          url: `/api/uploads/files/${uploadStream.id.toString()}`,
        });
      });

      uploadStream.on('error', (err) => {
        reject(err);
      });

      uploadStream.end(buffer);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Upload multiple files to GridFS
 * @param {Array} files - Array of multer file objects [{ buffer, originalname, mimetype }]
 * @param {object} metadata - Optional metadata
 * @returns {Promise<Array>} - Array of uploaded file info
 */
const uploadMultipleFiles = async (files, metadata = {}) => {
  const results = [];
  for (const file of files) {
    const result = await uploadFile(file.buffer, file.originalname, file.mimetype, metadata);
    results.push(result);
  }
  return results;
};

/**
 * Get a file stream from GridFS by fileId
 * @param {string} fileId - GridFS file ObjectId string
 * @returns {object} - { stream, file } where file has metadata
 */
const getFileStream = async (fileId) => {
  const bucket = getBucket();
  const objectId = new ObjectId(fileId);

  // Get file info
  const files = await bucket.find({ _id: objectId }).toArray();
  if (!files || files.length === 0) {
    return null;
  }

  const file = files[0];
  const stream = bucket.openDownloadStream(objectId);
  return { stream, file };
};

/**
 * Delete a file from GridFS
 * @param {string} fileId - GridFS file ObjectId string
 */
const deleteFile = async (fileId) => {
  const bucket = getBucket();
  const objectId = new ObjectId(fileId);
  await bucket.delete(objectId);
};

/**
 * Get file info without downloading
 * @param {string} fileId - GridFS file ObjectId string
 */
const getFileInfo = async (fileId) => {
  const bucket = getBucket();
  const objectId = new ObjectId(fileId);
  const files = await bucket.find({ _id: objectId }).toArray();
  return files.length > 0 ? files[0] : null;
};

module.exports = {
  initGridFS,
  getBucket,
  uploadFile,
  uploadMultipleFiles,
  getFileStream,
  deleteFile,
  getFileInfo,
};

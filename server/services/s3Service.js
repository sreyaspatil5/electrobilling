const {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/s3');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');

const BUCKET = process.env.S3_BUCKET_NAME;
const BASE_URL = process.env.S3_BASE_URL;

/**
 * Upload a Buffer directly to S3 (used for Puppeteer-generated PDFs)
 */
const uploadBuffer = async (buffer, key, contentType = 'application/pdf') => {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Make publicly accessible (adjust bucket policy accordingly)
    });
    await s3Client.send(command);
    const url = `${BASE_URL}/${key}`;
    logger.info(`S3 upload success: ${key}`);
    return { url, key };
  } catch (err) {
    logger.error(`S3 upload failed for key ${key}:`, err);
    throw new Error(`S3 upload failed: ${err.message}`);
  }
};

/**
 * Generate a pre-signed PUT URL for direct browser-to-S3 upload.
 * @param {string} fileName - Original file name
 * @param {string} fileType - MIME type
 * @param {string} folder - S3 folder prefix (e.g. 'logos', 'signatures')
 * @returns {{ uploadUrl, fileKey, publicUrl }}
 */
const getPresignedUploadUrl = async (fileName, fileType, folder = 'uploads') => {
  const ext = fileName.split('.').pop();
  const fileKey = `${folder}/${uuidv4()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileKey,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 min
  const publicUrl = `${BASE_URL}/${fileKey}`;

  logger.info(`Pre-signed URL generated for: ${fileKey}`);
  return { uploadUrl, fileKey, publicUrl };
};

/**
 * Delete an object from S3 by key.
 */
const deleteFile = async (fileKey) => {
  if (!fileKey) return;
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: fileKey }));
    logger.info(`S3 delete success: ${fileKey}`);
  } catch (err) {
    logger.warn(`S3 delete failed for ${fileKey}:`, err);
  }
};

/**
 * Get a temporary signed download URL (for private buckets)
 */
const getDownloadUrl = async (fileKey, expiresIn = 3600) => {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: fileKey });
  return getSignedUrl(s3Client, command, { expiresIn });
};

module.exports = { uploadBuffer, getPresignedUploadUrl, deleteFile, getDownloadUrl };

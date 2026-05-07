const { S3Client } = require('@aws-sdk/client-s3');
const logger = require('./logger');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

logger.info(`S3 client initialized for region: ${process.env.AWS_REGION}`);

module.exports = s3Client;

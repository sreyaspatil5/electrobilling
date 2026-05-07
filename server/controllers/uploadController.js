const { getPresignedUploadUrl } = require('../services/s3Service');
const logger = require('../config/logger');

// POST /api/upload/presign
// Body: { fileName, fileType, folder }
exports.getPresignedUrl = async (req, res, next) => {
  try {
    const { fileName, fileType, folder = 'uploads' } = req.body;
    if (!fileName || !fileType) {
      return res.status(400).json({ success: false, message: 'fileName and fileType are required' });
    }

    const result = await getPresignedUploadUrl(fileName, fileType, folder);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

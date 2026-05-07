const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/uploadController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const presignRules = [
  body('fileName').notEmpty().withMessage('fileName required'),
  body('fileType').notEmpty().withMessage('fileType required'),
];

router.post('/presign', auth, presignRules, validate, ctrl.getPresignedUrl);

module.exports = router;

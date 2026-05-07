const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/emailController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const sendRules = [
  body('invoiceId').isMongoId().withMessage('Valid invoice ID required'),
  body('recipientEmail').optional().isEmail().withMessage('Valid email required'),
];

router.post('/send', auth, sendRules, validate, ctrl.sendEmail);

module.exports = router;

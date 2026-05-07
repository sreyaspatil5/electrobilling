const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/businessController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const updateRules = [
  body('businessName').optional().trim().notEmpty().withMessage('Business name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('defaultTaxRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax rate 0–100'),
];

router.get('/', auth, ctrl.getBusiness);
router.put('/', auth, updateRules, validate, ctrl.updateBusiness);

module.exports = router;

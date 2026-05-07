const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const ctrl = require('../controllers/invoiceController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const createRules = [
  body('customerId').isMongoId().withMessage('Valid customer ID required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.name').notEmpty().withMessage('Item name required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  body('finalTotal').isFloat({ min: 0 }).withMessage('Final total must be non-negative'),
];

router.get('/stats', auth, ctrl.getStats);
router.get('/reports', auth, ctrl.getReports);
router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, param('id').isMongoId(), validate, ctrl.getOne);
router.post('/', auth, createRules, validate, ctrl.create);
router.patch(
  '/:id/payment-status',
  auth,
  param('id').isMongoId().withMessage('Invalid invoice ID'),
  body('paymentStatus').isIn(['unpaid', 'partial', 'paid']).withMessage('Must be unpaid, partial, or paid'),
  validate,
  ctrl.updatePaymentStatus
);
router.delete('/:id', auth, param('id').isMongoId(), validate, ctrl.remove);

module.exports = router;

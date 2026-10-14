const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const ctrl = require('../controllers/productController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const createRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().isLength({ min: 1, max: 60 }).withMessage('Category must be between 1 and 60 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('unit').trim().isLength({ min: 1, max: 30 }).withMessage('Unit must be between 1 and 30 characters'),
];

const updateRules = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('category').optional().trim().isLength({ min: 1, max: 60 }).withMessage('Category must be between 1 and 60 characters'),
  body('unit').optional().trim().isLength({ min: 1, max: 30 }).withMessage('Unit must be between 1 and 30 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be non-negative'),
];

router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, param('id').isMongoId(), validate, ctrl.getOne);
router.post('/', auth, createRules, validate, ctrl.create);
router.put('/:id', auth, updateRules, validate, ctrl.update);
router.delete('/:id', auth, param('id').isMongoId(), validate, ctrl.remove);
router.patch('/:id/stock', auth, param('id').isMongoId(), validate, ctrl.adjustStock);

module.exports = router;

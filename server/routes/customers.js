const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const ctrl = require('../controllers/customerController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const createRules = [
  body('name').trim().notEmpty().withMessage('Customer name is required'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('phone').optional().trim(),
];

const updateRules = [
  param('id').isMongoId().withMessage('Invalid customer ID'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email required'),
];

router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, param('id').isMongoId(), validate, ctrl.getOne);
router.post('/', auth, createRules, validate, ctrl.create);
router.put('/:id', auth, updateRules, validate, ctrl.update);
router.delete('/:id', auth, param('id').isMongoId(), validate, ctrl.remove);

module.exports = router;

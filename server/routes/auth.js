const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const validate = require('../middleware/validate');
const { auth, isSuperAdmin } = require('../middleware/auth');

const loginRules = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

router.post('/login', loginRules, validate, ctrl.login);
router.post('/register', registerRules, validate, ctrl.register);
router.get('/me', auth, ctrl.getMe);
router.get('/pending-users', auth, isSuperAdmin, ctrl.getPendingUsers);
router.get('/admins', auth, isSuperAdmin, ctrl.getAdmins);
router.put('/approve/:userId', auth, isSuperAdmin, ctrl.approveUser);
router.delete('/reject/:userId', auth, isSuperAdmin, ctrl.rejectUser);

module.exports = router;

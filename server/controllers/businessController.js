const Business = require('../models/Business');
const logger = require('../config/logger');

// GET /api/business
exports.getBusiness = async (req, res, next) => {
  try {
    let business = await Business.findOne({ adminId: req.user._id });
    if (!business) {
      business = await Business.create({ businessName: 'My Business', adminId: req.user._id });
    }
    res.json({ success: true, data: business });
  } catch (err) {
    next(err);
  }
};

// PUT /api/business
exports.updateBusiness = async (req, res, next) => {
  try {
    const allowed = [
      'businessName', 'address', 'city', 'state', 'pincode', 'phone', 'email',
      'website', 'gstNumber', 'panNumber', 'logoUrl', 'signatureUrl', 'defaultTaxRate',
      'invoicePrefix', 'bankName', 'accountNumber', 'ifscCode', 'upiId', 'defaultNotes', 'currency',
    ];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    const business = await Business.findOneAndUpdate({ adminId: req.user._id }, updates, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    logger.info('Business profile updated');
    res.json({ success: true, data: business });
  } catch (err) {
    next(err);
  }
};

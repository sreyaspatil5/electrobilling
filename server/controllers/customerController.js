const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');

// GET /api/customers
exports.getAll = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const query = { isActive: true, adminId: req.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { gstNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Customer.countDocuments(query),
    ]);

    res.json({ success: true, data: customers, total, page: Number(page) });
  } catch (err) {
    next(err);
  }
};

// GET /api/customers/:id
exports.getOne = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, adminId: req.user._id });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

// POST /api/customers
exports.create = async (req, res, next) => {
  try {
    req.body.adminId = req.user._id;
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

// PUT /api/customers/:id
exports.update = async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndUpdate({ _id: req.params.id, adminId: req.user._id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/customers/:id (soft delete)
exports.remove = async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    next(err);
  }
};

const Product = require('../models/Product');

// GET /api/products
exports.getAll = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 100 } = req.query;
    const query = { isActive: true, adminId: req.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'all') query.category = category;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({ success: true, data: products, total, page: Number(page) });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
exports.getOne = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, adminId: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// POST /api/products
exports.create = async (req, res, next) => {
  try {
    req.body.adminId = req.user._id;
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
exports.update = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate({ _id: req.params.id, adminId: req.user._id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
exports.remove = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/products/:id/stock  — adjust stock
exports.adjustStock = async (req, res, next) => {
  try {
    const { delta } = req.body; // positive or negative
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user._id },
      { $inc: { stock: delta } },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

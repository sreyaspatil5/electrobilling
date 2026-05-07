const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Business = require('../models/Business');
const Counter = require('../models/Counter');
const { generateInvoicePDF } = require('../services/pdfService');
const { uploadBuffer } = require('../services/s3Service');
const logger = require('../config/logger');

// GET /api/invoices
exports.getAll = async (req, res, next) => {
  try {
    const { customer, startDate, endDate, status = 'active', page = 1, limit = 20 } = req.query;
    const query = { status, adminId: req.user._id };

    if (customer) query.customer = customer;
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.invoiceDate.$lte = end;
      }
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate('customer', 'name phone email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Invoice.countDocuments(query),
    ]);

    res.json({ success: true, data: invoices, total, page: Number(page) });
  } catch (err) {
    next(err);
  }
};

// GET /api/invoices/:id
exports.getOne = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, adminId: req.user._id }).populate('customer');
    if (!invoice || invoice.status === 'deleted') {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

// POST /api/invoices  — create + generate PDF + upload to S3
exports.create = async (req, res, next) => {
  try {
    const { customerId, items, subtotal, discountPercent, discountAmount,
            taxType, cgst, sgst, igst, taxTotal, finalTotal, notes,
            invoiceDate, dueDate, paymentStatus = 'unpaid' } = req.body;

    // 1. Fetch business + customer
    const [business, customer] = await Promise.all([
      Business.findOne({ adminId: req.user._id }),
      Customer.findOne({ _id: customerId, adminId: req.user._id }),
    ]);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    // 2. Atomic invoice number
    const counter = await Counter.nextValue(req.user._id, 'invoice');
    const prefix = business?.invoicePrefix || 'INV';
    const year = new Date().getFullYear();
    const invoiceNumber = `${prefix}-${year}-${String(counter).padStart(4, '0')}`;

    // 3. Build customer snapshot
    const customerSnapshot = {
      name: customer.name, phone: customer.phone, email: customer.email,
      address: customer.address, city: customer.city, state: customer.state,
      gstNumber: customer.gstNumber,
    };

    // 4. Create invoice doc (initially without fileUrl)
    const invoice = new Invoice({
      adminId: req.user._id, invoiceNumber, customer: customerId, customerSnapshot, items,
      subtotal, discountPercent, discountAmount, taxType,
      cgst, sgst, igst, taxTotal, finalTotal, notes,
      invoiceDate: invoiceDate || new Date(),
      dueDate,
      paymentStatus,
    });

    // 5. Generate PDF via Puppeteer
    const pdfBuffer = await generateInvoicePDF({ business, invoice: invoice.toObject() });

    // 6. Upload to S3
    const s3Key = `invoices/${invoiceNumber}.pdf`;
    const { url: fileUrl } = await uploadBuffer(pdfBuffer, s3Key, 'application/pdf');

    // 7. Save URL in invoice
    invoice.fileUrl = fileUrl;
    invoice.fileKey = s3Key;
    invoice.fileType = 'pdf';
    await invoice.save();

    // 8. Decrement product stock
    await Promise.all(
      items
        .filter((item) => item.product)
        .map((item) =>
          Product.findOneAndUpdate({ _id: item.product, adminId: req.user._id }, { $inc: { stock: -item.quantity } })
        )
    );

    logger.info(`Invoice created: ${invoiceNumber} | Total: ${finalTotal} | Status: ${paymentStatus}`);
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/invoices/:id/payment-status  — toggle paid/unpaid
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    const validStatuses = ['unpaid', 'partial', 'paid'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Use: unpaid, partial, paid' });
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, status: 'active', adminId: req.user._id },
      { paymentStatus },
      { new: true }
    ).populate('customer', 'name phone');

    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    logger.info(`Invoice ${invoice.invoiceNumber} payment status → ${paymentStatus}`);
    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/invoices/:id  — soft delete
exports.remove = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user._id },
      { status: 'deleted' },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    logger.info(`Invoice soft-deleted: ${invoice.invoiceNumber}`);
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/invoices/stats  — dashboard stats
exports.getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [daily, weekly, monthly, total, recentInvoices] = await Promise.all([
      Invoice.aggregate([
        { $match: { adminId: req.user._id, status: 'active', invoiceDate: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$finalTotal' }, count: { $sum: 1 } } },
      ]),
      Invoice.aggregate([
        { $match: { adminId: req.user._id, status: 'active', invoiceDate: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: '$finalTotal' }, count: { $sum: 1 } } },
      ]),
      Invoice.aggregate([
        { $match: { adminId: req.user._id, status: 'active', invoiceDate: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$finalTotal' }, count: { $sum: 1 } } },
      ]),
      Invoice.countDocuments({ adminId: req.user._id, status: 'active' }),
      Invoice.find({ adminId: req.user._id, status: 'active' })
        .populate('customer', 'name phone')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.json({
      success: true,
      data: {
        daily: daily[0] || { total: 0, count: 0 },
        weekly: weekly[0] || { total: 0, count: 0 },
        monthly: monthly[0] || { total: 0, count: 0 },
        totalInvoices: total,
        recentInvoices,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/invoices/reports  — charts data
exports.getReports = async (req, res, next) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;

    // Monthly sales for the year
    const monthlySales = await Invoice.aggregate([
      {
        $match: {
          adminId: req.user._id,
          status: 'active',
          invoiceDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$invoiceDate' } },
          total: { $sum: '$finalTotal' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Top customers
    const topCustomers = await Invoice.aggregate([
      { $match: { adminId: req.user._id, status: 'active' } },
      { $group: { _id: '$customer', total: { $sum: '$finalTotal' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
      { $unwind: '$customer' },
      { $project: { name: '$customer.name', total: 1, count: 1 } },
    ]);

    // Top products
    const topProducts = await Invoice.aggregate([
      { $match: { adminId: req.user._id, status: 'active' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', total: { $sum: '$items.total' }, qty: { $sum: '$items.quantity' } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);

    res.json({ success: true, data: { monthlySales, topCustomers, topProducts } });
  } catch (err) {
    next(err);
  }
};

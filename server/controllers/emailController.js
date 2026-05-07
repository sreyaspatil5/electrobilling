const { sendInvoiceEmail } = require('../services/emailService');
const Invoice = require('../models/Invoice');
const Business = require('../models/Business');
const logger = require('../config/logger');

// POST /api/email/send
exports.sendEmail = async (req, res, next) => {
  try {
    const { invoiceId, recipientEmail } = req.body;

    const [invoice, business] = await Promise.all([
      Invoice.findOne({ _id: invoiceId, adminId: req.user._id }).populate('customer', 'name email'),
      Business.findOne({ adminId: req.user._id }),
    ]);

    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    if (!invoice.fileUrl) return res.status(400).json({ success: false, message: 'Invoice PDF not found' });

    const to = recipientEmail || invoice.customer?.email;
    if (!to) return res.status(400).json({ success: false, message: 'No recipient email address' });

    await sendInvoiceEmail({
      to,
      customerName: invoice.customerSnapshot?.name || 'Customer',
      invoiceNumber: invoice.invoiceNumber,
      invoiceUrl: invoice.fileUrl,
      businessName: business?.businessName || 'Our Business',
      amount: invoice.finalTotal,
    });

    res.json({ success: true, message: `Invoice sent to ${to}` });
  } catch (err) {
    next(err);
  }
};

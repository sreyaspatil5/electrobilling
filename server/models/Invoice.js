const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    name: { type: String, required: true }, // snapshot at time of billing
    hsn: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, required: true, default: 18 },
    taxAmount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, min: 0 }, // incl. tax
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    invoiceNumber: {
      type: String,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    // Snapshot of customer at time of billing
    customerSnapshot: {
      name: String,
      phone: String,
      email: String,
      address: String,
      city: String,
      state: String,
      gstNumber: String,
    },
    items: [invoiceItemSchema],
    subtotal: { type: Number, required: true }, // pre-tax
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxType: { type: String, enum: ['CGST_SGST', 'IGST'], default: 'CGST_SGST' },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    finalTotal: { type: Number, required: true },
    notes: { type: String, trim: true },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    fileUrl: { type: String, default: null }, // S3 URL
    fileKey: { type: String, default: null }, // S3 key for deletion
    fileType: { type: String, enum: ['pdf', 'jpg'], default: 'pdf' },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
    },
    // Soft delete
    status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for dashboard queries
invoiceSchema.index({ adminId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ adminId: 1, createdAt: -1, status: 1 });
invoiceSchema.index({ adminId: 1, customer: 1, status: 1 });
invoiceSchema.index({ adminId: 1, invoiceDate: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);

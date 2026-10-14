const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    unit: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
      default: 'item',
    },
    taxRate: { type: Number, default: 18 }, // default GST %
    hsn: { type: String, trim: true }, // HSN code for GST
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
productSchema.index({ name: 'text', category: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ stock: 1 }); // for low-stock queries
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);

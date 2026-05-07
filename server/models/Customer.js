const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    gstNumber: { type: String, trim: true, uppercase: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for fast search
customerSchema.index({ name: 'text', phone: 'text', email: 'text' });
customerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Customer', customerSchema);

const mongoose = require('mongoose');

// Atomic counter for auto-incrementing invoice numbers
const counterSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  key: { type: String, required: true },
  value: { type: Number, default: 1000 },
});

counterSchema.index({ adminId: 1, key: 1 }, { unique: true });

// Static method for atomic increment
counterSchema.statics.nextValue = async function (adminId, key) {
  const doc = await this.findOneAndUpdate(
    { adminId, key },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return doc.value;
};

module.exports = mongoose.model('Counter', counterSchema);

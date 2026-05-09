const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  source: { type: String, default: 'manual' }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);

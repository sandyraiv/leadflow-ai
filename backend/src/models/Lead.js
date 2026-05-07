const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    index: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    index: true
  },
  area: {
    type: String,
    required: [true, 'Area is required'],
    index: true
  },
  address: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    default: 'manual'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
leadSchema.index({ city: 1, category: 1 });
leadSchema.index({ city: 1, area: 1 });
leadSchema.index({ category: 1, score: -1 });
leadSchema.index({ name: 'text', address: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
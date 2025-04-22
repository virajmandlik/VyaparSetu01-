const mongoose = require('mongoose');

const partnershipSchema = new mongoose.Schema({
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  retailer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field on save
partnershipSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Partnership = mongoose.model('Partnership', partnershipSchema);

module.exports = Partnership;

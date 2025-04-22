const mongoose = require('mongoose');

const productRequestSchema = new mongoose.Schema({
  partnership: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Partnership', 
    required: true 
  },
  products: [{
    sku: { 
      type: String, 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'fulfilled'], 
      default: 'pending' 
    }
  }],
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'fulfilled'], 
    default: 'pending' 
  },
  notes: { 
    type: String 
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
productRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const ProductRequest = mongoose.model('ProductRequest', productRequestSchema);

module.exports = ProductRequest;

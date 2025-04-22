const mongoose = require('mongoose');

const retailerSaleSchema = new mongoose.Schema({
  retailer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RetailerInventory', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  totalAmount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  date: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const RetailerSale = mongoose.model('RetailerSale', retailerSaleSchema);

module.exports = RetailerSale;

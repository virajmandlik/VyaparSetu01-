const mongoose = require('mongoose');

// Define schema with strict validation - using String type for IDs to avoid ObjectId issues
const retailerInventorySchema = new mongoose.Schema({
  retailer: {
    type: String,
    ref: 'User',
    required: true,
    index: true
  },
  sku: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  threshold: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  seller: {
    type: String,
    ref: 'User',
    required: true
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

// Add index for faster queries
retailerInventorySchema.index({ retailer: 1, sku: 1 }, { unique: true });

// Update the updatedAt field on save
retailerInventorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  console.log(`Saving retailer inventory: ${this._id}, Retailer: ${this.retailer}, SKU: ${this.sku}, Stock: ${this.stock}`);
  next();
});

// Log when a new document is created
retailerInventorySchema.post('save', function(doc) {
  console.log(`Retailer inventory saved successfully: ${doc._id}, Retailer: ${doc.retailer}, Stock: ${doc.stock}`);
});

const RetailerInventory = mongoose.model('RetailerInventory', retailerInventorySchema);

module.exports = RetailerInventory;

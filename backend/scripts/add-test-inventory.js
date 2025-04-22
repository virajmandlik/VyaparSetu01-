const mongoose = require('mongoose');
const RetailerInventory = require('../src/models/RetailerInventory');
const User = require('../src/models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Add test inventory item
async function addTestInventory(retailerEmail, sellerEmail) {
  try {
    // Find the retailer
    const retailer = await User.findOne({ email: retailerEmail, role: 'buyer' });
    if (!retailer) {
      console.error(`Retailer with email ${retailerEmail} not found`);
      process.exit(1);
    }
    
    // Find the seller
    const seller = await User.findOne({ email: sellerEmail, role: 'seller' });
    if (!seller) {
      console.error(`Seller with email ${sellerEmail} not found`);
      process.exit(1);
    }
    
    console.log(`Adding test inventory for retailer: ${retailer.name} (${retailer._id})`);
    console.log(`Seller: ${seller.name} (${seller._id})`);
    
    // Create test inventory item
    const testItem = {
      retailer: retailer._id,
      sku: 'TEST001',
      name: 'Test Product',
      category: 'Test Category',
      price: 99.99,
      stock: 50,
      threshold: 10,
      seller: seller._id
    };
    
    // Check if item already exists
    const existingItem = await RetailerInventory.findOne({ 
      retailer: retailer._id,
      sku: testItem.sku
    });
    
    if (existingItem) {
      console.log(`Test item already exists, updating stock...`);
      existingItem.stock += 10;
      await existingItem.save();
      console.log(`Updated test item stock to ${existingItem.stock}`);
    } else {
      console.log(`Creating new test inventory item...`);
      const newItem = new RetailerInventory(testItem);
      await newItem.save();
      console.log(`Created test inventory item with ID: ${newItem._id}`);
    }
    
    // Verify the item exists
    const verifyItem = await RetailerInventory.findOne({ 
      retailer: retailer._id,
      sku: testItem.sku
    });
    
    if (verifyItem) {
      console.log(`Verification successful! Item exists with stock: ${verifyItem.stock}`);
    } else {
      console.error(`Verification failed! Item not found after save!`);
    }
    
    // List all inventory items for this retailer
    const allItems = await RetailerInventory.find({ retailer: retailer._id });
    console.log(`Found ${allItems.length} total inventory items for retailer ${retailer.name}`);
    
    if (allItems.length > 0) {
      allItems.forEach(item => {
        console.log(`- ${item.name} (${item.sku}): ${item.stock} units`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding test inventory:', error);
    process.exit(1);
  }
}

// Get retailer and seller emails from command line arguments
const retailerEmail = process.argv[2];
const sellerEmail = process.argv[3];

if (!retailerEmail || !sellerEmail) {
  console.error('Please provide retailer and seller emails as command line arguments');
  console.log('Usage: node add-test-inventory.js retailer@example.com seller@example.com');
  process.exit(1);
}

addTestInventory(retailerEmail, sellerEmail);

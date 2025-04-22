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

// Check all inventory items
async function checkAllInventory() {
  try {
    // Count total inventory items
    const totalCount = await RetailerInventory.countDocuments();
    console.log(`Total inventory items in the system: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log('No inventory items found in the system.');
      process.exit(0);
    }
    
    // Get all inventory items
    const allItems = await RetailerInventory.find().populate('retailer seller');
    
    // Group by retailer
    const retailerGroups = {};
    
    for (const item of allItems) {
      const retailerId = item.retailer ? item.retailer._id.toString() : 'unknown';
      const retailerName = item.retailer ? item.retailer.name : 'Unknown Retailer';
      
      if (!retailerGroups[retailerId]) {
        retailerGroups[retailerId] = {
          name: retailerName,
          items: []
        };
      }
      
      retailerGroups[retailerId].items.push({
        id: item._id,
        sku: item.sku,
        name: item.name,
        stock: item.stock,
        seller: item.seller ? item.seller.name : 'Unknown Seller'
      });
    }
    
    // Display inventory by retailer
    console.log('\n=== INVENTORY BY RETAILER ===');
    for (const [retailerId, group] of Object.entries(retailerGroups)) {
      console.log(`\nRetailer: ${group.name} (${retailerId})`);
      console.log(`Total items: ${group.items.length}`);
      
      group.items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} (${item.sku}): ${item.stock} units - Seller: ${item.seller}`);
      });
    }
    
    // List all retailers
    console.log('\n=== ALL RETAILERS ===');
    const retailers = await User.find({ role: 'buyer' });
    retailers.forEach((retailer, index) => {
      console.log(`${index + 1}. ${retailer.name} (${retailer._id}) - ${retailer.email}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking inventory:', error);
    process.exit(1);
  }
}

checkAllInventory();

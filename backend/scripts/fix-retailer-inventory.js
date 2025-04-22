const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to fix RetailerInventory model and collection
async function fixRetailerInventory() {
  try {
    console.log('Starting RetailerInventory fix...');
    
    // Check if RetailerInventory collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const retailerInventoryExists = collections.some(c => c.name === 'retailerinventories');
    
    if (retailerInventoryExists) {
      console.log('RetailerInventory collection exists, dropping it...');
      await mongoose.connection.db.dropCollection('retailerinventories');
      console.log('RetailerInventory collection dropped');
    }
    
    // Define a new RetailerInventory schema
    const retailerInventorySchema = new mongoose.Schema({
      retailer: {
        type: String,
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
    
    // Create the model
    const RetailerInventory = mongoose.model('RetailerInventory', retailerInventorySchema, 'retailerinventories');
    
    console.log('RetailerInventory model created');
    
    // Create a test document
    const testItem = new RetailerInventory({
      retailer: '680776179e5465030ada5519', // Retailer ID from logs
      sku: 'FIXED001',
      name: 'Fixed Test Product',
      category: 'Test Category',
      price: 99.99,
      stock: 50,
      threshold: 10,
      seller: '680789ef7c1ac7df2240521d' // Seller ID from logs
    });
    
    // Save the test document
    const savedItem = await testItem.save();
    console.log(`Test item saved with ID: ${savedItem._id}`);
    
    // Verify it was saved
    const verifyItem = await RetailerInventory.findById(savedItem._id);
    if (verifyItem) {
      console.log(`Verification successful! Item found with ID: ${verifyItem._id}`);
      console.log(JSON.stringify(verifyItem.toObject(), null, 2));
    } else {
      console.error('Verification failed! Item not found after save!');
    }
    
    // Find all items for this retailer
    const retailerItems = await RetailerInventory.find({ retailer: '680776179e5465030ada5519' });
    console.log(`Found ${retailerItems.length} items for retailer 680776179e5465030ada5519`);
    
    if (retailerItems.length > 0) {
      retailerItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} (${item.sku}): ${item.stock} units`);
      });
    }
    
    console.log('RetailerInventory fix completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing RetailerInventory:', error);
    process.exit(1);
  }
}

// Run the function
fixRetailerInventory();

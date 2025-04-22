const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define a simple schema for testing
const TestInventorySchema = new mongoose.Schema({
  retailerId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const TestInventory = mongoose.model('TestInventory', TestInventorySchema);

// Function to add test inventory
async function addTestInventory(retailerId) {
  try {
    console.log(`Adding test inventory for retailer: ${retailerId}`);
    
    // Create a test inventory item
    const testItem = new TestInventory({
      retailerId: retailerId,
      productName: 'Test Product',
      quantity: 100
    });
    
    // Save the item
    const savedItem = await testItem.save();
    console.log(`Test inventory saved with ID: ${savedItem._id}`);
    
    // Verify it was saved
    const verifyItem = await TestInventory.findById(savedItem._id);
    if (verifyItem) {
      console.log(`Verification successful! Item found with ID: ${verifyItem._id}`);
    } else {
      console.error('Verification failed! Item not found after save!');
    }
    
    // Find all items for this retailer
    const allItems = await TestInventory.find({ retailerId: retailerId });
    console.log(`Found ${allItems.length} items for retailer ${retailerId}`);
    
    if (allItems.length > 0) {
      allItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.productName}: ${item.quantity} units (ID: ${item._id})`);
      });
    }
    
    // Check if RetailerInventory model exists and try to use it
    try {
      // Try to load the RetailerInventory model
      const RetailerInventory = mongoose.model('RetailerInventory');
      console.log('RetailerInventory model loaded successfully');
      
      // Create a direct inventory item
      const directItem = new RetailerInventory({
        retailer: retailerId,
        sku: 'DIRECT001',
        name: 'Direct Test Product',
        category: 'Test',
        price: 99.99,
        stock: 50,
        threshold: 10,
        seller: '680789ef7c1ac7df2240521d' // Use the seller ID from your logs
      });
      
      // Save the direct item
      const savedDirectItem = await directItem.save();
      console.log(`Direct inventory saved with ID: ${savedDirectItem._id}`);
      
      // Find all RetailerInventory items
      const allRetailerItems = await RetailerInventory.find();
      console.log(`Found ${allRetailerItems.length} total RetailerInventory items`);
      
    } catch (modelError) {
      console.error('Error with RetailerInventory model:', modelError.message);
      
      // If the model doesn't exist, try to define it
      try {
        console.log('Attempting to define RetailerInventory model...');
        
        const RetailerInventorySchema = new mongoose.Schema({
          retailer: { type: String, required: true },
          sku: { type: String, required: true },
          name: { type: String, required: true },
          category: { type: String, required: true },
          price: { type: Number, required: true },
          stock: { type: Number, required: true, default: 0 },
          threshold: { type: Number, required: true, default: 10 },
          seller: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
          updatedAt: { type: Date, default: Date.now }
        });
        
        const DirectRetailerInventory = mongoose.model('DirectRetailerInventory', RetailerInventorySchema);
        
        // Create a direct inventory item
        const directItem = new DirectRetailerInventory({
          retailer: retailerId,
          sku: 'DIRECT001',
          name: 'Direct Test Product',
          category: 'Test',
          price: 99.99,
          stock: 50,
          threshold: 10,
          seller: '680789ef7c1ac7df2240521d' // Use the seller ID from your logs
        });
        
        // Save the direct item
        const savedDirectItem = await directItem.save();
        console.log(`Direct inventory saved with ID: ${savedDirectItem._id}`);
      } catch (defineError) {
        console.error('Error defining RetailerInventory model:', defineError.message);
      }
    }
    
    // Check all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAll collections in the database:');
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error in test:', error);
    process.exit(1);
  }
}

// Get retailer ID from command line or use default
const retailerId = process.argv[2] || '680776179e5465030ada5519'; // Default to the retailer ID from your logs

addTestInventory(retailerId);

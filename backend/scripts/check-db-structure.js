const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Check database structure
async function checkDbStructure() {
  try {
    // Get database name from connection string
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Connected to database: ${dbName}`);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\nFound ${collections.length} collections:`);
    
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });
    
    // Check if RetailerInventory collection exists
    const retailerInventoryExists = collections.some(c => c.name === 'retailerinventories');
    console.log(`\nRetailerInventory collection exists: ${retailerInventoryExists}`);
    
    if (retailerInventoryExists) {
      // Count documents in RetailerInventory collection
      const count = await mongoose.connection.db.collection('retailerinventories').countDocuments();
      console.log(`RetailerInventory collection has ${count} documents`);
      
      // Get sample documents
      const samples = await mongoose.connection.db.collection('retailerinventories').find().limit(5).toArray();
      console.log('\nSample RetailerInventory documents:');
      samples.forEach((doc, index) => {
        console.log(`\nDocument ${index + 1}:`);
        console.log(JSON.stringify(doc, null, 2));
      });
    } else {
      console.log('\nCreating RetailerInventory collection...');
      
      // Create RetailerInventory collection
      await mongoose.connection.db.createCollection('retailerinventories');
      console.log('RetailerInventory collection created successfully');
      
      // Create a test document
      const result = await mongoose.connection.db.collection('retailerinventories').insertOne({
        retailer: '680776179e5465030ada5519', // Retailer ID from logs
        sku: 'TEST001',
        name: 'Test Product',
        category: 'Test Category',
        price: 99.99,
        stock: 50,
        threshold: 10,
        seller: '680789ef7c1ac7df2240521d', // Seller ID from logs
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`Test document inserted with ID: ${result.insertedId}`);
      
      // Verify the document was inserted
      const doc = await mongoose.connection.db.collection('retailerinventories').findOne({ _id: result.insertedId });
      console.log('\nInserted document:');
      console.log(JSON.stringify(doc, null, 2));
    }
    
    // Check User collection
    const userExists = collections.some(c => c.name === 'users');
    console.log(`\nUser collection exists: ${userExists}`);
    
    if (userExists) {
      // Count documents in User collection
      const count = await mongoose.connection.db.collection('users').countDocuments();
      console.log(`User collection has ${count} documents`);
      
      // Find specific users
      const retailer = await mongoose.connection.db.collection('users').findOne({ _id: mongoose.Types.ObjectId.createFromHexString('680776179e5465030ada5519') });
      const seller = await mongoose.connection.db.collection('users').findOne({ _id: mongoose.Types.ObjectId.createFromHexString('680789ef7c1ac7df2240521d') });
      
      console.log('\nRetailer user:');
      console.log(retailer ? JSON.stringify(retailer, null, 2) : 'Not found');
      
      console.log('\nSeller user:');
      console.log(seller ? JSON.stringify(seller, null, 2) : 'Not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking database structure:', error);
    process.exit(1);
  }
}

checkDbStructure();

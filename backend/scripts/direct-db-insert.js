const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// MongoDB connection URI from .env file
const uri = process.env.MONGODB_URI;

// Function to directly insert a document into RetailerInventory collection
async function directInsert() {
  const client = new MongoClient(uri);
  
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get database name from connection string
    const dbName = uri.split('/').pop().split('?')[0];
    console.log(`Using database: ${dbName}`);
    
    // Get database and collection
    const db = client.db(dbName);
    const collection = db.collection('retailerinventories');
    
    // Create a test document
    const testDocument = {
      retailer: new ObjectId('680776179e5465030ada5519'), // Retailer ID from logs
      sku: 'DIRECT001',
      name: 'Direct Test Product',
      category: 'Test Category',
      price: 99.99,
      stock: 50,
      threshold: 10,
      seller: new ObjectId('680789ef7c1ac7df2240521d'), // Seller ID from logs
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Inserting test document:', JSON.stringify(testDocument, null, 2));
    
    // Insert the document
    const result = await collection.insertOne(testDocument);
    console.log(`Document inserted with ID: ${result.insertedId}`);
    
    // Verify the document was inserted
    const insertedDoc = await collection.findOne({ _id: result.insertedId });
    console.log('Inserted document:', JSON.stringify(insertedDoc, null, 2));
    
    // Count documents in the collection
    const count = await collection.countDocuments();
    console.log(`Collection now has ${count} documents`);
    
    // Find documents for the specific retailer
    const retailerDocs = await collection.find({ retailer: new ObjectId('680776179e5465030ada5519') }).toArray();
    console.log(`Found ${retailerDocs.length} documents for retailer 680776179e5465030ada5519`);
    
    if (retailerDocs.length > 0) {
      console.log('Retailer documents:', JSON.stringify(retailerDocs, null, 2));
    }
    
  } catch (error) {
    console.error('Error inserting document:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
directInsert();

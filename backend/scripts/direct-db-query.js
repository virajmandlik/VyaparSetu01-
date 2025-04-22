const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// MongoDB connection URI from .env file
const uri = process.env.MONGODB_URI;

// Function to directly query the RetailerInventory collection
async function directQuery() {
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
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    collections.forEach(c => console.log(`- ${c.name}`));
    
    // Check if RetailerInventory collection exists
    if (collections.some(c => c.name === 'retailerinventories')) {
      console.log('\nRetailerInventory collection exists');
      const collection = db.collection('retailerinventories');
      
      // Count documents
      const count = await collection.countDocuments();
      console.log(`Collection has ${count} documents`);
      
      // Try different query approaches
      console.log('\nQuerying with ObjectId...');
      const docsWithObjectId = await collection.find({ 
        retailer: new ObjectId('680776179e5465030ada5519') 
      }).toArray();
      console.log(`Found ${docsWithObjectId.length} documents with ObjectId`);
      
      console.log('\nQuerying with string...');
      const docsWithString = await collection.find({ 
        retailer: '680776179e5465030ada5519' 
      }).toArray();
      console.log(`Found ${docsWithString.length} documents with string`);
      
      console.log('\nQuerying all documents...');
      const allDocs = await collection.find({}).toArray();
      console.log(`Found ${allDocs.length} total documents`);
      
      if (allDocs.length > 0) {
        console.log('\nAll documents:');
        allDocs.forEach((doc, index) => {
          console.log(`\nDocument ${index + 1}:`);
          console.log(JSON.stringify(doc, null, 2));
          console.log(`Retailer type: ${typeof doc.retailer}`);
          if (doc.retailer) {
            console.log(`Retailer value: ${doc.retailer}`);
          }
        });
      }
    } else {
      console.log('\nRetailerInventory collection does not exist');
    }
    
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
directQuery();

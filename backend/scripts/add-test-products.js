const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const User = require('../src/models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample products data
const sampleProducts = [
  {
    sku: 'PROD001',
    name: 'Laptop',
    category: 'Electronics',
    price: 999.99,
    stock: 50,
    threshold: 10
  },
  {
    sku: 'PROD002',
    name: 'Smartphone',
    category: 'Electronics',
    price: 699.99,
    stock: 100,
    threshold: 20
  },
  {
    sku: 'PROD003',
    name: 'Headphones',
    category: 'Accessories',
    price: 149.99,
    stock: 200,
    threshold: 30
  },
  {
    sku: 'PROD004',
    name: 'Tablet',
    category: 'Electronics',
    price: 499.99,
    stock: 75,
    threshold: 15
  },
  {
    sku: 'PROD005',
    name: 'Smartwatch',
    category: 'Wearables',
    price: 299.99,
    stock: 60,
    threshold: 12
  }
];

// Add products to a seller
async function addProductsToSeller(sellerEmail) {
  try {
    // Find the seller
    const seller = await User.findOne({ email: sellerEmail, role: 'seller' });
    
    if (!seller) {
      console.error(`Seller with email ${sellerEmail} not found`);
      process.exit(1);
    }
    
    console.log(`Adding products to seller: ${seller.name} (${seller._id})`);
    
    // Add products
    const productPromises = sampleProducts.map(async (product) => {
      // Check if product already exists
      const existingProduct = await Product.findOne({ sku: product.sku, seller: seller._id });
      
      if (existingProduct) {
        console.log(`Product ${product.sku} already exists, updating...`);
        existingProduct.stock = product.stock;
        existingProduct.price = product.price;
        return existingProduct.save();
      } else {
        console.log(`Creating new product: ${product.name} (${product.sku})`);
        const newProduct = new Product({
          ...product,
          seller: seller._id
        });
        return newProduct.save();
      }
    });
    
    await Promise.all(productPromises);
    console.log('Products added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error adding products:', error);
    process.exit(1);
  }
}

// Get seller email from command line argument
const sellerEmail = process.argv[2];

if (!sellerEmail) {
  console.error('Please provide a seller email as a command line argument');
  console.log('Usage: node add-test-products.js seller@example.com');
  process.exit(1);
}

addProductsToSeller(sellerEmail);

const Product = require('../models/Product');
const Sale = require('../models/Sale');
const User = require('../models/User');
const csv = require('csv-parser');
const { Readable } = require('stream');

// Process CSV data and save products and sales
exports.processCSV = async (req, res) => {
  try {
    const { userId } = req.body;
    const csvBuffer = req.file.buffer;

    if (!userId || !csvBuffer) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'seller') {
      return res.status(403).json({ error: 'Only sellers can upload product data' });
    }

    // Parse CSV data
    const results = [];
    const stream = Readable.from(csvBuffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    // Validate CSV structure
    if (results.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty or invalid' });
    }

    // Check required columns
    const requiredColumns = ['sku', 'name', 'category', 'price', 'stock', 'threshold', 'sale_date', 'sale_quantity'];
    const firstRow = results[0];

    const missingColumns = requiredColumns.filter(col => !Object.keys(firstRow).includes(col));
    if (missingColumns.length > 0) {
      return res.status(400).json({
        error: 'CSV file is missing required columns',
        missingColumns
      });
    }

    // Process products and sales
    const products = [];
    const sales = [];
    const productMap = new Map(); // To track products by SKU

    for (const row of results) {
      // Create or update product
      let product;

      if (!productMap.has(row.sku)) {
        product = new Product({
          sku: row.sku,
          name: row.name,
          category: row.category,
          price: parseFloat(row.price),
          stock: parseInt(row.stock, 10),
          threshold: parseInt(row.threshold, 10),
          seller: userId
        });

        products.push(product);
        productMap.set(row.sku, product);
      } else {
        product = productMap.get(row.sku);
      }

      // Create sale record if sale data is present
      if (row.sale_date && row.sale_quantity) {
        const saleQuantity = parseInt(row.sale_quantity, 10);
        if (saleQuantity > 0) {
          const sale = new Sale({
            product: product._id,
            quantity: saleQuantity,
            totalAmount: saleQuantity * parseFloat(row.price),
            date: new Date(row.sale_date),
            seller: userId
          });

          sales.push(sale);
        }
      }
    }

    // Save products to database
    await Product.insertMany(products);

    // Save sales to database
    if (sales.length > 0) {
      await Sale.insertMany(sales);
    }

    // Mark user registration as complete
    user.registrationComplete = true;
    await user.save();

    res.status(201).json({
      message: 'CSV data processed successfully',
      productsCount: products.length,
      salesCount: sales.length
    });
  } catch (error) {
    console.error('Error processing CSV:', error);
    res.status(500).json({ error: error.message });
  }
};

// Complete seller registration
exports.completeRegistration = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'seller') {
      return res.status(403).json({ error: 'Only sellers need to complete registration' });
    }

    user.registrationComplete = true;
    await user.save();

    res.status(200).json({
      message: 'Registration completed successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        registrationComplete: user.registrationComplete
      }
    });
  } catch (error) {
    console.error('Error completing registration:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get products for a seller
exports.getProducts = async (req, res) => {
  try {
    const { sellerId } = req.query;

    // If sellerId is provided, fetch products for that seller
    // Otherwise, fetch products for the current user
    const sellerIdToUse = sellerId || req.user._id;

    const products = await Product.find({ seller: sellerIdToUse });
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get sales for a seller
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find({ seller: req.user._id }).populate('product');
    res.status(200).json({ sales });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard data for a seller
exports.getDashboardData = async (req, res) => {
  try {
    // Get all products for the seller
    const products = await Product.find({ seller: req.user._id });

    // Get all sales for the seller
    const sales = await Sale.find({ seller: req.user._id }).populate('product');

    // Calculate inventory stats
    const totalProducts = products.length;
    const lowStockItems = products.filter(product => product.stock <= product.threshold);
    const outOfStockItems = products.filter(product => product.stock === 0);

    // Calculate revenue data (last 6 months)
    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1); // Start from 6 months ago

    // Initialize revenue data for the last 6 months
    const revenueData = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      revenueData.push({
        name: monthName,
        revenue: 0,
        predicted: 0 // We'll use a simple prediction model
      });
    }

    // Calculate actual revenue for each month
    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      if (saleDate >= sixMonthsAgo) {
        const monthIndex = saleDate.getMonth() - (today.getMonth() - 5);
        if (monthIndex >= 0 && monthIndex < 6) {
          revenueData[monthIndex].revenue += sale.totalAmount;
        }
      }
    });

    // Simple prediction model (10% growth from previous month)
    for (let i = 0; i < 6; i++) {
      if (i === 0) {
        revenueData[i].predicted = revenueData[i].revenue * 1.1; // 10% more than actual for first month
      } else {
        revenueData[i].predicted = revenueData[i].revenue > 0 ?
          revenueData[i].revenue * 1.1 : // 10% more than actual
          revenueData[i-1].predicted * 1.05; // 5% more than previous month's prediction
      }
    }

    // Calculate inventory trends (last 6 months)
    const inventoryTrends = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });

      // Calculate total sold for this month
      let soldThisMonth = 0;
      sales.forEach(sale => {
        const saleDate = new Date(sale.date);
        if (saleDate.getMonth() === month.getMonth() &&
            saleDate.getFullYear() === month.getFullYear()) {
          soldThisMonth += sale.quantity;
        }
      });

      inventoryTrends.push({
        name: monthName,
        stock: products.reduce((sum, product) => sum + product.stock, 0), // Current stock for all products
        sold: soldThisMonth
      });
    }

    // Get recent orders (using sales data)
    const recentOrders = sales
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map((sale, index) => ({
        id: `ORD-${1000 + index}`,
        customer: 'Customer', // We don't have customer data in our model yet
        items: sale.quantity,
        total: `$${sale.totalAmount.toFixed(2)}`,
        status: Math.random() > 0.6 ? 'Completed' : (Math.random() > 0.5 ? 'Processing' : 'Pending'),
        date: new Date(sale.date).toISOString().split('T')[0]
      }));

    // Calculate total revenue forecast for next 30 days
    const lastMonthRevenue = revenueData[revenueData.length - 1].revenue;
    const revenueForecast = lastMonthRevenue * 1.1; // Simple 10% growth prediction

    // Return all dashboard data
    res.status(200).json({
      inventoryStats: {
        total: totalProducts,
        lowStock: lowStockItems.length,
        outOfStock: outOfStockItems.length
      },
      orderStats: {
        total: sales.length,
        pending: Math.floor(sales.length * 0.2), // Mocked data
        processing: Math.floor(sales.length * 0.3), // Mocked data
        completed: Math.floor(sales.length * 0.5) // Mocked data
      },
      revenueData,
      inventoryTrends,
      lowStockItems: lowStockItems.map(item => ({
        id: item._id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        currentStock: item.stock,
        threshold: item.threshold
      })).slice(0, 5), // Get top 5 low stock items
      recentOrders,
      revenueForecast: `$${revenueForecast.toFixed(2)}`
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: error.message });
  }
};

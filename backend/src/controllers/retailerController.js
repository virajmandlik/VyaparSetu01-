const RetailerInventory = require('../models/RetailerInventory');
const RetailerSale = require('../models/RetailerSale');
const mongoose = require('mongoose');
const { generateSalesForecast, generateRevenueForecast } = require('../utils/forecasting');

// Get retailer inventory
exports.getInventory = async (req, res) => {
  try {
    const retailerId = req.user._id;
    console.log(`Getting inventory for retailer: ${retailerId}`);
    console.log(`Retailer ID type: ${typeof retailerId}`);
    console.log(`Retailer ID toString: ${retailerId.toString()}`);

    // Ensure the user is a retailer
    if (req.user.role !== 'buyer') {
      console.log('User is not a retailer');
      return res.status(403).json({ error: 'Only retailers can access inventory' });
    }

    // Check if there are any inventory items at all in the system
    const totalInventoryCount = await RetailerInventory.countDocuments();
    console.log(`Total inventory items in the system: ${totalInventoryCount}`);

    // Check if the retailer ID is valid by finding the user
    const retailerUser = await mongoose.model('User').findById(retailerId);
    if (!retailerUser) {
      console.error(`Retailer with ID ${retailerId} not found in database!`);
      return res.status(404).json({ error: 'Retailer not found' });
    }
    console.log(`Found retailer: ${retailerUser.name}, role: ${retailerUser.role}`);

    // Try different query approaches
    console.log('Querying with exact ID object...');
    const inventoryWithExactId = await RetailerInventory.find({ retailer: retailerId }).lean();
    console.log(`Found ${inventoryWithExactId.length} items with exact ID`);

    console.log('Querying with string ID...');
    const inventoryWithStringId = await RetailerInventory.find({ retailer: retailerId.toString() }).lean();
    console.log(`Found ${inventoryWithStringId.length} items with string ID`);

    // Try a direct MongoDB query
    console.log('Trying direct MongoDB query...');
    const directResults = await mongoose.connection.db.collection('retailerinventories').find({ retailer: retailerId.toString() }).toArray();
    console.log(`Found ${directResults.length} items with direct MongoDB query`);

    // Try multiple approaches to find inventory
    let inventory = [];

    // First try with the exact ID
    inventory = await RetailerInventory.find({ retailer: retailerId })
      .populate('seller', 'name email')
      .sort({ category: 1, name: 1 })
      .lean();

    // If that didn't work, try with the string ID
    if (inventory.length === 0) {
      console.log('No results with exact ID, trying with string ID...');
      inventory = await RetailerInventory.find({ retailer: retailerId.toString() })
        .populate('seller', 'name email')
        .sort({ category: 1, name: 1 })
        .lean();
    }

    // If that still didn't work, try a more flexible approach
    if (inventory.length === 0) {
      console.log('Still no results, trying with regex search...');
      const allInventory = await RetailerInventory.find()
        .populate('seller', 'name email')
        .lean();

      // Filter manually
      inventory = allInventory.filter(item => {
        const itemRetailerId = item.retailer.toString();
        const searchRetailerId = retailerId.toString();
        return itemRetailerId === searchRetailerId;
      });

      console.log(`Found ${inventory.length} items with manual filtering`);
    }

    console.log(`Found ${inventory.length} inventory items for retailer`);

    // Log some details about the inventory items
    if (inventory.length > 0) {
      inventory.forEach(item => {
        console.log(`Inventory item: ${item.name}, SKU: ${item.sku}, Stock: ${item.stock}, Retailer: ${item.retailer}`);
      });
    } else {
      console.log('No inventory items found for this retailer');

      // Check if there are any inventory items with a different retailer ID
      const allInventory = await RetailerInventory.find().lean();
      console.log(`Found ${allInventory.length} total inventory items in the system`);

      if (allInventory.length > 0) {
        allInventory.forEach(item => {
          console.log(`System inventory item: ${item.name}, Retailer: ${item.retailer}, SKU: ${item.sku}`);
        });
      }
    }

    res.status(200).json({
      inventory: inventory.map(item => ({
        id: item._id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        price: item.price,
        stock: item.stock,
        threshold: item.threshold,
        seller: {
          id: item.seller._id,
          name: item.seller.name
        },
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error getting retailer inventory:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update retailer inventory item
exports.updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, threshold } = req.body;
    const retailerId = req.user._id;

    // Ensure the user is a retailer
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ error: 'Only retailers can update inventory' });
    }

    // Find the inventory item
    const inventoryItem = await RetailerInventory.findById(id);

    if (!inventoryItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Verify that the user owns the inventory item
    if (inventoryItem.retailer.toString() !== retailerId.toString()) {
      return res.status(403).json({ error: 'You do not own this inventory item' });
    }

    // Update the item
    if (price !== undefined) {
      inventoryItem.price = price;
    }

    if (threshold !== undefined) {
      inventoryItem.threshold = threshold;
    }

    await inventoryItem.save();

    res.status(200).json({
      message: 'Inventory item updated successfully',
      item: {
        id: inventoryItem._id,
        sku: inventoryItem.sku,
        name: inventoryItem.name,
        category: inventoryItem.category,
        price: inventoryItem.price,
        stock: inventoryItem.stock,
        threshold: inventoryItem.threshold,
        updatedAt: inventoryItem.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: error.message });
  }
};

// Record a sale
exports.recordSale = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const retailerId = req.user._id;

    // Ensure the user is a retailer
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ error: 'Only retailers can record sales' });
    }

    // Find the inventory item
    const inventoryItem = await RetailerInventory.findById(productId);

    if (!inventoryItem) {
      return res.status(404).json({ error: 'Product not found in inventory' });
    }

    // Verify that the user owns the inventory item
    if (inventoryItem.retailer.toString() !== retailerId.toString()) {
      return res.status(403).json({ error: 'You do not own this product' });
    }

    // Check if there's enough stock
    if (inventoryItem.stock < quantity) {
      return res.status(400).json({
        error: 'Insufficient stock',
        available: inventoryItem.stock,
        requested: quantity
      });
    }

    // Start a transaction
    const session = await RetailerInventory.startSession();
    session.startTransaction();

    try {
      // Update inventory
      inventoryItem.stock -= quantity;
      await inventoryItem.save({ session });

      // Record the sale
      const totalAmount = quantity * inventoryItem.price;
      const sale = new RetailerSale({
        retailer: retailerId,
        product: productId,
        quantity,
        totalAmount,
        date: new Date()
      });

      await sale.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        message: 'Sale recorded successfully',
        sale: {
          id: sale._id,
          product: {
            id: inventoryItem._id,
            name: inventoryItem.name,
            sku: inventoryItem.sku
          },
          quantity: sale.quantity,
          totalAmount: sale.totalAmount,
          date: sale.date,
          remainingStock: inventoryItem.stock
        }
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Error recording sale:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get sales data
exports.getSales = async (req, res) => {
  try {
    const retailerId = req.user._id;
    const { startDate, endDate } = req.query;

    // Ensure the user is a retailer
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ error: 'Only retailers can access sales data' });
    }

    // Build query
    const query = { retailer: retailerId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Get sales
    const sales = await RetailerSale.find(query)
      .populate('product', 'name sku category price')
      .sort({ date: -1 });

    // Calculate total revenue
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    // Group sales by product category
    const salesByCategory = {};
    sales.forEach(sale => {
      const category = sale.product.category;
      if (!salesByCategory[category]) {
        salesByCategory[category] = {
          quantity: 0,
          revenue: 0
        };
      }
      salesByCategory[category].quantity += sale.quantity;
      salesByCategory[category].revenue += sale.totalAmount;
    });

    res.status(200).json({
      sales: sales.map(sale => ({
        id: sale._id,
        product: {
          id: sale.product._id,
          name: sale.product.name,
          sku: sale.product.sku,
          category: sale.product.category,
          price: sale.product.price
        },
        quantity: sale.quantity,
        totalAmount: sale.totalAmount,
        date: sale.date
      })),
      summary: {
        totalSales: sales.length,
        totalQuantity: sales.reduce((sum, sale) => sum + sale.quantity, 0),
        totalRevenue,
        salesByCategory
      }
    });
  } catch (error) {
    console.error('Error getting sales data:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get sales forecast
exports.getForecast = async (req, res) => {
  try {
    const retailerId = req.user._id;
    const days = req.query.days ? parseInt(req.query.days) : 30;

    // Ensure the user is a retailer
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ error: 'Only retailers can access forecasts' });
    }

    // Get sales forecast
    const salesForecast = await generateSalesForecast(retailerId, days);

    if (!salesForecast.success) {
      return res.status(400).json({ error: salesForecast.message });
    }

    // Get revenue forecast
    const revenueForecast = await generateRevenueForecast(retailerId, days);

    if (!revenueForecast.success) {
      return res.status(400).json({ error: revenueForecast.message });
    }

    // Combine the forecasts for the dashboard
    const dashboardForecast = {
      success: true,
      salesForecast: {
        total: salesForecast.totalForecast,
        byCategory: salesForecast.categoryForecasts,
        daily: salesForecast.forecast.map(day => ({
          date: day.date,
          quantity: day.quantity
        }))
      },
      revenueForecast: {
        total: revenueForecast.totalRevenue,
        byCategory: revenueForecast.categoryRevenueForecasts,
        daily: revenueForecast.forecast.map(day => ({
          date: day.date,
          revenue: day.revenue
        }))
      }
    };

    res.status(200).json(dashboardForecast);
  } catch (error) {
    console.error('Error getting forecast:', error);
    res.status(500).json({ error: error.message });
  }
};

// Test add inventory item (for debugging)
exports.testAddInventoryItem = async (req, res) => {
  try {
    const retailerId = req.user._id;
    console.log(`Test adding inventory for retailer: ${retailerId}`);

    // Ensure the user is a retailer
    if (req.user.role !== 'buyer') {
      console.log('User is not a retailer');
      return res.status(403).json({ error: 'Only retailers can access inventory' });
    }

    // Create a test inventory item with string IDs
    const testItem = new RetailerInventory({
      retailer: retailerId.toString(),
      sku: 'TEST001',
      name: 'Test Product',
      category: 'Test Category',
      price: 99.99,
      stock: 50,
      threshold: 10,
      seller: (req.body.sellerId || '680789ef7c1ac7df2240521d').toString() // Default to the seller ID from logs
    });

    console.log('Creating test item with data:', JSON.stringify(testItem.toObject(), null, 2));

    console.log('Test item created:', testItem);

    // Save the item
    const savedItem = await testItem.save();
    console.log(`Test item saved with ID: ${savedItem._id}`);

    // Verify it was saved
    const verifyItem = await RetailerInventory.findById(savedItem._id);
    if (verifyItem) {
      console.log(`Verification successful! Item found with ID: ${verifyItem._id}`);
    } else {
      console.error('Verification failed! Item not found after save!');
    }

    // Return success response
    res.status(200).json({
      message: 'Test inventory item added successfully',
      item: {
        id: savedItem._id,
        sku: savedItem.sku,
        name: savedItem.name,
        stock: savedItem.stock,
        retailer: savedItem.retailer
      }
    });
  } catch (error) {
    console.error('Error adding test inventory item:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    const retailerId = req.user._id;

    // Ensure the user is a retailer
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ error: 'Only retailers can access dashboard data' });
    }

    // Get inventory stats
    const inventory = await RetailerInventory.find({ retailer: retailerId });
    const totalProducts = inventory.length;
    const lowStockItems = inventory.filter(item => item.stock <= item.threshold);
    const outOfStockItems = inventory.filter(item => item.stock === 0);

    // Get recent sales
    const recentSales = await RetailerSale.find({ retailer: retailerId })
      .populate('product', 'name sku category price')
      .sort({ date: -1 })
      .limit(10);

    // Calculate total revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRevenue = await RetailerSale.aggregate([
      {
        $match: {
          retailer: retailerId,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    // Get top selling products
    const topProducts = await RetailerSale.aggregate([
      { $match: { retailer: retailerId } },
      {
        $group: {
          _id: '$product',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    // Populate product details for top products
    const populatedTopProducts = await RetailerInventory.populate(topProducts, {
      path: '_id',
      select: 'name sku category price'
    });

    // Get sales by category
    const salesByCategory = await RetailerSale.aggregate([
      {
        $match: { retailer: retailerId }
      },
      {
        $lookup: {
          from: 'retailerinventories',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      },
      {
        $group: {
          _id: '$productDetails.category',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    res.status(200).json({
      inventoryStats: {
        total: totalProducts,
        lowStock: lowStockItems.length,
        outOfStock: outOfStockItems.length
      },
      salesStats: {
        recentRevenue: recentRevenue.length > 0 ? recentRevenue[0].totalRevenue : 0,
        recentQuantity: recentRevenue.length > 0 ? recentRevenue[0].totalQuantity : 0
      },
      topProducts: populatedTopProducts.map(product => ({
        id: product._id._id,
        name: product._id.name,
        sku: product._id.sku,
        category: product._id.category,
        price: product._id.price,
        totalQuantity: product.totalQuantity,
        totalRevenue: product.totalRevenue
      })),
      salesByCategory,
      recentSales: recentSales.map(sale => ({
        id: sale._id,
        product: {
          id: sale.product._id,
          name: sale.product.name,
          sku: sale.product.sku,
          category: sale.product.category
        },
        quantity: sale.quantity,
        totalAmount: sale.totalAmount,
        date: sale.date
      })),
      lowStockItems: lowStockItems.map(item => ({
        id: item._id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        currentStock: item.stock,
        threshold: item.threshold
      })).slice(0, 5) // Get top 5 low stock items
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({ error: error.message });
  }
};

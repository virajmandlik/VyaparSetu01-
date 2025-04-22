const ProductRequest = require('../models/ProductRequest');
const Partnership = require('../models/Partnership');
const Product = require('../models/Product');
const RetailerInventory = require('../models/RetailerInventory');
const Sale = require('../models/Sale');
const mongoose = require('mongoose');

// Create a product request (retailer to seller)
exports.createProductRequest = async (req, res) => {
  try {
    const { partnershipId, products, notes } = req.body;
    const retailerId = req.user._id;

    // Validate partnership
    const partnership = await Partnership.findById(partnershipId);

    if (!partnership) {
      return res.status(404).json({ error: 'Partnership not found' });
    }

    if (partnership.status !== 'active') {
      return res.status(400).json({ error: 'Partnership is not active' });
    }

    // Verify that the user is the retailer in the partnership
    if (partnership.retailer.toString() !== retailerId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to create a request for this partnership' });
    }

    // Validate products
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required' });
    }

    // Create the product request
    const productRequest = new ProductRequest({
      partnership: partnershipId,
      products: products.map(p => ({
        sku: p.sku,
        name: p.name,
        quantity: p.quantity,
        status: 'pending'
      })),
      status: 'pending',
      notes: notes || ''
    });

    await productRequest.save();

    res.status(201).json({
      message: 'Product request created successfully',
      request: {
        id: productRequest._id,
        partnership: partnershipId,
        products: productRequest.products,
        status: productRequest.status,
        notes: productRequest.notes,
        createdAt: productRequest.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating product request:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update product request status (seller)
exports.updateProductRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, productUpdates } = req.body;
    const sellerId = req.user._id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "approved" or "rejected"' });
    }

    // Find the product request
    const productRequest = await ProductRequest.findById(id)
      .populate({
        path: 'partnership',
        populate: [
          { path: 'seller', select: 'name email' },
          { path: 'retailer', select: 'name email' }
        ]
      });

    if (!productRequest) {
      return res.status(404).json({ error: 'Product request not found' });
    }

    // Verify that the user is the seller in the partnership
    if (productRequest.partnership.seller._id.toString() !== sellerId.toString()) {
      return res.status(403).json({ error: 'Only the seller can update product request status' });
    }

    // Update the status
    productRequest.status = status;

    // Update individual product statuses if provided
    if (productUpdates && Array.isArray(productUpdates)) {
      for (const update of productUpdates) {
        const productIndex = productRequest.products.findIndex(
          p => p._id.toString() === update.productId
        );

        if (productIndex !== -1) {
          // Update product status
          productRequest.products[productIndex].status = update.status;

          // Update quantity if provided
          if (update.adjustedQuantity !== undefined) {
            productRequest.products[productIndex].quantity = update.adjustedQuantity;
          }
        }
      }
    } else {
      // Update all products to the same status
      productRequest.products.forEach(product => {
        product.status = status;
      });
    }

    await productRequest.save();

    res.status(200).json({
      message: `Product request ${status} successfully`,
      request: {
        id: productRequest._id,
        partnership: {
          id: productRequest.partnership._id,
          seller: {
            id: productRequest.partnership.seller._id,
            name: productRequest.partnership.seller.name
          },
          retailer: {
            id: productRequest.partnership.retailer._id,
            name: productRequest.partnership.retailer.name
          }
        },
        products: productRequest.products,
        status: productRequest.status,
        notes: productRequest.notes,
        updatedAt: productRequest.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating product request status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Fulfill product request (seller)
exports.fulfillProductRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user._id;

    console.log(`Starting fulfillment process for request ${id} by seller ${sellerId}`);

    // Find the product request
    const productRequest = await ProductRequest.findById(id)
      .populate({
        path: 'partnership',
        populate: [
          { path: 'seller', select: 'name email' },
          { path: 'retailer', select: 'name email' }
        ]
      });

    if (!productRequest) {
      console.log('Product request not found');
      return res.status(404).json({ error: 'Product request not found' });
    }

    console.log(`Found product request: ${productRequest._id}`);
    console.log(`Seller in partnership: ${productRequest.partnership.seller._id}`);
    console.log(`Retailer in partnership: ${productRequest.partnership.retailer._id}`);

    // Verify that the user is the seller in the partnership
    if (productRequest.partnership.seller._id.toString() !== sellerId.toString()) {
      console.log('Authorization failed: User is not the seller in this partnership');
      return res.status(403).json({ error: 'Only the seller can fulfill product requests' });
    }

    // Check if the request is approved
    if (productRequest.status !== 'approved') {
      console.log(`Request status is ${productRequest.status}, not approved`);
      return res.status(400).json({ error: 'Only approved requests can be fulfilled' });
    }

    // Get all approved products
    const approvedProducts = productRequest.products.filter(p => p.status === 'approved');
    console.log(`Found ${approvedProducts.length} approved products in the request`);

    if (approvedProducts.length === 0) {
      return res.status(400).json({ error: 'No approved products to fulfill' });
    }

    // Get seller's products
    const sellerProducts = await Product.find({
      seller: sellerId,
      sku: { $in: approvedProducts.map(p => p.sku) }
    });

    console.log(`Found ${sellerProducts.length} matching products in seller's inventory`);

    // Check if all products exist and have sufficient stock
    const insufficientStock = [];
    const productsToUpdate = [];

    for (const requestedProduct of approvedProducts) {
      const sellerProduct = sellerProducts.find(p => p.sku === requestedProduct.sku);

      if (!sellerProduct) {
        console.log(`Product with SKU ${requestedProduct.sku} not found in seller's inventory`);
        return res.status(404).json({
          error: `Product with SKU ${requestedProduct.sku} not found in your inventory`
        });
      }

      console.log(`Checking stock for ${sellerProduct.name}: Available=${sellerProduct.stock}, Requested=${requestedProduct.quantity}`);

      if (sellerProduct.stock < requestedProduct.quantity) {
        insufficientStock.push({
          sku: requestedProduct.sku,
          name: requestedProduct.name,
          requested: requestedProduct.quantity,
          available: sellerProduct.stock
        });
      } else {
        productsToUpdate.push({
          product: sellerProduct,
          quantity: requestedProduct.quantity,
          requestedProduct: requestedProduct
        });
      }
    }

    if (insufficientStock.length > 0) {
      console.log('Insufficient stock for some products:', insufficientStock);
      return res.status(400).json({
        error: 'Insufficient stock for some products',
        insufficientStock
      });
    }

    console.log('All products have sufficient stock, proceeding with fulfillment');

    // Process each product individually without using transactions
    // This is a workaround for environments where transactions might not be fully supported
    const updateResults = [];
    const errors = [];

    for (const item of productsToUpdate) {
      try {
        console.log(`Processing product: ${item.product.name}`);

        // 1. Update seller's product stock
        console.log(`Reducing seller's stock by ${item.quantity} units`);
        const updatedProduct = await Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );

        if (!updatedProduct) {
          throw new Error(`Failed to update seller's product: ${item.product._id}`);
        }

        console.log(`Updated seller's product stock to: ${updatedProduct.stock}`);

        // 2. Record the sale
        console.log(`Recording sale for seller`);
        const sale = new Sale({
          product: item.product._id,
          quantity: item.quantity,
          totalAmount: item.quantity * item.product.price,
          date: new Date(),
          seller: sellerId
        });

        const savedSale = await sale.save();
        console.log(`Sale recorded with ID: ${savedSale._id}`);

        // 3. Update or create retailer inventory
        const retailerId = productRequest.partnership.retailer._id;
        console.log(`Retailer ID from partnership: ${retailerId}`);
        console.log(`Retailer ID type: ${typeof retailerId}`);
        console.log(`Retailer ID toString: ${retailerId.toString()}`);

        // Double check that the retailer exists
        const retailerUser = await mongoose.model('User').findById(retailerId);
        if (!retailerUser) {
          console.error(`Retailer with ID ${retailerId} not found in database!`);
          throw new Error(`Retailer not found with ID: ${retailerId}`);
        }
        console.log(`Found retailer: ${retailerUser.name}, ${retailerUser._id}, role: ${retailerUser.role}`);

        const existingInventory = await RetailerInventory.findOne({
          retailer: retailerId,
          sku: item.product.sku
        });

        console.log(`Searched for inventory with retailer: ${retailerId}, sku: ${item.product.sku}`);
        console.log(`Existing inventory found: ${existingInventory ? 'Yes' : 'No'}`);

        if (existingInventory) {
          console.log(`Updating existing retailer inventory: ${existingInventory.name}`);
          console.log(`Existing inventory ID: ${existingInventory._id}`);
          console.log(`Current stock: ${existingInventory.stock}, Adding: ${item.quantity}`);

          const updatedInventory = await RetailerInventory.findByIdAndUpdate(
            existingInventory._id,
            { $inc: { stock: item.quantity } },
            { new: true }
          );

          if (!updatedInventory) {
            console.error(`Failed to update inventory item: ${existingInventory._id}`);
            throw new Error(`Failed to update inventory item: ${existingInventory._id}`);
          }

          console.log(`Updated retailer inventory stock to: ${updatedInventory.stock}`);
        } else {
          console.log(`Creating new retailer inventory item for retailer: ${retailerId}`);

          // Create inventory object - using string IDs
          const inventoryData = {
            retailer: retailerId.toString(),
            sku: item.product.sku,
            name: item.product.name,
            category: item.product.category,
            price: item.product.price,
            stock: item.quantity,
            threshold: item.product.threshold,
            seller: sellerId.toString()
          };

          console.log('Creating inventory with data:', JSON.stringify(inventoryData, null, 2));

          console.log('New inventory data:', JSON.stringify(inventoryData, null, 2));

          try {
            const newInventory = new RetailerInventory(inventoryData);
            const savedInventory = await newInventory.save();
            console.log(`Created new retailer inventory with ID: ${savedInventory._id}`);

            // Double-check that it was actually saved
            const verifyInventory = await RetailerInventory.findById(savedInventory._id);
            if (!verifyInventory) {
              console.error(`Verification failed! Inventory item not found after save!`);
            } else {
              console.log(`Verification successful! Inventory item found with stock: ${verifyInventory.stock}`);
            }
          } catch (inventoryError) {
            console.error(`Error creating inventory:`, inventoryError);
            throw inventoryError;
          }
        }

        // 4. Update the product status in the request
        console.log(`Updating product status in request to fulfilled`);
        await ProductRequest.updateOne(
          {
            _id: productRequest._id,
            'products._id': item.requestedProduct._id
          },
          {
            $set: { 'products.$.status': 'fulfilled' }
          }
        );

        updateResults.push({
          sku: item.product.sku,
          name: item.product.name,
          quantity: item.quantity,
          success: true
        });
      } catch (error) {
        console.error(`Error processing product ${item.product.name}:`, error);
        errors.push({
          sku: item.product.sku,
          name: item.product.name,
          error: error.message
        });
      }
    }

    // If any products failed to process, return an error
    if (errors.length > 0) {
      console.error('Some products failed to process:', errors);
      return res.status(500).json({
        error: 'Some products failed to process',
        failedProducts: errors,
        successfulProducts: updateResults
      });
    }

    // Update the overall request status if all products were processed successfully
    console.log('All products processed successfully, updating request status');
    const updatedRequest = await ProductRequest.findByIdAndUpdate(
      productRequest._id,
      { status: 'fulfilled' },
      { new: true }
    );

    console.log(`Request status updated to: ${updatedRequest.status}`);

    res.status(200).json({
      message: 'Product request fulfilled successfully',
      request: {
        id: updatedRequest._id,
        status: updatedRequest.status,
        products: updatedRequest.products,
        updatedAt: updatedRequest.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fulfilling product request:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get product requests (for both seller and retailer)
exports.getProductRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { status } = req.query;

    // Find partnerships where the user is involved
    let partnershipQuery;
    if (userRole === 'seller') {
      partnershipQuery = { seller: userId };
    } else if (userRole === 'buyer') {
      partnershipQuery = { retailer: userId };
    } else {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    const partnerships = await Partnership.find(partnershipQuery);

    if (partnerships.length === 0) {
      return res.status(200).json({ requests: [] });
    }

    // Find product requests for these partnerships
    let requestQuery = {
      partnership: { $in: partnerships.map(p => p._id) }
    };

    // Add status filter if provided
    if (status) {
      requestQuery.status = status;
    }

    const productRequests = await ProductRequest.find(requestQuery)
      .populate({
        path: 'partnership',
        populate: [
          { path: 'seller', select: 'name email' },
          { path: 'retailer', select: 'name email' }
        ]
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      requests: productRequests.map(request => ({
        id: request._id,
        partnership: {
          id: request.partnership._id,
          seller: {
            id: request.partnership.seller._id,
            name: request.partnership.seller.name
          },
          retailer: {
            id: request.partnership.retailer._id,
            name: request.partnership.retailer.name
          }
        },
        products: request.products,
        status: request.status,
        notes: request.notes,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error getting product requests:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get product request details
exports.getProductRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const productRequest = await ProductRequest.findById(id)
      .populate({
        path: 'partnership',
        populate: [
          { path: 'seller', select: 'name email' },
          { path: 'retailer', select: 'name email' }
        ]
      });

    if (!productRequest) {
      return res.status(404).json({ error: 'Product request not found' });
    }

    // Verify that the user is part of the partnership
    if (productRequest.partnership.seller._id.toString() !== userId.toString() &&
        productRequest.partnership.retailer._id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to view this product request' });
    }

    res.status(200).json({
      request: {
        id: productRequest._id,
        partnership: {
          id: productRequest.partnership._id,
          seller: {
            id: productRequest.partnership.seller._id,
            name: productRequest.partnership.seller.name,
            email: productRequest.partnership.seller.email
          },
          retailer: {
            id: productRequest.partnership.retailer._id,
            name: productRequest.partnership.retailer.name,
            email: productRequest.partnership.retailer.email
          }
        },
        products: productRequest.products,
        status: productRequest.status,
        notes: productRequest.notes,
        createdAt: productRequest.createdAt,
        updatedAt: productRequest.updatedAt
      }
    });
  } catch (error) {
    console.error('Error getting product request details:', error);
    res.status(500).json({ error: error.message });
  }
};


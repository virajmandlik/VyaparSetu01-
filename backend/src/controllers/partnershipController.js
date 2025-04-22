const Partnership = require('../models/Partnership');
const User = require('../models/User');

// Create a partnership request (retailer to seller)
exports.createPartnershipRequest = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const retailerId = req.user._id;

    // Validate user roles
    const [seller, retailer] = await Promise.all([
      User.findById(sellerId),
      User.findById(retailerId)
    ]);

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    if (!retailer) {
      return res.status(404).json({ error: 'Retailer not found' });
    }

    if (seller.role !== 'seller') {
      return res.status(400).json({ error: 'Target user is not a seller' });
    }

    if (retailer.role !== 'buyer') {
      return res.status(400).json({ error: 'Only retailers can send partnership requests' });
    }

    // Check if a partnership already exists
    const existingPartnership = await Partnership.findOne({
      seller: sellerId,
      retailer: retailerId
    });

    if (existingPartnership) {
      return res.status(400).json({ 
        error: 'Partnership already exists', 
        status: existingPartnership.status 
      });
    }

    // Create new partnership request
    const partnership = new Partnership({
      seller: sellerId,
      retailer: retailerId,
      status: 'pending'
    });

    await partnership.save();

    res.status(201).json({
      message: 'Partnership request sent successfully',
      partnership: {
        id: partnership._id,
        seller: {
          id: seller._id,
          name: seller.name
        },
        retailer: {
          id: retailer._id,
          name: retailer.name
        },
        status: partnership.status,
        createdAt: partnership.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating partnership request:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update partnership status (seller)
exports.updatePartnershipStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "active" or "rejected"' });
    }

    // Find the partnership
    const partnership = await Partnership.findById(id);

    if (!partnership) {
      return res.status(404).json({ error: 'Partnership not found' });
    }

    // Verify that the user is the seller
    if (partnership.seller.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Only the seller can update partnership status' });
    }

    // Update the status
    partnership.status = status;
    await partnership.save();

    // Populate seller and retailer information
    await partnership.populate([
      { path: 'seller', select: 'name email' },
      { path: 'retailer', select: 'name email' }
    ]);

    res.status(200).json({
      message: `Partnership ${status === 'active' ? 'accepted' : 'rejected'} successfully`,
      partnership: {
        id: partnership._id,
        seller: {
          id: partnership.seller._id,
          name: partnership.seller.name
        },
        retailer: {
          id: partnership.retailer._id,
          name: partnership.retailer.name
        },
        status: partnership.status,
        updatedAt: partnership.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating partnership status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all partnerships for a user (both seller and retailer)
exports.getPartnerships = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query;
    if (userRole === 'seller') {
      query = { seller: userId };
    } else if (userRole === 'buyer') {
      query = { retailer: userId };
    } else {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    // Add status filter if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const partnerships = await Partnership.find(query)
      .populate('seller', 'name email')
      .populate('retailer', 'name email')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      partnerships: partnerships.map(p => ({
        id: p._id,
        seller: {
          id: p.seller._id,
          name: p.seller.name,
          email: p.seller.email
        },
        retailer: {
          id: p.retailer._id,
          name: p.retailer.name,
          email: p.retailer.email
        },
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error getting partnerships:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get available sellers for partnerships (for retailers)
exports.getAvailableSellers = async (req, res) => {
  try {
    const retailerId = req.user._id;

    // Ensure the user is a retailer
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ error: 'Only retailers can view available sellers' });
    }

    // Get all sellers
    const sellers = await User.find({ role: 'seller' }, 'name email');

    // Get existing partnerships
    const existingPartnerships = await Partnership.find({ retailer: retailerId });
    
    // Create a map of seller IDs to partnership status
    const partnershipMap = {};
    existingPartnerships.forEach(p => {
      partnershipMap[p.seller.toString()] = p.status;
    });

    // Format the response
    const availableSellers = sellers.map(seller => ({
      id: seller._id,
      name: seller.name,
      email: seller.email,
      partnershipStatus: partnershipMap[seller._id.toString()] || null
    }));

    res.status(200).json({ sellers: availableSellers });
  } catch (error) {
    console.error('Error getting available sellers:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get partnership details
exports.getPartnershipDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const partnership = await Partnership.findById(id)
      .populate('seller', 'name email')
      .populate('retailer', 'name email');

    if (!partnership) {
      return res.status(404).json({ error: 'Partnership not found' });
    }

    // Verify that the user is part of the partnership
    if (partnership.seller._id.toString() !== userId.toString() && 
        partnership.retailer._id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to view this partnership' });
    }

    res.status(200).json({
      partnership: {
        id: partnership._id,
        seller: {
          id: partnership.seller._id,
          name: partnership.seller.name,
          email: partnership.seller.email
        },
        retailer: {
          id: partnership.retailer._id,
          name: partnership.retailer.name,
          email: partnership.retailer.email
        },
        status: partnership.status,
        createdAt: partnership.createdAt,
        updatedAt: partnership.updatedAt
      }
    });
  } catch (error) {
    console.error('Error getting partnership details:', error);
    res.status(500).json({ error: error.message });
  }
};

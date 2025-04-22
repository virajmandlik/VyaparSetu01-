const Message = require('../models/Message');
const Partnership = require('../models/Partnership');

// SEND A MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    const { partnershipId, content } = req.body;
    const senderId = req.user._id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Validate partnership
    const partnership = await Partnership.findById(partnershipId);
    
    if (!partnership) {
      return res.status(404).json({ error: 'Partnership not found' });
    }

    if (partnership.status !== 'active') {
      return res.status(400).json({ error: 'Cannot send messages in inactive partnerships' });
    }

    // Verify that the user is part of the partnership
    if (partnership.seller.toString() !== senderId.toString() && 
        partnership.retailer.toString() !== senderId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to send messages in this partnership' });
    }

    // Create the message
    const message = new Message({
      partnership: partnershipId,
      sender: senderId,
      content
    });

    await message.save();

    // Populate sender information
    await message.populate('sender', 'name email role');

    res.status(201).json({
      message: {
        id: message._id,
        partnership: partnershipId,
        sender: {
          id: message.sender._id,
          name: message.sender.name,
          role: message.sender.role
        },
        content: message.content,
        createdAt: message.createdAt
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get messages for a partnership
exports.getMessages = async (req, res) => {
  try {
    const { id: partnershipId } = req.params;
    const userId = req.user._id;

    // Validate partnership
    const partnership = await Partnership.findById(partnershipId);
    
    if (!partnership) {
      return res.status(404).json({ error: 'Partnership not found' });
    }

    // Verify that the user is part of the partnership
    if (partnership.seller.toString() !== userId.toString() && 
        partnership.retailer.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to view messages in this partnership' });
    }

    // Get messages
    const messages = await Message.find({ partnership: partnershipId })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      messages: messages.map(message => ({
        id: message._id,
        partnership: message.partnership,
        sender: {
          id: message.sender._id,
          name: message.sender.name,
          role: message.sender.role
        },
        content: message.content,
        createdAt: message.createdAt
      }))
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: error.message });
  }
};

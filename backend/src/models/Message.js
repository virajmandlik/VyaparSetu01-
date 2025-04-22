const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  partnership: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Partnership', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;

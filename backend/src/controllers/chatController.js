const Chat = require('../models/Chat');
const User = require('../models/User');

const generateConversationId = (buyerId, vendorId) => {
  const ids = [buyerId, vendorId].sort().join('-');
  return `chat-${ids}`;
};

const getOrCreateConversation = async (req, res, next) => {
  try {
    const { vendorId, productId } = req.body;
    const buyerId = req.user.userId;

    const conversationId = generateConversationId(buyerId, vendorId);

    let chat = await Chat.findOne({ conversationId });

    if (!chat) {
      chat = new Chat({
        conversationId,
        buyerId,
        vendorId,
        productId: productId || null,
        messages: [],
      });
      await chat.save();
    }

    res.json(chat);
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, message, attachments } = req.body;
    const senderId = req.user.userId;

    if (!message && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: 'Message or attachments required' });
    }

    const chat = await Chat.findOne({ conversationId });

    if (!chat) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const senderType = chat.buyerId.toString() === senderId.toString() ? 'buyer' : 'vendor';

    chat.messages.push({
      senderId,
      senderType,
      message,
      attachments: attachments || [],
      isRead: false,
      createdAt: new Date(),
    });

    chat.lastMessage = message;
    chat.lastMessageTime = new Date();
    chat.lastMessageSenderId = senderId;

    // Update unread counts
    if (senderType === 'buyer') {
      chat.vendorUnreadCount += 1;
    } else {
      chat.buyerUnreadCount += 1;
    }

    await chat.save();

    res.status(201).json(chat);
  } catch (error) {
    next(error);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const conversations = await Chat.find({
      $or: [{ buyerId: userId }, { vendorId: userId }],
    })
      .populate('buyerId', 'name avatar')
      .populate('vendorId', 'storeName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ lastMessageTime: -1 });

    const total = await Chat.countDocuments({
      $or: [{ buyerId: userId }, { vendorId: userId }],
    });

    res.json({
      conversations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const chat = await Chat.findOne({ conversationId });

    if (!chat) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = chat.messages
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + parseInt(limit))
      .reverse();

    res.json({
      messages,
      total: chat.messages.length,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(chat.messages.length / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findOne({ conversationId });

    if (!chat) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Mark all messages as read for the user
    chat.messages.forEach(msg => {
      if (msg.senderId.toString() !== userId.toString()) {
        msg.isRead = true;
      }
    });

    // Reset unread count
    if (chat.buyerId.toString() === userId.toString()) {
      chat.buyerUnreadCount = 0;
    } else {
      chat.vendorUnreadCount = 0;
    }

    await chat.save();

    res.json(chat);
  } catch (error) {
    next(error);
  }
};

const closeConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const chat = await Chat.findOneAndUpdate(
      { conversationId },
      {
        status: 'closed',
        closedBy: req.user.userId,
        closedAt: new Date(),
      },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(chat);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrCreateConversation,
  sendMessage,
  getConversations,
  getConversationMessages,
  markAsRead,
  closeConversation,
};

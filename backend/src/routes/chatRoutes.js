const express = require('express');
const { verifyToken } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.post('/conversations', verifyToken, chatController.getOrCreateConversation);
router.get('/conversations', verifyToken, chatController.getConversations);
router.get('/conversations/:conversationId', verifyToken, chatController.getConversationMessages);
router.post('/messages', verifyToken, chatController.sendMessage);
router.put('/conversations/:conversationId/mark-read', verifyToken, chatController.markAsRead);
router.put('/conversations/:conversationId/close', verifyToken, chatController.closeConversation);

module.exports = router;

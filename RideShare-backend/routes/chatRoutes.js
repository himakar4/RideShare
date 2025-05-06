const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create a new chat
router.post('/', chatController.createChat);

// Get all chats for the authenticated user
router.get('/', chatController.getUserChats);

// Get messages for a specific chat
router.get('/:chatId/messages', chatController.getChatMessages);

// Send a message in a chat
router.post('/:chatId/messages', chatController.sendMessage);

// Mark messages as read
router.put('/:chatId/read', chatController.markMessagesAsRead);

module.exports = router; 
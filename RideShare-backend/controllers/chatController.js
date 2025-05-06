const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");
const mongoose = require("mongoose");

// Create a new chat between two users
exports.createChat = async (req, res) => {
  try {
    const { participantId, rideId } = req.body;
    const userId = req.user._id ? req.user._id : req.user.id;

    if (!participantId) {
      return res.status(400).json({ message: "Participant ID is required" });
    }
    if (!rideId) {
      return res.status(400).json({ message: "Ride ID is required" });
    }

    const userObjId =
      typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
    const participantObjId =
      typeof participantId === "string"
        ? new mongoose.Types.ObjectId(participantId)
        : participantId;
    const rideObjId =
      typeof rideId === "string" ? new mongoose.Types.ObjectId(rideId) : rideId;

    // Prevent self-chat
    if (userId.toString() === participantId.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot create chat with yourself" });
    }

    // Always sort participants to ensure unique pair
    const participantsSorted = [userObjId, participantObjId].sort((a, b) =>
      a.toString().localeCompare(b.toString())
    );

    // Validate both users and ride exist
    const [user, participant, ride] = await Promise.all([
      User.findById(participantsSorted[0]),
      User.findById(participantsSorted[1]),
      mongoose.model("Ride").findById(rideObjId),
    ]);

    if (!user || !participant) {
      return res.status(404).json({ message: "One or both users not found" });
    }
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Check if chat already exists for these users and this ride
    const existingChat = await Chat.findOne({
      participants: participantsSorted,
      ride: rideObjId,
    })
      .populate("participants", "name email profilePicture")
      .populate("ride");

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    // Create new chat
    const newChat = new Chat({
      participants: participantsSorted,
      lastMessageTime: new Date(),
      ride: rideObjId,
    });

    await newChat.save();

    // Populate participants and ride before sending response
    await newChat.populate("participants", "name email profilePicture");
    await newChat.populate("ride");
    res.status(201).json(newChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ message: "Failed to create chat" });
  }
};

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "name email profilePicture")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "name email profilePicture",
        },
      })
      .populate("ride")
      .sort({ lastMessageTime: -1 });

    // Get unread message counts for each chat
    const chatsWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chatId: chat._id,
          sender: { $ne: userId },
          read: false,
        });
        return {
          ...chat.toObject(),
          unreadCount,
        };
      })
    );

    res.status(200).json(chatsWithUnreadCount);
  } catch (error) {
    console.error("Error getting user chats:", error);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

// Get chat messages
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id ? req.user._id : req.user.id;
    const userObjId =
      typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

    // Verify user is part of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userObjId,
    });

    if (!chat) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({ chatId })
      .populate("sender", "name email profilePicture")
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        chatId,
        sender: { $ne: userId },
        read: false,
      },
      { $set: { read: true } }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error getting chat messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const { chatId } = req.params;
    const userId = req.user._id ? req.user._id.toString() : req.user.id;
    const userObjId =
      typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Verify user is part of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userObjId,
    });

    if (!chat) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Create new message
    const newMessage = new Message({
      chatId,
      sender: userId,
      content: content.trim(),
      read: false,
    });

    await newMessage.save();

    // Update chat's last message
    chat.lastMessage = newMessage._id;
    chat.lastMessageTime = new Date();
    await chat.save();

    // Populate sender info before sending response
    await newMessage.populate("sender", "name email profilePicture");

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Verify user is part of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Message.updateMany(
      {
        chatId,
        sender: { $ne: userId },
        read: false,
      },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
};

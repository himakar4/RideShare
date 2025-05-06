const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
//chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageTime: -1 });
chatSchema.index(
  { "participants.0": 1, "participants.1": 1 },
  { unique: true }
);

// Virtual for getting the other participant
chatSchema.virtual("otherParticipant").get(function () {
  return this.participants.find(
    (participant) => participant.toString() !== this._doc.currentUserId
  );
});

module.exports = mongoose.model("Chat", chatSchema);

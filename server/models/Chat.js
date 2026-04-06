const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  grade: {
    type: Number,
    required: true,
  },
  board: {
    type: String,
    required: true,
  },
  userMessage: {
    type: String,
    required: true,
  },
  aiReply: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Chat", chatSchema);

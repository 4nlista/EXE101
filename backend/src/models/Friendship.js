const mongoose = require('mongoose');
const { FRIENDSHIP_STATUS } = require('../constants/friendshipEnum');

// Schema quan hệ kết bạn 2 chiều
const friendshipSchema = new mongoose.Schema(
  {
    // Người gửi lời mời kết bạn
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Người nhận lời mời kết bạn
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // 'pending' | 'accepted' | 'rejected'
    status: {
      type: String,
      enum: Object.values(FRIENDSHIP_STATUS),
      default: FRIENDSHIP_STATUS.PENDING
    }
  },
  { timestamps: true }
);

// Index: tránh gửi trùng lời mời kết bạn
friendshipSchema.index({ requesterId: 1, receiverId: 1 }, { unique: true });

const Friendship = mongoose.model('Friendship', friendshipSchema);

module.exports = Friendship;

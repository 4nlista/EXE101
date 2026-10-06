const mongoose = require('mongoose');
const { AI_SENDER } = require('../constants/aiEnum');

const aiChatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'Cuộc hội thoại mới'
  },
  messages: [
    {
      sender: {
        type: String,
        enum: Object.values(AI_SENDER),
        required: true
      },
      text: {
        type: String,
        required: true
      },
      projects: [
        {
          projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project'
          },
          projectTitle: String,
          matchPercent: Number,
          skills: [String],
          reason: String
        }
      ],
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('AiChatSession', aiChatSessionSchema);

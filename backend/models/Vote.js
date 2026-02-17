const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true,
    index: true
  },
  fingerprint: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  optionIndex: {
    type: Number,
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for faster lookups
voteSchema.index({ pollId: 1, fingerprint: 1 });
voteSchema.index({ pollId: 1, ipAddress: 1 });

module.exports = mongoose.model('Vote', voteSchema);

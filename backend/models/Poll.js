const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    votes: {
      type: Number,
      default: 0
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Validate at least 2 options
pollSchema.pre('validate', function(next) {
  if (this.options.length < 2) {
    next(new Error('Poll must have at least 2 options'));
  } else if (this.options.length > 10) {
    next(new Error('Poll cannot have more than 10 options'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Poll', pollSchema);

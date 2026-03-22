const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    achievementType: {
      type: String,
      required: [true, 'Achievement type is required'],
      enum: [
        'STREAK_7',
        'STREAK_30',
        'HARDWARE_CHALLENGE',
        'MODULE_COMPLETED',
        'ARDUINO_TASK',
      ],
    },
    image: {
      type: String,
      default: null,
    },
    level: {
      type: Number,
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: {
          type: String,
          required: true,
          maxlength: 300,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Post', postSchema);
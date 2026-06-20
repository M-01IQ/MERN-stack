const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  url: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  duration: {
    type: Number,
    default: 4000 
  },
  fileId: {
    type: String, 
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // حذف تلقائي للستوري بعد 24 ساعة من إنشائها
  }
});

module.exports = mongoose.model('Story', storySchema);

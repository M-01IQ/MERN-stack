const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  // ربط الريل تلقائياً بمعرف المستخدم الموثق
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  videoUrl: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    default: "" 
  },
  songName: { 
    type: String, 
    default: "صوت أصلي" 
  },
  likes: { 
    type: Number, 
    default: 0 
  },
  comments: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

module.exports = mongoose.model('Reel', reelSchema);

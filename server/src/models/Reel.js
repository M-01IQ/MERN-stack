const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  videoUrl: { type: String, required: true },
  username: { type: String, required: true },
  description: { type: String, default: "" },
  songName: { type: String, default: "صوت أصلي" },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  avatarUrl: { type: String, default: "https://ik.imagekit.io/2vom8qfmg/images/profile.jpg" }
}, { timestamps: true });

module.exports = mongoose.model('Reel', reelSchema);

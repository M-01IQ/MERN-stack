const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  avatar: {
    type: String,
    required: false,
  },
  text: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    default: "",
  },
  mediaType: {
    type: String,
    enum: ["image", "video"],
    default: "image",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  // 🟢 إضافة حقل التعليقات الجديد هنا
  comments: [
    {
      text: { type: String, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  fileId: String,
}, { timestamps: true });

const PostModel = mongoose.model('Post', PostSchema);

module.exports = PostModel;

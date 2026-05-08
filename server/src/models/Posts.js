const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  text: {
    type: String,
    required: true,
  },
  // إضافة الإعجابات كمصفوفة
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // ربطها بمودل المستخدم
    }
  ],
  fileId: String,
}, { timestamps: true }); 

const PostModel = mongoose.model('Post', PostSchema);

module.exports = PostModel;

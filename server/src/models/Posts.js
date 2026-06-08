const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  avatar: { // رابط صورة المنشور المرفوعة
    type: String,
    required: false,
  },
  text: {
    type: String,
    required: true,
  },
  // ربط المنشور بالمستخدِم (مهم لجلب صورته واسمه)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // يجب أن يطابق اسم موديل المستخدمين في قاعدة البيانات
    required: true
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' 
    }
  ],
  fileId: String,
}, { timestamps: true }); 

const PostModel = mongoose.model('Post', PostSchema);

module.exports = PostModel;

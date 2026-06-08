const express = require("express");
const router = express.Router();
const PostModule = require("../models/Posts");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const ImageKit = require('imagekit');
const imagekit = new ImageKit({
    publicKey: process.env.IK_PUBLIC_KEY,
    privateKey: process.env.IK_PRIVATE_KEY,
    urlEndpoint: process.env.IK_URL_ENDPOINT
});

// 🟢 GET POSTS (مع جلب بيانات المستخدم)
router.get("/posts", verifyToken, async (req, res) => {
  try {
    const posts = await PostModule.find({})
      .populate("userId", "username avatar role") // جلب الاسم والصورة والرول من موديل المستخدم
      .sort({ _id: -1 });
    res.send(posts);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب البيانات" });
  }
});

// 🟢 ADD POST (حفظ معرف المستخدم تلقائياً)
router.post("/newpost", verifyToken, async (req, res) => {
  try {
    const {avatar, text, fileId } = req.body;

    const newPost = new PostModule({
      avatar,
      text,
      fileId,
      userId: req.user.id, // حفظ الـ ID القادم من التوكن تلقائياً هنا
      likes: [],
    });

    const savedPost = await newPost.save();
    
    // عمل populate للمنشور الجديد قبل إرساله عبر السوكيت لكي تظهر صورة الكاتب فوراً في الواجهة
    const populatedPost = await PostModule.findById(savedPost._id).populate("userId", "username avatar role");

    req.io.emit("newPost", populatedPost);
    return res.status(200).json(populatedPost);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "حدث خطأ في السيرفر" });
  }
});

// DELETE POST
router.delete("/deletePost/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const post = await PostModule.findById(id);

    if (!post) {
      return res.status(404).json({ message: "المنشور غير موجود" });
    }

    if (post.fileId) {
      imagekit.deleteFile(post.fileId, (err) => {
        if (err) console.error("IK Delete Error:", err.message);
        else console.log("IK Image Deleted");
      });
    }

    await PostModule.findByIdAndDelete(id);
    res.json({ message: "تم حذف المنشور بنجاح" });

  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "خطأ في عملية الحذف" });
  }
});

// UPDATE POST
router.put("/UpdatePost/:id", verifyToken, async (req, res) => { 
  try {
    const id = req.params.id;
    const updatedPost = await PostModule.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "خطأ في تعديل المنشور" });
  }
});

// LIKES POST 
router.put("/likepost/:id", verifyToken, async (req, res) => {
  try {
    const post = await PostModule.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "المنشور غير موجود" });

    const userId = req.user.id;
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    
    req.io.emit("post_likes_updated", { postId: post._id, likes: post.likes });
    res.json(post);
  } catch (err) {
    console.error("Like Error:", err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

module.exports = router;

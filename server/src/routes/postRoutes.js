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

// GET POSTS
router.get("/posts", verifyToken, async (req, res) => {
  try {
    const posts = await PostModule.find({}).sort({ _id: -1 });;
    res.send(posts);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب البيانات" });
  }
});

// ADD POST
router.post("/newpost", verifyToken, async (req, res) => {
  try {
    const { title, avatar, text, fileId } = req.body;

    const newPost = new PostModule({
      title,
      avatar,
      text,
      fileId,
      likes: [],
    });

    const savedPost = await newPost.save(); // حفظ المنشور في متغير
    req.io.emit("newPost",savedPost)
    return res.status(200).json(savedPost); // إرجاع المنشور نفسه بدلاً من رسالة نصية
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
      // استخدام الـ callback يحل مشكلة "is not a function" في معظم النسخ
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

module.exports = router;

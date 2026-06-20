const express = require("express");
const router = express.Router();
const PostModule = require("../models/Posts");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// إعداد مكتبة ImageKit (للصور)
const ImageKit = require('imagekit');
const imagekit = new ImageKit({
    publicKey: process.env.IK_PUBLIC_KEY,
    privateKey: process.env.IK_PRIVATE_KEY,
    urlEndpoint: process.env.IK_URL_ENDPOINT
});

// إعداد مكتبة Supabase (للفيديوهات)
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

// GET POSTS - جلب جميع المنشورات
router.get("/posts", verifyToken, async (req, res) => {
  try {
    const posts = await PostModule.find({})
      .populate("userId", "username avatar role")
      .populate("comments.userId", "username avatar role")
      .sort({ _id: -1 });
    res.send(posts);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب البيانات" });
  }
});

// ADD POST — إضافة منشور جديد (يقبل صور أو فيديوهات)
router.post("/newpost", verifyToken, async (req, res) => {
  try {
    const { avatar, text, fileId, videoUrl, mediaType } = req.body;

    const newPost = new PostModule({
      avatar,
      text,
      fileId, // معرف الملف في ImageKit (إذا كانت صورة)
      videoUrl:   videoUrl   || "", // رابط الفيديو في سوبابيز
      mediaType:  mediaType  || "image",
      userId: req.user.id,
      likes: [],
    });

    const savedPost = await newPost.save();
    const populatedPost = await PostModule.findById(savedPost._id)
      .populate("userId", "username avatar role");

    // إرسال المنشور الجديد فوراً عبر الـ Socket لجميع المستخدمين
    req.io.emit("newPost", populatedPost);
    return res.status(200).json(populatedPost);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "حدث خطأ في السيرفر" });
  }
});

// DELETE POST — حذف المنشور والملف التابع
router.delete("/deletePost/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const post = await PostModule.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "المنشور غير موجود" });

    //اذا كان الملف صورة
    if (post.fileId && post.mediaType !== "video") {
      imagekit.deleteFile(post.fileId, (err) => {
        if (err) console.error("IK Delete Error:", err.message);
        else console.log("IK Image Deleted Successfully");
      });
    }

//اذا كان الملف فيديو
if (post.mediaType === "video" && post.videoUrl) {
  try {
    const bucketName = 'vd';
    const urlParts = post.videoUrl.split(`/storage/v1/object/public/${bucketName}/`);
    
    if (urlParts.length > 1) {
      const fullFilePath = decodeURIComponent(urlParts[1]); 

      console.log("جاري محاولة حذف الملف من المسار:", fullFilePath);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .remove([fullFilePath]);

      if (error) {
        console.error("Supabase Storage Delete Error:", error.message);
      } else {
        console.log("Supabase Video Deleted Result:", data);
      }
    } else {
      console.error("لم يتمكن السيرفر من استخراج مسار الملف الصحيح من الرابط:", post.videoUrl);
    }

  } catch (supabaseErr) {
    console.error("Supabase Operation Failed:", supabaseErr);
  }
}


    // ─── جـ) حذف المنشور من قاعدة البيانات (MongoDB) ───
    await PostModule.findByIdAndDelete(req.params.id);

    req.io.emit("post_deleted", req.params.id);

    res.json({ message: "تم حذف المنشور والملفات المرفقة بنجاح" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "خطأ في عملية الحذف" });
  }
});

// UPDATE POST — تعديل المنشور
router.put("/UpdatePost/:id", verifyToken, async (req, res) => {
  try {
    const updatedPost = await PostModule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after' }
    );
    
    req.io.emit("post_updated", updatedPost);
    
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "خطأ في تعديل المنشور" });
  }
});

// LIKES POST — الإعجاب بالمنشور 
router.put("/likepost/:id", verifyToken, async (req, res) => {
  try {
    const post = await PostModule.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "المنشور غير موجود" });

    const userId = req.user.id;
    const index = post.likes.indexOf(userId);
    if (index === -1) post.likes.push(userId); // إضافة إعجاب
    else post.likes.splice(index, 1); // إزالة إعجاب

    await post.save();
    
    req.io.emit("post_likes_updated", { postId: post._id, likes: post.likes });
    
    res.json(post);
  } catch (err) {
    console.error("Like Error:", err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

//COMMENT ON POST — إضافة تعليق جديد
router.post("/commentpost/:id", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "لا يمكن إضافة تعليق فارغ" });
    }

    // 1. البحث عن المنشور وإضافة التعليق إلى المصفوفة
    const post = await PostModule.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "المنشور غير موجود" });

    const newComment = {
      text: text,
      userId: req.user.id,
    };

    post.comments.push(newComment);
    await post.save();

    // 2. عمل Populate لجلب بيانات المستخدمين لجميع التعليقات حتى تظهر الأسماء والصور في الفرونت إند
    const updatedPost = await PostModule.findById(post._id).populate({
      path: "comments.userId",
      select: "username avatar role"
    });

    req.io.emit("post_comments_updated", { 
      postId: updatedPost._id, 
      comments: updatedPost.comments 
    });

    // 4. إرجاع المنشور المحدث للفرونت إند
    res.json(updatedPost);
  } catch (err) {
    console.error("Comment Error:", err);
    res.status(500).json({ message: "خطأ في السيرفر أثناء إضافة التعليق" });
  }
});

//  EDIT COMMENT — تعديل تعليق 
router.put("/posts/:postId/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "لا يمكن ترك التعليق فارغاً" });
    }

    // البحث عن المنشور
    const post = await PostModule.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "المنشور غير موجود" });

    // البحث عن التعليق داخل المنشور
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "التعليق غير موجود" });

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "غير مسموح لك بتعديل هذا التعليق" });
    }

    // تحديث النص
    comment.text = text;
    await post.save();

    const updatedPost = await PostModule.findById(post._id).populate({
      path: "comments.userId",
      select: "username avatar role"
    });

    req.io.emit("post_comments_updated", { 
      postId: updatedPost._id, 
      comments: updatedPost.comments 
    });

    res.json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في السيرفر أثناء تعديل التعليق" });
  }
});

// DELETE COMMENT — حذف تعليق
router.delete("/posts/:postId/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const post = await PostModule.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "المنشور غير موجود" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "التعليق غير موجود" });

    // السماح بالحذف لصاحب التعليق، أو الـ Admin
    if (comment.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "غير مسموح لك بحذف هذا التعليق" });
    }

    comment.deleteOne();
    await post.save();

    const updatedPost = await PostModule.findById(post._id).populate({
      path: "comments.userId",
      select: "username avatar role"
    });

    // بث التحديث للجميع عبر الـ Socket
    req.io.emit("post_comments_updated", { 
      postId: updatedPost._id, 
      comments: updatedPost.comments 
    });

    res.json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في السيرفر أثناء حذف التعليق" });
  }
});

module.exports = router;

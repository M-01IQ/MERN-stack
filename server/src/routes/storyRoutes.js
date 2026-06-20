const express = require('express');
const router = express.Router();
const Story = require('../models/Story'); 
const { verifyToken } = require('../middleware/authMiddleware'); 

// 1️⃣ إعداد مكتبة ImageKit (للصور)
const ImageKit = require('imagekit');
const imagekit = new ImageKit({
    publicKey: process.env.IK_PUBLIC_KEY,
    privateKey: process.env.IK_PRIVATE_KEY,
    urlEndpoint: process.env.IK_URL_ENDPOINT
});

// 2️⃣ إعداد مكتبة Supabase (للفيديوهات)
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

// 🅰️ مسار جلب الستوريات (متاح للجميع)
router.get('/stories', async (req, res) => {
  try {
    const stories = await Story.find()
      .populate('userId', 'username avatar profileImage role')
      .sort({ createdAt: 1 }); 

    const groupedStories = stories.reduce((acc, story) => {
      if (!story.userId) return acc;
      const userId = story.userId._id.toString();

      if (!acc[userId]) {
        acc[userId] = {
          _id: userId,
          userId: story.userId,
          stories: []
        };
      }

      acc[userId].stories.push({
        _id: story._id,
        url: story.url,
        mediaType: story.mediaType,
        duration: story.duration,
        fileId: story.fileId,
        createdAt: story.createdAt
      });

      return acc;
    }, {});

    res.status(200).json(Object.values(groupedStories));
  } catch (err) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب الستوريات" });
  }
});

// 🅱️ مسار إضافة ستوري جديدة
router.post('/newstory', verifyToken, async (req, res) => {
  try {
    const { url, mediaType, duration, fileId } = req.body;

    if (!url || !mediaType) {
      return res.status(400).json({ error: "رابط الميديا ونوعها مطلوبان" });
    }

    const userId = req.user?._id || req.user?.id; 

    const newStory = new Story({
      userId,
      url,
      mediaType,
      duration: duration || (mediaType === 'video' ? 6000 : 4000),
      fileId: fileId || ""
    });

    const savedStory = await newStory.save();
    res.status(201).json(savedStory);
  } catch (err) {
    res.status(500).json({ error: "حدث خطأ أثناء حفظ الستوري في قاعدة البيانات" });
  }
});

// 🆃 مسار حذف ستوري محددة (مع حذف ميديا السيرفرات السحابية)
router.delete('/stories/:id', verifyToken, async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.user?._id || req.user?.id; 

    const story = await Story.findById(storyId);
    
    if (!story) {
      return res.status(404).json({ error: "الستوري غير موجودة أو انتهت صلاحيتها بالفعل" });
    }

    // التحقق من الصلاحية البرمجية (صاحب الستوري أو الأدمن)
    if (story.userId.toString() !== userId?.toString() && req.user?.role !== "admin") {
      return res.status(403).json({ error: "غير مصرح لك بحذف هذه الستوري" });
    }

    // الحذف من سيرفر الـ ImageKit إذا كانت صورة
    if (story.mediaType === "image" && story.fileId) {
      imagekit.deleteFile(story.fileId, (err) => {
        if (err) console.error("IK Delete Story Error:", err.message);
      });
    }

    // الحذف من باكت Supabase Storage إذا كان فيديو
    if (story.mediaType === "video" && story.url) {
      try {
        const bucketName = 'vd'; // تأكد أن هذا هو اسم الباكت المخصص للفيديوهات لديك
        const urlParts = story.url.split(`/storage/v1/object/public/${bucketName}/`);
        if (urlParts.length > 1) {
          const fullFilePath = decodeURIComponent(urlParts[1]); 
          await supabase.storage.from(bucketName).remove([fullFilePath]);
        }
      } catch (supabaseErr) {
        console.error("Supabase Story Video Delete Failed:", supabaseErr);
      }
    }

    await Story.findByIdAndDelete(storyId);
    res.status(200).json({ message: "تم حذف الستوري بنجاح" });
  } catch (err) {
    res.status(500).json({ error: "حدث خطأ أثناء محاولة حذف الستوري" });
  }
});

module.exports = router;

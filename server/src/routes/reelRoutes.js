const express = require('express');
const router = express.Router();
const Reel = require('../models/Reel');

// استدعاء الميدل وير الخاص بالحماية والتحقق
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// إعداد مكتبة Supabase 
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

// 1️⃣ جلب الفيديوهات (متاح لجميع الزوار مع جلب بيانات الحساب تلقائياً)
router.get('/', async (req, res) => {
  try {
    // عمل populate لـ userId لجلب الاسم والصورة الشخصية من جدول المستخدمين
    const reels = await Reel.find()
      .populate('userId', 'username avatar profileImage') 
      .sort({ createdAt: -1 });
    res.json(reels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2️⃣ [🔒 محمي للأدمن] إضافة فيديو جديد (يربط الفيديو بحساب الأدمن الحالي تلقائياً)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { videoUrl, description, songName } = req.body;
    
    const newReel = new Reel({
      userId: req.user.id, // تم جلب المعرف الموثق من الميدل وير verifyToken
      videoUrl,
      description,
      songName
    });

    let savedReel = await newReel.save();
    
    // عمل populate للمستند الجديد قبل إرجاعه للفرونت إند لتحديث الواجهة فوراً بالبيانات الصحيحة
    savedReel = await savedReel.populate('userId', 'username avatar profileImage');
    
    res.status(201).json(savedReel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 3️⃣ [🔒 محمي للأدمن] حذف فيديو من السيرفر ومن سوبابيز
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    // أ) ابحث عن الريل أولاً للتأكد من وجوده وجلب بياناته
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({ message: "الفيديو غير موجود أساساً" });
    }

    // ب) إذا كان هناك رابط فيديو مخزن، قم بحذفه من Supabase Storage
    if (reel.videoUrl) {
      try {
        const bucketName = 'vd'; 

        // استخراج مسار الملف من الرابط
        const urlParts = reel.videoUrl.split(`/storage/v1/object/public/${bucketName}/`);
        
        if (urlParts.length > 1) {
          const fullFilePath = decodeURIComponent(urlParts[1]); 
          console.log(`[Reels] جاري حذف الفيديو من سوبابيز: ${fullFilePath}`);

          const { data, error } = await supabase.storage
            .from(bucketName)
            .remove([fullFilePath]);

          if (error) {
            console.error("[Supabase Reels Delete Error]:", error.message);
          } else {
            console.log("[Supabase Reels Deleted Result]:", data);
          }
        }
      } catch (supabaseErr) {
        console.error("Supabase Operation Failed for Reel:", supabaseErr);
      }
    }

    // جـ) الآن احذف المستند نهائياً من قاعدة بيانات MongoDB
    await Reel.findByIdAndDelete(req.params.id);
    
    res.json({ message: "تم حذف الريل وملف الفيديو من سوبابيز بنجاح" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

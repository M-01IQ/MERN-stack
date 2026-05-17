const express = require('express');
const router = express.Router();
const Reel = require('../models/Reel');

// استدعاء الميدل وير الخاص بك
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// 1. جلب الفيديوهات (متاح لجميع الزوار بدون شروط)
router.get('/', async (req, res) => {
  try {
    const reels = await Reel.find().sort({ createdAt: -1 });
    res.json(reels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. [🔒 محمي للأدمن] إضافة فيديو جديد 
// نمرر أولاً verifyToken للتأكد من وجود التوكن، ثم isAdmin للتأكد من أنه أدمن
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const newReel = new Reel(req.body);
    const savedReel = await newReel.save();
    res.status(201).json(savedReel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 3. [🔒 محمي للأدمن] حذف فيديو
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedReel = await Reel.findByIdAndDelete(req.params.id);
    if (!deletedReel) {
      return res.status(404).json({ message: "الفيديو غير موجود أساساً" });
    }
    res.json({ message: "تم حذف الريل بنجاح" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

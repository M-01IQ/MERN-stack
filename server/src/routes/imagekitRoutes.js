const express = require('express');
const router = express.Router();
const crypto = require('crypto'); // مكتبة مدمجة في نود
const { v4: uuidv4 } = require('uuid'); // تأكد من تثبيتها: npm install uuid

router.get('/imagekitRoutes', (req, res) => {
  try {
    const privateKey = process.env.IK_PRIVATE_KEY;
    const token = uuidv4(); // إنشاء توكن فريد
    const expire = Math.floor(Date.now() / 1000) + 2400; // وقت الانتهاء بعد 40 دقيقة

    // توليد التوقيع يدوياً باستخدام HMAC-SHA1
    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(token + expire)
      .digest('hex');

    res.json({
      token,
      expire,
      signature
    });
  } catch (error) {
    console.error("خطأ في توليد التوقيع يدوياً:", error);
    res.status(500).json({ error: "فشل إنشاء بيانات التوثيق" });
  }
});

module.exports = router;

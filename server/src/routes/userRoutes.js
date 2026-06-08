const express = require("express");
const router = express.Router();
const UserModule = require("../models/Users");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ImageKit = require("imagekit"); // استيراد حزمة ImageKit الحذف
const JWT_SECRET = process.env.JWT_SECRET;
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// إعداد كائن تشغيل ImageKit الخاص بالخلفية
const imagekit = new ImageKit({
  publicKey: process.env.IK_PUBLIC_KEY || "public_8blKLRTsq6BkdVQ5OMD+OGPzNSM=",
  privateKey: process.env.IK_PRIVATE_KEY,
  urlEndpoint: process.env.IK_URL_ENDPOINT
});

// GET USERS
router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await UserModule.find({}).select("-password");
    res.send(users);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب البيانات" });
  }
});

// GET USER (ME)
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await UserModule.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب بيانات الحساب" });
  }
});

// REGISTER USER
router.post("/register", async (req, res) => {
  try {
    const { username, password, email, age, role } = req.body;

    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = new UserModule({
      username,
      email,
      age,
      role: role || "user",
      password: hashedPassword,
    });

    // حفظ المستخدم في قاعدة البيانات
    const savedUser = await newUser.save();
    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role }, 
      JWT_SECRET
    );
    return res.status(200).json({ 
      message: "تم إنشاء الحساب بنجاح",
      token: token,
      userID: savedUser._id,
      username: savedUser.username,
      role: savedUser.role
    });
    
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "اسم المستخدم أو البريد الإلكتروني مسجل مسبقاً" 
      });
    }
    console.error(err);
    return res.status(500).json({ message: "حدث خطأ في السيرفر" });
  }
});

// LOGIN USER
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserModule.findOne({ username });

    if (!user || !(await bcryptjs.compare(password, user.password))) {
      return res.status(401).json({ message: "خطأ في الاسم او كلمة المرور" });
    }

    // تحديث التوكن ليشمل الهوية والدور
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);

    // إرجاع كافة البيانات المطلوبة لصفحة الـ Profile
    return res.json({
      token: token,
      userID: user._id,
      username: user.username,
      email: user.email,
      age: user.age,
      role: user.role,
      message: "تم تسجيل الدخول بنجاح!"
    });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ في السيرفر" });
  }
});

// DELETE USER
router.delete("/deleteUser/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await UserModule.findByIdAndDelete(id);
    res.json({ message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "خطأ في عملية الحذف" });
  }
});

// UPDATE USER
router.put("/UpdateUser/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const UpdateData = req.body;

    // تشفير الرمز السري الجديد إن وجد
    if (UpdateData.password) {
      UpdateData.password = await bcryptjs.hash(UpdateData.password, 10);
    }

    // جلب معلومات المستخدم الحالية المخزنة
    const currentUser = await UserModule.findById(id);
    if (!currentUser) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    
    if (UpdateData.fileId && currentUser.fileId && currentUser.fileId !== UpdateData.fileId) {
      try {
        // حذف الصورة الشخصية القديمة
        await imagekit.deleteFile(currentUser.fileId);
        console.log(`تم بنجاح إزالة الصورة السابقة ذات المعرف: ${currentUser.fileId}`);
      } catch (ikError) {
        //اذا فشل حذف الصورة 
        console.error("فشل حذف الصورة من خوادم ImageKit:", ikError.message);
      }
    }
    
    const updatedUser = await UserModule.findByIdAndUpdate(
      id, 
      UpdateData, 
      { returnDocument: 'after' }
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "خطأ في تعديل معلومات المستخدم " });
  }
});

module.exports = router;

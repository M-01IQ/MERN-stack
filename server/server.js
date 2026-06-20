require('dotenv').config(); 
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./src/config/db");

const userRoutes = require("./src/routes/userRoutes");
const postRoutes = require("./src/routes/postRoutes");
const imagekitRoutes = require("./src/routes/imagekitRoutes");
const reelRoutes = require('./src/routes/reelRoutes');
const storyRoutes = require('./src/routes/storyRoutes'); // استدعاء ملف الستوريات المفصول

const app = express();
const PORT = process.env.PORT || 8080;
const frontend = process.env.frontend;

app.use(cors({
  origin: frontend,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: frontend,
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true 
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

connectDB();

app.get("/", (req, res) => { res.send("server is running 🚀") });

// تفعيل المسارات النشطة
app.use("/api", userRoutes);
app.use("/api", postRoutes);
app.use('/api', imagekitRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api', storyRoutes); // مسار الستوريات الجديد المفصول تماماً

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "حدث خطأ غير متوقع في الخادم" });
});

server.listen(PORT, () => {
  console.log(`server working on ${PORT}`);
});

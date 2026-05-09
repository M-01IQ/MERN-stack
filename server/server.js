require('dotenv').config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./src/config/db");

const userRoutes = require("./src/routes/userRoutes");
const postRoutes = require("./src/routes/postRoutes");
const imagekitRoutes = require("./src/routes/imagekitRoutes");

const app = express();
const PORT = process.env.PORT || 8080;
const frontend = process.env.frontend
// إنشاء سيرفر HTTP وربطه بـ Express
const server = http.createServer(app);

// إعداد Socket.io مع السماح بـ CORS
const io = new Server(server, {
  cors: {
    origin: frontend,
    methods: ["GET", "POST"]
  }
});

// تمرير io إلى الـ Request ليكون متاحاً داخل الـ Routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => { res.send("welcome") });

app.use("/api", userRoutes);
app.use("/api", postRoutes);
app.use('/api/', imagekitRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "حدث خطأ غير متوقع في الخادم" });
});

server.listen(PORT, () => {
  console.log(`server working on ${PORT}`);
});

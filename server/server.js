require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
//require Routs
const userRoutes = require("./src/routes/userRoutes");
const postRoutes = require("./src/routes/postRoutes");
const imagekitRoutes = require("./src/routes/imagekitRoutes");

const app = express();
const PORT = process.env.PORT || 8080;
//Medale Wear
app.use(cors());
app.use(express.json());
//connect database
connectDB();

app.get("/",(req,res)=>{res.send("welcom")})

//Routes
app.use("/api",userRoutes);
app.use("/api",postRoutes);
app.use('/api/', imagekitRoutes);
//Dealing with Error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "حدث خطأ غير متوقع في الخادم" });})

//Start Server
app.listen(PORT,()=>{
  console.log(`
  server working on ${PORT}
  `);
});

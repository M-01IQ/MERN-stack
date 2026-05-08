const mongoose = require("mongoose");

//Conecting Database -mdb
const username = process.env.DB_USERNAME,
        password = process.env.DB_PASSWORD,
          database = process.env.DB_NAME;
          
const dbURL=`mongodb+srv://${username}:${password}@cluster0.zimrq94.mongodb.net/${database}`
const connectDB = async ()=>{
  try{await mongoose.connect(dbURL)
    console.log("تم الاتصال بقاعدة البيانات")
  }
  catch(err){console.log("فشل الاتصال بقاعدة البيانات",err.message)
  process.exit(1)
  }
}
module.exports = connectDB;
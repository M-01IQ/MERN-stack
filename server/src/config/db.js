const mongoose = require("mongoose");

//Conecting Database -mdb
const username = process.env.DB_USERNAME,
        password = process.env.DB_PASSWORD,
          database = process.env.DB_NAME;
          
const dbURL=`mongodb://${username}:${password}@ac-1netvfn-shard-00-00.zimrq94.mongodb.net:27017,ac-1netvfn-shard-00-01.zimrq94.mongodb.net:27017,ac-1netvfn-shard-00-02.zimrq94.mongodb.net:27017/${database}?ssl=true&replicaSet=atlas-w655en-shard-0&authSource=admin&appName=Cluster0`
const connectDB = async ()=>{
  try{await mongoose.connect(dbURL)
    console.log("تم الاتصال بقاعدة البيانات")
  }
  catch(err){console.log("فشل الاتصال بقاعدة البيانات",err.message)
  }
}
module.exports = connectDB;
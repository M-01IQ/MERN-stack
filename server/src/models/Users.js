const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  age: Number,
  avatar: String,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guest'],
    default: 'user',
  }
}, { timestamps: true });  // ← يضيف createdAt و updatedAt تلقائياً

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
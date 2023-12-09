const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    gender: String,
    profileImage: String,
    coverPhoto: String,
    dob: String,
    city: String,
    country: String,
    aboutMe: String,
    friends: [String],
    pages: [String],
    notification: [String],
    groups: [String],
    posts: [String],
    accessToken: String,
  });
  
  const User = mongoose.model("User", userSchema);
  module.exports = User;
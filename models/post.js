const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    caption: String,
    image: String,
    video: String,
    type: String,
    createdAt: Number,
    likers: [String],
    comments: [String],
    shares: [String],
    user: {
      _id: String,
      name: String,
      profileImage: String,
    },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
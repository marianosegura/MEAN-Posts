const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imagePath: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true }
});

module.exports = mongoose.model('Post', postSchema);  // schema -> model to create objects 
// creates collection name posts (original is lowercased and pluralized)

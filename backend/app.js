const express = require('express');
const bodyParser = require('body-parser');  
const mongoose = require('mongoose');
const path = require('path');
const postsRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');

// EXPRESS CONFIG
const app = express();

app.use(bodyParser.json());  // parsing request data 
app.use("/images", express.static(path.join("images")));  // map /images requests to our real folder from root to give access

app.use((req, res, next) => {  // solving CORS security problem for every path
  res.setHeader("Access-Control-Allow-Origin", "*");  // allow anyone to access our resources
  res.header("Access-Control-Allow-Credentials", true);
  res.setHeader(
    "Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Headers");  // added Authorization for token
  res.setHeader(
    "Access-Control-Allow-Methods", 
    "GET, POST, PATCH, PUT, DELETE, OPTIONS");  // allowed methods

  if (req.method === 'OPTIONS') {
    res.status(200);
  }

  next();
});

// MONGO CONFIG                                                                                                              options for deprecation warnings
mongoose.connect(`mongodb+srv://web-app:${ process.env.MONGO_ATLAS_PWD }@cluster0.dzfxv.mongodb.net/mean-posts?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => {
    console.log("Connected to mongo atlas db!");
  })
  .catch(() => {
    console.log("Failed to connect to mongo atlas db!");
  });

// ROUTES
app.use("/api/posts", postsRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;

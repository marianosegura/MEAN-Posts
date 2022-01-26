const express = require('express');
const checkAuth = require('../middleware/check-auth');  // verify auth token in header
const extractImage = require('../middleware/extract-image');
const PostsController = require('./controllers/posts');



const router = express.Router();

// GET POSTS
router.get("", PostsController.getPosts);

// GET POST
router.get("/:id", PostsController.getPost);

// POST POST
router.post("", checkAuth, extractImage, PostsController.createPost
);

// PUT POST
router.put("/:id", checkAuth, extractImage, PostsController.updatePost
);

// DELETE POST
router.delete("/:id", checkAuth, PostsController.deletePost);

module.exports = router;

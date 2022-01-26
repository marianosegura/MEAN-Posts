const express = require('express');
const router = express.Router();
const AuthController = require('./controllers/auth');

// POST (SIGN UP)
router.post("/signup", AuthController.signUp);

// POST (SIGN IN)
router.post("/signin", AuthController.signIn);

module.exports = router;
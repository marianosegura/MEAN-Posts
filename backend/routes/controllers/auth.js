const bcrypt = require('bcryptjs');  // for password encryption
const jsonwebtoken = require ('jsonwebtoken');  // for token management
const User = require('../../models/user');

exports.signUp = async (req, res, next) => {
  const { username, email, password } = req.body;
  console.log(`\nSigning up user (username: ${username}, email: ${email})...`);

  try {
    const isEmailRegistered = await User.exists({ email: email });
    if (isEmailRegistered) {
      console.log(`Email already registered (${username})...`);
      return res.status(500).json({ message: "Email already registered." })
    }

    const isUsernameRegistered = await User.exists({ username: username });
    if (isUsernameRegistered) {
      console.log(`Username already in use (${username})...`);
      return res.status(500).json({ message: "Username already in use. Try another one." })
    }

    const encryptedPassword = await bcrypt.hash(password, 10);  // salt = 10 lenght, secure enough, doesn't take too much time to generate
    const user = new User({ username, email, password: encryptedPassword });

    await user.save();  // save user
    console.log(`Signed up user (${username})!`);
    return res.status(201).json({ message: 'User created successfully' });

  } catch (error) {
    console.log(`Failed sign up (${username})!`);
    return res.status(500).json({ message: "An error occurred signing up user." })
  }
};

exports.signIn = async (req, res, next) => {
  const { username, password } = req.body;
  console.log(`\nSigning in user (username: ${username})...`);

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      console.log(`Username not registered (${username})...`);
      return res.status(500).json({ message: "Username not registered." })
    }
    
    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) {
      console.log(`Incorrect password (${username})...`);
      return res.status(500).json({ message: "Incorrect password." })
    }

    const token = jsonwebtoken.sign(  // sign in success, create token
      { username: user.username, email: user.email, userId: user._id },  // data to generate token
      process.env.TOKEN_JWT_SECRET,  // for dev, in reality should be longer 
      { expiresIn: "1h" }  // extra config options
    );

    console.log(`Signed in, sending back token (${username})`);
    res.status(200).json({  // ok, return token
      token: token,
      expiresIn: "3600",
      userId: user._id  // encoded in the token, pass to avoid decoding in the frontend
    });

  } catch (error) {
    return res.status(401).json({ message: "Error signing in." });
  }
};
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },  // unique is no validator, but a tool for internal optimization
  email: { type: String, required: true, unique: true }, 
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);  // add validator as plugin

module.exports = mongoose.model('User', userSchema); 

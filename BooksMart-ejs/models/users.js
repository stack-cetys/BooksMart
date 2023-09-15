const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
  }
});

usersSchema.statics.findByEmail = function (name) {
  return this.find({ name: new RegExp(name, "i")})
}

const users = mongoose.model("users", usersSchema);
module.exports = users;
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function(v) {
        return v.endsWith('@nestgroup.net');
      },
      message: 'Email must be from @nestgroup.net domain'
    }
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

module.exports = mongoose.model("User", UserSchema);

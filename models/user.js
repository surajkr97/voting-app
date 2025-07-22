const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String},
  number: { type: String},
  address: { type: String, required: true },
  aadharCardNumber: { type: Number, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['voter', 'admin'], default: 'voter' },
  isVoted: { type: Boolean, default: false },
});

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    return next(err);
  }
});

// ✅ Add the comparePassword method
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;

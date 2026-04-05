const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
 
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['employee', 'hr'],
      default: 'employee',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Total leave balance per type
    leaveBalance: {
      casual: { type: Number, default: 12 },
      sick: { type: Number, default: 10 },
      earned: { type: Number, default: 15 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
 
// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
 
// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
 
// Auto-generate employeeId
userSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    const count = await mongoose.model('User').countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
  }
  next();
});
 
module.exports = mongoose.model('User', userSchema);
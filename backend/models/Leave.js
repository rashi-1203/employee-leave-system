const mongoose = require('mongoose');
 
const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['casual', 'sick', 'earned'],
      required: [true, 'Leave type is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    numberOfDays: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      minlength: 10,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    hrComment: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);
 
// Calculate number of days before saving
leaveSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    const msPerDay = 1000 * 60 * 60 * 24;
    this.numberOfDays =
      Math.round((this.endDate - this.startDate) / msPerDay) + 1;
  }
  next();
});
 
// Validate endDate is not before startDate
leaveSchema.pre('save', function (next) {
  if (this.endDate < this.startDate) {
    return next(new Error('End date cannot be before start date'));
  }
  next();
});
 
module.exports = mongoose.model('Leave', leaveSchema);
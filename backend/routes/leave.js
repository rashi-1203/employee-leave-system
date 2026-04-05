const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const { protect, hrOnly } = require('../middleware/authMiddleware');
 
// @route   POST /api/leave/apply
// @desc    Employee applies for leave
// @access  Private (employee)
router.post('/apply', protect, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
 
    if (!leaveType || !startDate || !endDate || !reason) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }
 
    const start = new Date(startDate);
    const end = new Date(endDate);
 
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date',
      });
    }
 
    // Calculate days
    const msPerDay = 1000 * 60 * 60 * 24;
    const numberOfDays = Math.round((end - start) / msPerDay) + 1;
 
    // Check leave balance
    const user = await User.findById(req.user._id);
    if (user.leaveBalance[leaveType] < numberOfDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveType} leave balance. Available: ${user.leaveBalance[leaveType]} days`,
      });
    }
 
    // Check for overlapping leave applications
    const overlap = await Leave.findOne({
      employee: req.user._id,
      status: { $ne: 'rejected' },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });
 
    if (overlap) {
      return res.status(400).json({
        success: false,
        message: 'You already have a leave application for overlapping dates',
      });
    }
 
    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      numberOfDays,
      reason,
    });
 
    await leave.populate('employee', 'name email department employeeId');
 
    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
 
// @route   GET /api/leave/my-leaves
// @desc    Get all leaves of the logged-in employee
// @access  Private (employee)
router.get('/my-leaves', protect, async (req, res) => {
  try {
    const { status, leaveType, page = 1, limit = 10 } = req.query;
 
    const filter = { employee: req.user._id };
    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;
 
    const leaves = await Leave.find(filter)
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
 
    const total = await Leave.countDocuments(filter);
 
    res.json({
      success: true,
      data: leaves,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
 
// @route   GET /api/leave/all-leaves
// @desc    Get all leave applications (HR view)
// @access  Private (HR only)
router.get('/all-leaves', protect, hrOnly, async (req, res) => {
  try {
    const { status, leaveType, department, page = 1, limit = 10 } = req.query;
 
    const filter = {};
    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;
 
    let leaves = await Leave.find(filter)
      .populate('employee', 'name email department employeeId')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });
 
    // Filter by department if provided
    if (department) {
      leaves = leaves.filter(
        (l) => l.employee.department.toLowerCase() === department.toLowerCase()
      );
    }
 
    const total = leaves.length;
    const paginated = leaves.slice((page - 1) * limit, page * limit);
 
    res.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
 
// @route   PUT /api/leave/update-status/:id
// @desc    HR approves or rejects a leave
// @access  Private (HR only)
router.put('/update-status/:id', protect, hrOnly, async (req, res) => {
  try {
    const { status, hrComment } = req.body;
 
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected',
      });
    }
 
    const leave = await Leave.findById(req.params.id).populate('employee');
 
    if (!leave) {
      return res
        .status(404)
        .json({ success: false, message: 'Leave application not found' });
    }
 
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Leave already ${leave.status}. Cannot update again.`,
      });
    }
 
    // If approved, deduct from leave balance
    if (status === 'approved') {
      const employee = await User.findById(leave.employee._id);
      if (employee.leaveBalance[leave.leaveType] < leave.numberOfDays) {
        return res.status(400).json({
          success: false,
          message: 'Employee does not have sufficient leave balance',
        });
      }
      employee.leaveBalance[leave.leaveType] -= leave.numberOfDays;
      await employee.save();
    }
 
    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.hrComment = hrComment || '';
    await leave.save();
 
    await leave.populate('reviewedBy', 'name email');
 
    res.json({
      success: true,
      message: `Leave ${status} successfully`,
      data: leave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
 
// @route   DELETE /api/leave/cancel/:id
// @desc    Employee cancels a pending leave
// @access  Private (employee)
router.delete('/cancel/:id', protect, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
 
    if (!leave) {
      return res
        .status(404)
        .json({ success: false, message: 'Leave not found' });
    }
 
    if (leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own leave applications',
      });
    }
 
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leaves can be cancelled',
      });
    }
 
    await leave.deleteOne();
 
    res.json({ success: true, message: 'Leave application cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
 
// @route   GET /api/leave/summary
// @desc    Get leave summary stats for logged-in employee
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const userId = req.user._id;
 
    const [totalApplied, approved, rejected, pending] = await Promise.all([
      Leave.countDocuments({ employee: userId }),
      Leave.countDocuments({ employee: userId, status: 'approved' }),
      Leave.countDocuments({ employee: userId, status: 'rejected' }),
      Leave.countDocuments({ employee: userId, status: 'pending' }),
    ]);
 
    // Monthly breakdown (current year)
    const year = new Date().getFullYear();
    const monthlyBreakdown = await Leave.aggregate([
      {
        $match: {
          employee: userId,
          status: 'approved',
          startDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$startDate' }, leaveType: '$leaveType' },
          totalDays: { $sum: '$numberOfDays' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);
 
    const user = await User.findById(userId).select('leaveBalance');
 
    res.json({
      success: true,
      data: {
        totalApplied,
        approved,
        rejected,
        pending,
        leaveBalance: user.leaveBalance,
        monthlyBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
 
module.exports = router;
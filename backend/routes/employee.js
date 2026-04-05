const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Leave = require('../models/Leave');
const { protect, hrOnly } = require('../middleware/authMiddleware');
 
// @route   GET /api/employee/all
// @desc    Get all employees (HR only)
// @access  Private (HR)
router.get('/all', protect, hrOnly, async (req, res) => {
  try {
    const { department, search } = req.query;
 
    const filter = { role: 'employee' };
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }
 
    const employees = await User.find(filter).select('-password').sort({ createdAt: -1 });
 
    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
 
// @route   GET /api/employee/:id
// @desc    Get a single employee with their leave history
// @access  Private (HR)
router.get('/:id', protect, hrOnly, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
 
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
 
    const leaves = await Leave.find({ employee: req.params.id })
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
 
    res.json({
      success: true,
      data: {
        employee,
        leaves,
        totalLeavesTaken: leaves.filter((l) => l.status === 'approved').length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
 
// @route   PUT /api/employee/deactivate/:id
// @desc    Deactivate an employee account (HR only)
// @access  Private (HR)
router.put('/deactivate/:id', protect, hrOnly, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
 
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
 
    if (employee.role === 'hr') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate HR accounts' });
    }
 
    employee.isActive = false;
    await employee.save();
 
    res.json({ success: true, message: `${employee.name}'s account deactivated` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
 
// @route   GET /api/employee/departments/list
// @desc    Get unique departments
// @access  Private
router.get('/departments/list', protect, async (req, res) => {
  try {
    const departments = await User.distinct('department');
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
 
module.exports = router;
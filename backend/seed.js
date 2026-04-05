const mongoose = require('mongoose');
const User = require('./models/User');
const Leave = require('./models/Leave');
require('dotenv').config();
 
const seedData = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
 
  // Clear existing data
  await User.deleteMany({});
  await Leave.deleteMany({});
  console.log('Cleared existing data');
 
  // Create HR user
  const hr = await User.create({
    name: 'Priya Sharma',
    email: 'hr@company.com',
    password: 'hr123456',
    role: 'hr',
    department: 'Human Resources',
  });
 
  // Create employees
  const emp1 = await User.create({
    name: 'Rahul Mehta',
    email: 'rahul@company.com',
    password: 'emp123456',
    role: 'employee',
    department: 'Engineering',
  });
 
  const emp2 = await User.create({
    name: 'Sneha Patel',
    email: 'sneha@company.com',
    password: 'emp123456',
    role: 'employee',
    department: 'Marketing',
  });
 
  // Create some leave applications
  await Leave.create({
    employee: emp1._id,
    leaveType: 'sick',
    startDate: new Date('2025-02-10'),
    endDate: new Date('2025-02-12'),
    numberOfDays: 3,
    reason: 'High fever and doctor advised bed rest for 3 days',
    status: 'approved',
    reviewedBy: hr._id,
    reviewedAt: new Date('2025-02-09'),
    hrComment: 'Approved. Get well soon.',
  });
 
  await Leave.create({
    employee: emp1._id,
    leaveType: 'casual',
    startDate: new Date('2025-03-05'),
    endDate: new Date('2025-03-05'),
    numberOfDays: 1,
    reason: 'Family function - sister\'s engagement ceremony',
    status: 'pending',
  });
 
  await Leave.create({
    employee: emp2._id,
    leaveType: 'earned',
    startDate: new Date('2025-03-15'),
    endDate: new Date('2025-03-20'),
    numberOfDays: 6,
    reason: 'Annual family vacation to Goa',
    status: 'approved',
    reviewedBy: hr._id,
    reviewedAt: new Date('2025-03-10'),
  });
 
  console.log('\n--- Seed completed ---');
  console.log('HR Login:       hr@company.com     / hr123456');
  console.log('Employee 1:     rahul@company.com  / emp123456');
  console.log('Employee 2:     sneha@company.com  / emp123456');
  console.log('----------------------\n');
 
  await mongoose.disconnect();
};
 
seedData().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
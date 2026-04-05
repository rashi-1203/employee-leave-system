const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
 
const authRoutes = require('./routes/auth');
const leaveRoutes = require('./routes/leave');
const employeeRoutes = require('./routes/employee');
 
const app = express();
 
// Middleware
app.use(cors());
app.use(express.json());
 
// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
 
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/employee', employeeRoutes);
 
// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Employee Leave Management API is running' });
});
 
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});
 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
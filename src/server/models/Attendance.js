// models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true, ref: 'Student' },
  adminId: { type: String, required: true, ref: 'Admin' },
  date: { type: String, required: true }, // Store in 'YYYY-MM-DD' format
  status: { type: String, enum: ['present', 'absent'], default: 'present' },
}, {
  timestamps: true
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;

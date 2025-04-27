const cron = require('node-cron');
const Student = require('../models/Student');

// Runs every day at 00:00
const scheduleAttendanceReset = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      await Student.updateMany({}, { attendanceStatus: 'Absent' });
      console.log('✅ Daily attendance status reset to Absent for all students.');
    } catch (error) {
      console.error('❌ Error resetting attendance status:', error);
    }
  });
};

module.exports = scheduleAttendanceReset;

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const studentSchema = new mongoose.Schema({
  uuid: { 
    type: String, 
    // required: true, 
    unique: true,
    default: () => uuidv4() // Auto-generate UUID
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    default: 'student' 
  },
  class: { 
    type: String, 
    required: true 
  },
  adminIds: [{ 
    type: String, // Changed to String to match Admin's id type
    ref: 'Admin' 
  }],
  attendanceStatus: { 
    type: String, 
    default: 'absent' // Default value is 'absent'
  }
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;

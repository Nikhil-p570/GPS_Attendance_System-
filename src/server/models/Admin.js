const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const geofenceSchema = new mongoose.Schema({
  center: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  radius: { type: Number, required: true },
  name: { type: String, required: true }
});

const adminSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => uuidv4() // Auto-generate UUID
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  institution: { type: String, },
  geofence: geofenceSchema,
  studentIds: [{ 
    type: String, // Changed to String to match Student's id type
    ref: 'Student' 
  }]
}, {
  timestamps: true
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
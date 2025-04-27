
const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema({
  adminId: { type: String, required: true, ref: 'Admin' },
  name: { type: String, required: true },
  center: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  radius: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Geofence = mongoose.model('Geofence', geofenceSchema);

module.exports = Geofence;

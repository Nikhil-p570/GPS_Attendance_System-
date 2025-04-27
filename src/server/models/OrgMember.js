
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const orgMemberSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'orgMember' },
  organization: { type: String, required: true },
  adminIds: [{ type: String, ref: 'Admin' }] // Changed from adminId to adminIds for multiple admin support
}, {
  timestamps: true
});

// Add a pre-save hook to hash password and validate uniqueness
orgMemberSchema.pre('save', async function(next) {
  try {
    // Check if this is a new document or if email has changed
    if (this.isNew || this.isModified('email')) {
      const existingMember = await this.constructor.findOne({ email: this.email });
      if (existingMember) {
        const error = new Error('Email address is already in use');
        error.name = 'ValidationError';
        return next(error);
      }
    }

    // Hash password if it's new or modified
    // if (this.isNew || this.isModified('password')) {
    //   const salt = await bcrypt.genSalt(10);
    //   this.password = await bcrypt.hash(this.password, salt);
    // }
    
    next();
  } catch (error) {
    next(error);
  }
});

const OrgMember = mongoose.model('OrgMember', orgMemberSchema);

module.exports = OrgMember;

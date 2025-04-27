
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { format } = require('date-fns');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
// Import models
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const OrgMember = require('./models/OrgMember');
const Attendance = require('./models/Attendance');
const Geofence = require('./models/Geofence');
const authenticateJWT = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = 'mongodb://localhost:27017/gps_attendance';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const scheduleAttendanceReset = require('./models/resetAttendance');
scheduleAttendanceReset();


app.post('/api/register', async (req, res) => {
  try {
    const userData = req.body;
    console.log('Registration attempt:', userData);
    
    // Check if email already exists
    const emailExists = await Promise.all([ 
      Admin.findOne({ email: userData.email }),
      Student.findOne({ email: userData.email }),
      OrgMember.findOne({ email: userData.email })
    ]);
    
    if (emailExists.some(user => user !== null)) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Ensure the user has an ID, or generate one if not provided
    if (!userData.id) {
      userData.id = uuidv4();
    }
    
    let newUser;
    
    if (userData.role === 'admin') {
      newUser = new Admin(userData);
    } else if (userData.role === 'student') {
      newUser = new Student(userData);
    } else if (userData.role === 'orgMember') {
      newUser = new OrgMember(userData);
    }
    
    // Store password directly without hashing
    newUser.password = userData.password;

    await newUser.save();
    console.log('User registered successfully:', newUser.id, newUser.role);
    res.status(201).json({ message: 'Registration successful', user: { id: newUser.id, role: newUser.role } });
  } catch (error) {
    console.error('Registration error:', error);
    
    res.status(500).json({ 
      message: 'Server error', 
      details: error.message 
    });
  }
});


app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for Admin
    let user = await Admin.findOne({ email });
    if (user) {
      if (user.password === password) { // In production, use bcrypt.compare()
        const token = jwt.sign(
          { id: user.id, role: 'admin' },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        return res.json({ 
          token,
          user: { ...user.toObject(), role: 'admin' }
        });
      }
    }

    // Check for Student
    user = await Student.findOne({ email });
    if (user) {
      if (user.password === password) {
        const token = jwt.sign(
          { id: user.id, role: 'student' },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        return res.json({ 
          token,
          user: { ...user.toObject(), role: 'student' }
        });
      }
    }

    // Check for OrgMember
    user = await OrgMember.findOne({ email });
    if (user) {
      if (user.password === password) {
        const token = jwt.sign(
          { id: user.id, role: 'orgMember' },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        return res.json({ 
          token,
          user: { ...user.toObject(), role: 'orgMember' }
        });
      }
    }

    return res.status(401).json({ message: 'Invalid email or password' });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



// Admin Routes
// Admin Routes
// Get all students with their details
// Get today's attendance status for all students
app.get('/api/today-attendance', authenticateJWT, async (req, res) => {
  try {
    // console.log('[DEBUG] Starting today-attendance endpoint');

    if (!req.user) {
      // console.error('[ERROR] req.user is undefined');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const adminId = req.user.id;
    // console.log('[DEBUG] Admin ID:', adminId);

    // Find admin by `id` field (UUID)
    const admin = await Admin.findOne({ id: adminId });
    if (!admin) {
      // console.error('[ERROR] Admin not found');
      return res.status(404).json({ error: 'Admin not found' });
    }

    console.log('[DEBUG] Found Admin:', admin);

    const studentIds = admin.studentIds; // Array of student IDs
    console.log('[DEBUG] Student IDs:', studentIds);

    // Fetch all students whose _id matches any in studentIds array
    const students = await Student.find({ _id: { $in: studentIds } });

    // console.log('[DEBUG] Students fetched:', students);

    const today = new Date().toISOString().split('T')[0];

    const attendanceList = students.map(student => ({
      name: student.name || 'Unknown',
      date: today,
      status: student.attendanceStatus || 'absent'
    }));

    console.log('[DEBUG] Attendance List:', attendanceList);

    res.json({
      success: true,
      data: attendanceList
    });

  } catch (error) {
    // console.error('[ERROR] in today-attendance endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/student/markAttendance', async (req, res) => {
  const { studentId, status } = req.body;

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { attendanceStatus: status || 'present' },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    console.log(`Student ${updatedStudent.name} (${updatedStudent._id}) marked as ${updatedStudent.attendanceStatus}`);

    res.status(200).json({
      success: true,
      message: `Attendance marked as ${updatedStudent.attendanceStatus}`,
      student: updatedStudent
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


app.post('/api/registerStudent', async (req, res) => {
  const { name, email, password, adminIds, class: studentClass } = req.body;
  
  try {
    // Step 1: Check if email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({ 
        success: false,
        error: 'EMAIL_EXISTS',
        message: 'Email already registered. Please use a different email.' 
      });
    }

    // Step 2: Create new student
    const newStudent = new Student({
      name,
      email,
      password,
      role: 'student',
      class: studentClass,
      adminIds: adminIds || [], // Ensure adminIds exists
    });

    await newStudent.save();

    // Step 3: Update admins with the new student ID
    if (adminIds && adminIds.length > 0) {
      await Promise.all(adminIds.map(async (adminId) => {
        await Admin.findOneAndUpdate(
          { id: adminId }, // Changed to find by UUID string
          { $addToSet: { studentIds: newStudent.id } }, // Using newStudent.id (UUID)
          { new: true }
        );
      }));
    }

    return res.status(201).json({ 
      success: true,
      message: 'Student registered successfully!',
      student: {
        id: newStudent.id,
        name: newStudent.name,
        email: newStudent.email,
        class: newStudent.class,
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'SERVER_ERROR',
      message: error.message || 'Registration failed. Please try again.' 
    });
  }
});
    


app.post('/api/geofence', async (req, res) => {
  try {
    const { adminId, name, center, radius, isActive } = req.body;
    
    // Check if the admin already has a geofence
    const existingGeofence = await Geofence.findOne({ adminId });
    
    if (existingGeofence) {
      // Update existing geofence
      existingGeofence.name = name;
      existingGeofence.center = center;
      existingGeofence.radius = radius;
      existingGeofence.isActive = isActive;
      await existingGeofence.save();
      
      // Update the admin document as well
      await Admin.findOneAndUpdate(
        { id: adminId },
        { geofence: { name, center, radius } }
      );
      
      return res.json(existingGeofence);
    }
    
    // Create new geofence for the admin
    const newGeofence = new Geofence({
      adminId,
      name,
      center,
      radius,
      isActive
    });
    
    await newGeofence.save();
    
    // Update the admin document with geofence data
    await Admin.findOneAndUpdate(
      { id: adminId },
      { geofence: { name, center, radius } }
    );
    
    res.status(201).json(newGeofence);
  } catch (error) {
    console.error('Geofence error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch members under an admin (students & org members)
app.get('/api/admin/:adminId/members', async (req, res) => {
  try {
    const { adminId } = req.params;
    
    const students = await Student.find({ adminId });
    const orgMembers = await OrgMember.find({ adminId });
    
    res.json([...students, ...orgMembers]);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get geofence details for admin
app.get('/api/geofence/:adminId', async (req, res) => {
  try {
    const { adminId } = req.params;
    
    // Fetch only the geofence details from the admin document
    const admin = await Admin.findOne({ id: adminId }, { geofence: 1 });
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Check if the admin has geofence details
    if (!admin.geofence) {
      return res.status(404).json({ message: 'Geofence not set for this admin' });
    }
    
    // Return only the geofence details
    res.json(admin.geofence);
  } catch (error) {
    console.error('Get geofence error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/api/admins', async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Server error while fetching admins' });
  }
});
app.get('/api/admins/:id', async (req, res) => {
  try {
    const admin = await Admin.findOne({ id: req.params.id });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



app.get('admin/:adminId/geofence', async (req, res) => {
  const { adminId } = req.params;

  try {
    const admin = await Admin.findOne({ id: adminId });

    if (!admin || !admin.geofence) {
      return res.status(404).json({ message: 'Geofence not found for this admin' });
    }

    res.json(admin.geofence);
    console.log(admin.geofence)
  } catch (error) { 
    console.error('Error fetching geofence:', error);
    res.status(500).json({ message: 'Server error' });
  }
}); 

// Attendance Routes
app.post('/api/attendance/checkin', async (req, res) => {
  try {
    const { userId, userRole, adminId } = req.body;
    const today = format(new Date(), 'yyyy-MM-dd');
    const checkInTime = format(new Date(), 'HH:mm:ss');
    
    // Find or create attendance record for today
    let attendanceRecord = await Attendance.findOne({ userId, date: today });
    
    if (attendanceRecord) {
      // Update existing record
      attendanceRecord.status = 'present';
      attendanceRecord.checkInTime = checkInTime;
      await attendanceRecord.save();
    } else {
      // Create new attendance record
      attendanceRecord = new Attendance({
        userId,
        date: today,
        status: 'present',
        checkInTime,
        checkOutTime: null,
        userRole,
        adminId
      });
      await attendanceRecord.save();
    }
    
    res.json(attendanceRecord);
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check-out Route
app.post('/api/attendance/checkout', async (req, res) => {
  try {
    const { userId } = req.body;
    const today = format(new Date(), 'yyyy-MM-dd');
    const checkOutTime = format(new Date(), 'HH:mm:ss');
    
    // Find attendance record for today
    const attendanceRecord = await Attendance.findOne({ userId, date: today });
    
    if (attendanceRecord) {
      attendanceRecord.checkOutTime = checkOutTime;
      await attendanceRecord.save();
      res.json(attendanceRecord);
    } else {
      res.status(404).json({ message: 'No check-in record found for today' });
    }
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance records for admin
app.get('/api/attendance/:adminId', async (req, res) => {
  try {
    const { adminId } = req.params;
    const { date, role, status } = req.query;
    
    const query = { adminId };
    
    if (date) query.date = date;
    if (role) query.userRole = role;
    if (status) query.status = status;
    
    const attendanceRecords = await Attendance.find(query);
    
    // Populate attendance records with user details
    const populatedRecords = await Promise.all(
      attendanceRecords.map(async (record) => {
        let user;
        if (record.userRole === 'student') {
          user = await Student.findOne({ id: record.userId });
        } else {
          user = await OrgMember.findOne({ id: record.userId });
        }
        
        return {
          ...record.toObject(),
          name: user?.name || 'Unknown',
          email: user?.email || 'Unknown',
          class: user?.class || undefined,
          organization: user?.organization || undefined,
        };
      })
    );
    
    res.json(populatedRecords);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


import axios from 'axios';
import { format } from 'date-fns';

// API base URL - would be configured based on environment in a real app
const API_URL = 'http://localhost:5000/api';

export interface AttendanceRecord {
  userId: string;
  date: string;
  status: 'present' | 'absent';
  checkInTime: string | null;
  checkOutTime: string | null;
  userRole?: string;
  adminId?: string;
  name?: string;
  email?: string;
  class?: string;
  organization?: string;
}

export const getUserAttendanceRecords = async (userId: string): Promise<AttendanceRecord[]> => {
  try {
    const response = await axios.get(`${API_URL}/attendance`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    throw error;
  }
};

export const checkInUser = async (userId: string, userRole: string, adminId: string): Promise<AttendanceRecord> => {
  try {
    const response = await axios.post(`${API_URL}/attendance/checkin`, {
      userId,
      userRole,
      adminId
    });
    return response.data;
  } catch (error) {
    console.error('Error checking in:', error);
    throw error;
  }
};

export const checkOutUser = async (userId: string): Promise<AttendanceRecord> => {
  try {
    const response = await axios.post(`${API_URL}/attendance/checkout`, {
      userId
    });
    return response.data;
  } catch (error) {
    console.error('Error checking out:', error);
    throw error;
  }
};

export const getAllAttendanceRecords = async (adminId: string, filters?: {
  date?: string;
  role?: string;
  status?: string;
}): Promise<AttendanceRecord[]> => {
  try {
    const response = await axios.get(`${API_URL}/attendance/${adminId}`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all attendance records:', error);
    throw error;
  }
};

export const getAttendanceStats = async (adminId: string, period: 'week' | 'month' = 'month') => {
  try {
    const response = await axios.get(`${API_URL}/attendance/stats/${adminId}`, {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    throw error;
  }
};

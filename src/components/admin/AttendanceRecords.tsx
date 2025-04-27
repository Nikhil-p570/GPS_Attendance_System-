import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext'; // Assuming you have auth context

const TodayAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Get logged-in user
  const today = new Date().toLocaleDateString();

  useEffect(() => {
    const fetchAttendance = async () => {
      console.log('Current user object:', user);
      const token = localStorage.getItem('token');
      console.log('Token being sent:', localStorage.token);

      console.log('Token exists?:', !!token);
  
      if (!token) {
        console.warn('No auth token found in localStorage.');
        return;
      }
  
      try {
        const response = await axios.get('http://localhost:5000/api/today-attendance', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAttendance(response.data);
        // console.log("renderes attendance"+attendance+"hi")
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load attendance');
      } finally {
        setLoading(false);
      }
    };
  
    if (user?.id) {
      fetchAttendance();
    }
  }, [user]);
  useEffect(() => {
    console.log("Updated attendance: ", attendance);  // This will log the state after it is updated
  }, [attendance]);
  

  if (loading) return <div>Loading attendance data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Today's Attendance ({today})</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
  {attendance?.data?.map((student, index) => (
    <TableRow key={index}>
          <TableCell className="font-medium">{student.name}</TableCell>
          <TableCell>{student.date}</TableCell>
          <TableCell>
            <span
              className={`
                font-bold 
                ${student.status === 'present' 
                  ? 'text-green-500 bg-green-100' // Light green background for present
                  : 'text-red-500 bg-red-100' // Light red background for absent
                } 
                p-2 rounded-lg`}
            >
              {student.status.toUpperCase()}
            </span>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
      </Table>
    </div>
  );
};

export default TodayAttendance;
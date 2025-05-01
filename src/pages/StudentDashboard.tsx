import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Map from './UserAdminMap';
import StudentAttendanceTable from './StudentAttendanceTable';
import { useQuery } from '@tanstack/react-query';
import { getUserAttendanceRecords } from '@/services/attendanceService';
import { calculateDistance } from '../utils/Locationutils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { LogOut } from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout, admins } = useAuth();
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isWithinGeofence, setIsWithinGeofence] = useState<boolean>(false);
  const [distanceFromCenter, setDistanceFromCenter] = useState<number>(0);
  const [attendanceStatus, setAttendanceStatus] = useState<string>(''); // Add state for attendance status
  
  // Get admin's details
  const admin = user?.adminIds?.length ? admins.find(admin => admin.id === user.adminIds[0]) : null;
  const adminGeofence = admin?.geofence;

  // Default to New York if no geofence is set
  const geofenceCenter = adminGeofence?.center || { latitude: 40.7128, longitude: -74.0060 };
  const geofenceRadius = adminGeofence?.radius || 200;

  // Fetch attendance records
  const { data: attendanceRecords, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['attendance', user?.id],
    queryFn: () => getUserAttendanceRecords(user?.id || ''),
    enabled: !!user?.id
  });
  
  useEffect(() => {
    if (user && adminGeofence) {
      // 🔁 TOGGLE: Use mock location by commenting out this block
      //comment from here to 
      
     // const mockLatitude = 17.520124;        //inside mock data
     // const mockLongitude = 78.366163;  

       const mockLatitude=17.517945;            //outside mock data
       const mockLongitude = 78.372;
      setCurrentLocation({ latitude: mockLatitude, longitude: mockLongitude });
      const distance = calculateDistance(
        mockLatitude,
        mockLongitude,
        adminGeofence.center.latitude,
        adminGeofence.center.longitude
      );
      setDistanceFromCenter(distance);
      setIsWithinGeofence(distance <= adminGeofence.radius);
      
      // Mark attendance as present if within geofence
      if (distance <= adminGeofence.radius) {
        setAttendanceStatus("In database, you're marked as present");
      
        // API call to mark attendance as 'present'
        fetch('http://localhost:5000/api/student/markAttendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: user._id, status: 'present' })
        })
        .then(response => response.json())
        .then(data => {
          console.log('Attendance marked as present:', data);
        })
        .catch(error => {
          console.error('Error marking attendance:', error);
        });
      
      } else {
        setAttendanceStatus("You're outside the geofenced area, attendance marked as absent");
      
        // API call to mark attendance as 'absent'
        fetch('http://localhost:5000/api/student/markAttendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: user._id, status: 'absent' })
        })
        .then(response => response.json())
        .then(data => {
          console.log('Attendance marked as absent:', data);
        })
        .catch(error => {
          console.error('Error marking attendance as absent:', error);
        });
      }
      
      //here 
  
      // ✅ TO USE REAL DEVICE LOCATION, uncomment this block
      
      // navigator.geolocation.getCurrentPosition(
      //   (position) => {
      //     const latitude = position.coords.latitude;
      //     const longitude = position.coords.longitude;
  
      //     console.log("📍 Real User Location:", latitude, longitude);
      //     setCurrentLocation({ latitude, longitude });
  
      //     const distance = calculateDistance(
      //       latitude,
      //       longitude,
      //       adminGeofence.center.latitude,
      //       adminGeofence.center.longitude
      //     );
      //     setDistanceFromCenter(distance);
      //     setIsWithinGeofence(distance <= adminGeofence.radius);
  
      //     // Mark attendance as present if within geofence
      //     if (distance <= adminGeofence.radius) {
      //       setAttendanceStatus("In database, you're marked as present");
      //       fetch('/api/student/markAttendance', {
      //         method: 'POST',
      //         headers: { 'Content-Type': 'application/json' },
      //         body: JSON.stringify({ studentId: user.id })
      //       })
      //       .then(response => response.json())
      //       .then(data => {
      //         console.log('Attendance marked:', data);
      //       })
      //       .catch(error => {
      //         console.error('Error marking attendance:', error);
      //       });
      //     } else {
      //       setAttendanceStatus("You're outside the geofenced area, attendance not marked");
      //     }
      //   },
      //   (error) => {
      //     console.error("❌ Geolocation error:", error.message);
      //     setLocationError(error.message);
      //   }
      // );
    }
  }, [user, adminGeofence]);
  

  const isMapReady = currentLocation && adminGeofence;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p className="text-xl font-bold text-green-600">
            Welcome, {user.name}
          </p>
        <Button variant="outline" onClick={() => navigate('/attendance-history')}>
          <Calendar className="h-4 w-4 mr-2" />
          View Full History
        </Button>

        <Button 
      variant="outline" 
      className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white" 
      onClick={logout} // Add the logout function here
       >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
      </Button> 
      </div>
      
 
      {/* Geofence Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Location Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isMapReady && (
            <div className={`p-3 rounded-md ${
              isWithinGeofence ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isWithinGeofence ? (
                <p>✅ You're within the authorized area ({distanceFromCenter.toFixed(0)}m from center)</p>
              ) : (
                <p>⚠️ You're outside the authorized area ({distanceFromCenter.toFixed(0)}m from center)</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-white rounded shadow">
              <h3 className="font-medium text-blue-600">Your Location</h3>
              {currentLocation ? (
                <>
                  <p>Latitude: {currentLocation.latitude.toFixed(6)}</p>
                  <p>Longitude: {currentLocation.longitude.toFixed(6)}</p>
                  {locationError && <p className="text-yellow-600">{locationError}</p>}
                </>
              ) : (
                <p>Loading your location...</p>
              )}
            </div>

            <div className="p-3 bg-white rounded shadow">
              <h3 className="font-medium text-green-600">Admin's Geofence</h3>
              {admin ? (
                <>
                  <p>Center Latitude: {geofenceCenter.latitude.toFixed(6)}</p>
                  <p>Center Longitude: {geofenceCenter.longitude.toFixed(6)}</p>
                  <p>Radius: {geofenceRadius} meters</p>
                </>
              ) : (
                <p>No associated admin found</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Status Message */}
      {attendanceStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{attendanceStatus}</p>
          </CardContent>
        </Card>
      )}

      {/* Map Section */}
      {isMapReady && (
        <Card>
          <CardHeader>
            <CardTitle>Location Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Map 
                userLocation={currentLocation} 
                geofenceCenter={geofenceCenter}
                geofenceRadius={geofenceRadius}
                isWithinGeofence={isWithinGeofence}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentAttendanceTable 
            attendanceRecords={attendanceRecords || []}
            isLoading={isLoadingAttendance}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;

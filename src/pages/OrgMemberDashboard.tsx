
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { MapPin, Clock, CheckCircle, XCircle, BellRing, LogOut, Clipboard, Calendar } from 'lucide-react';
import Map from '@/components/Map';

// Mock data for org member attendance
const mockAttendanceRecords = [
  { date: '2025-04-01', status: 'present', checkInTime: '08:45:23', checkOutTime: '17:25:45' },
  { date: '2025-04-02', status: 'present', checkInTime: '08:30:11', checkOutTime: '17:45:30' },
  { date: '2025-04-03', status: 'present', checkInTime: '08:42:56', checkOutTime: '17:15:22' },
];

// Mock notifications
const mockNotifications = [
  { id: 1, message: 'You have successfully checked in for today', timestamp: '2025-04-01T08:45:23' },
  { id: 2, message: 'Meeting scheduled with department heads at 2 PM', timestamp: '2025-04-02T10:15:30' },
  { id: 3, message: 'New event added to calendar: Staff Training', timestamp: '2025-04-03T09:30:00' },
];

const OrgMemberDashboard = () => {
  const { user, logout, admins } = useAuth();
  const navigate = useNavigate();
  const [isWithinGeofence, setIsWithinGeofence] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | 'pending'>('pending');
  const [attendanceRecords, setAttendanceRecords] = useState(mockAttendanceRecords);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [userLocations, setUserLocations] = useState<Array<{id: string, name: string, role: string, location: {latitude: number, longitude: number}}>>([]);
  
  // Get admin's geofence if the org member is associated with an admin
  const adminGeofence = user?.adminId 
    ? admins.find(admin => admin.id === user.adminId)?.geofence 
    : null;
  
  const geofenceCenter = adminGeofence?.center || { latitude: 40.7128, longitude: -74.0060 };
  const geofenceRadius = adminGeofence?.radius || 200; // in meters

  // Check if user is within geofence on component mount and continuously update location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { latitude, longitude };
          setCurrentLocation(newLocation);
          
          // Update user location in the userLocations array
          if (user) {
            const updatedUserLocations = userLocations.filter(u => u.id !== user.id);
            updatedUserLocations.push({
              id: user.id,
              name: user.name,
              role: 'orgMember',
              location: newLocation
            });
            setUserLocations(updatedUserLocations);
          }
          
          // Calculate distance to geofence center
          const distance = calculateDistance(
            latitude, 
            longitude, 
            geofenceCenter.latitude, 
            geofenceCenter.longitude
          );
          
          const within = distance <= geofenceRadius / 1000; // Convert meters to km
          setIsWithinGeofence(within);
          
          // Set attendance status based on geofence
          if (within) {
            if (attendanceStatus === 'pending' || attendanceStatus === 'absent') {
              setAttendanceStatus('present');
              // Mock automatic check-in
              const today = format(new Date(), 'yyyy-MM-dd');
              const checkInTime = format(new Date(), 'HH:mm:ss');
              
              // Update attendance record
              const existingRecordIndex = attendanceRecords.findIndex(record => record.date === today);
              if (existingRecordIndex >= 0) {
                const updatedRecords = [...attendanceRecords];
                updatedRecords[existingRecordIndex] = {
                  ...updatedRecords[existingRecordIndex],
                  status: 'present',
                  checkInTime,
                };
                setAttendanceRecords(updatedRecords);
              } else {
                setAttendanceRecords([
                  ...attendanceRecords,
                  { date: today, status: 'present', checkInTime, checkOutTime: null },
                ]);
              }
              
              // Add notification
              const newNotification = {
                id: notifications.length + 1,
                message: 'You have been automatically checked in',
                timestamp: new Date().toISOString(),
              };
              setNotifications([newNotification, ...notifications]);
              
              toast({
                title: 'Attendance Recorded',
                description: 'You have been automatically checked in.',
              });
            }
          } else if (attendanceStatus === 'present') {
            setAttendanceStatus('absent');
            toast({
              variant: 'destructive',
              title: 'Outside Attendance Area',
              description: 'You have left the attendance area.',
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            variant: 'destructive',
            title: 'Location Error',
            description: 'Unable to track your location. Please check permissions.',
          });
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      toast({
        variant: 'destructive',
        title: 'Location Not Supported',
        description: 'Your browser does not support geolocation tracking.',
      });
    }
  }, [user, attendanceStatus, geofenceCenter, geofenceRadius]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getAdminInfo = () => {
    if (!user?.adminId) return 'Not assigned to any institution';
    const admin = admins.find(a => a.id === user.adminId);
    return admin ? `${admin.institution} (Admin: ${admin.name})` : 'Unknown institution';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">AttendTrack</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <BellRing className="h-6 w-6 text-gray-500 cursor-pointer hover:text-primary transition-colors" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center transform -translate-y-1/2 translate-x-1/2">
                  {notifications.length}
                </span>
              )}
            </div>
            <Button variant="ghost" onClick={handleLogout} className="flex items-center">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3">
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Welcome, {user?.name}</CardTitle>
                  <CardDescription>
                    Organization Member • {user?.organization}
                  </CardDescription>
                  <CardDescription>
                    Institution: {getAdminInfo()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Today's Date</p>
                      <p className="font-medium">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
                    </div>
                    <div>
                      <Badge className={
                        attendanceStatus === 'present' ? 'bg-green-500' : 
                        attendanceStatus === 'absent' ? 'bg-red-500' : 'bg-yellow-500'
                      }>
                        {attendanceStatus === 'present' ? 'Present' : 
                         attendanceStatus === 'absent' ? 'Absent' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-gray-500 mr-2" />
                      <h3 className="font-medium">Attendance Status</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Location Status</p>
                        <div className="flex items-center">
                          {isWithinGeofence ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-green-600">Within attendance area</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500 mr-1" />
                              <span className="text-red-600">Outside attendance area</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Today's Check-in</p>
                        <p className="font-medium">
                          {attendanceStatus === 'present' 
                            ? format(new Date(), 'hh:mm a')
                            : 'Not checked in yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Campus Map & Geofence Area</CardTitle>
                  <CardDescription>
                    You must be within the highlighted area for attendance to be recorded
                  </CardDescription>
                  {adminGeofence && (
                    <CardDescription>
                      Attendance Area: {adminGeofence.name}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="h-96">
                  <Map 
                    showGeofence={true}
                    geofenceRadius={geofenceRadius}
                    centerLocation={currentLocation || geofenceCenter}
                    userLocations={userLocations}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="md:w-1/3">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Recent Attendance</CardTitle>
                  <CardDescription>
                    Your attendance history for the past days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attendanceRecords.map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium">{format(new Date(record.date), 'MMM d, yyyy')}</p>
                          <p className="text-sm text-gray-500">
                            {record.checkInTime ? `Check in: ${record.checkInTime}` : 'Not checked in'}
                          </p>
                        </div>
                        <Badge className={
                          record.status === 'present' ? 'bg-green-500' : 'bg-red-500'
                        }>
                          {record.status === 'present' ? 'Present' : 'Absent'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-3 bg-gray-50 rounded-md">
                        <p className="font-medium">{notification.message}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(notification.timestamp), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clipboard className="h-5 w-5 mr-2" />
                    Quick Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Schedule
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Clock className="h-4 w-4 mr-2" />
                      Request Time Off
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MapPin className="h-4 w-4 mr-2" />
                      Update Location
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrgMemberDashboard;

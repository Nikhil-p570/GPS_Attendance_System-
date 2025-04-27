
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface Location {
  latitude: number;
  longitude: number;
}

interface UseLocationTrackingProps {
  userId: string;
  userName: string;
  userRole: string;
  geofenceCenter: Location;
  geofenceRadius: number;
  onAttendanceStatusChange?: (status: 'present' | 'absent' | 'pending') => void;
}

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent';
  checkInTime: string | null;
  checkOutTime: string | null;
}

const useLocationTracking = ({
  userId,
  userName,
  userRole,
  geofenceCenter,
  geofenceRadius,
  onAttendanceStatusChange,
}: UseLocationTrackingProps) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isWithinGeofence, setIsWithinGeofence] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | 'pending'>('pending');
  const [userLocations, setUserLocations] = useState<Array<{id: string, name: string, role: string, location: Location}>>([]);
  
  // Track user location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { latitude, longitude };
          setCurrentLocation(newLocation);
          
          // Update user location in the userLocations array
          setUserLocations(prevLocations => {
            const updatedUserLocations = prevLocations.filter(u => u.id !== userId);
            updatedUserLocations.push({
              id: userId,
              name: userName,
              role: userRole,
              location: newLocation
            });
            return updatedUserLocations;
          });
          
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
          if (within && (attendanceStatus === 'pending' || attendanceStatus === 'absent')) {
            setAttendanceStatus('present');
            if (onAttendanceStatusChange) {
              onAttendanceStatusChange('present');
            }
            toast({
              title: 'Attendance Recorded',
              description: 'You have been automatically checked in.',
            });
          } else if (!within && attendanceStatus === 'present') {
            setAttendanceStatus('absent');
            if (onAttendanceStatusChange) {
              onAttendanceStatusChange('absent');
            }
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
  }, [userId, userName, userRole, geofenceCenter, geofenceRadius, attendanceStatus, onAttendanceStatusChange]);

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

  // Record attendance when status changes to present
  const recordAttendance = (status: 'present' | 'absent'): AttendanceRecord => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentTime = format(new Date(), 'HH:mm:ss');
    
    return {
      date: today,
      status,
      checkInTime: status === 'present' ? currentTime : null,
      checkOutTime: null
    };
  };

  return {
    currentLocation,
    isWithinGeofence,
    attendanceStatus,
    userLocations,
    recordAttendance
  };
};

export default useLocationTracking;

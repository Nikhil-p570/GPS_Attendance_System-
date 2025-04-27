import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { MapPin, Save, Users } from 'lucide-react';
import Map from '@/components/Map';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const sampleUserLocations = [
  { id: '1', name: 'Alice Johnson', role: 'student', location: { latitude: 40.7138, longitude: -74.0070 } },
  { id: '2', name: 'Bob Smith', role: 'student', location: { latitude: 40.7148, longitude: -74.0080 } },
  { id: '3', name: 'Charlie Brown', role: 'student', location: { latitude: 40.7118, longitude: -74.0050 } },
  { id: '4', name: 'Diana Prince', role: 'orgMember', location: { latitude: 40.7128, longitude: -74.0040 } },
];

const GpsTracking = () => {
  const { user } = useAuth();
  const [geofenceCenter, setGeofenceCenter] = useState({ latitude: 40.7128, longitude: -74.0060 });
  const [geofenceRadius, setGeofenceRadius] = useState(200); // in meters
  const [locationName, setLocationName] = useState('Main Campus');
  const [activeLocations, setActiveLocations] = useState([
    { id: '1', name: 'Main Campus', isActive: true },
    { id: '2', name: 'Library', isActive: false },
    { id: '3', name: 'Sports Complex', isActive: false },
  ]);

  useEffect(() => {
    if (user && user.id) {
      fetchGeofence(user.id);
    }
  }, [user]);

  const fetchGeofence = async (adminId: string) => {
    try {
      const response = await axios.get(`${API_URL}/geofence/${adminId}`);
      const geofence = response.data;
      
      if (geofence) {
        setGeofenceCenter(geofence.center);
        setGeofenceRadius(geofence.radius);
        setLocationName(geofence.name);
      }
    } catch (error) {
      console.error('Error fetching geofence:', error);
    }
  };

  const handleGeofenceChange = (center: { latitude: number, longitude: number }, radius: number) => {
    setGeofenceCenter(center);
    // Radius is handled separately through the slider
  };

  const handleRadiusChange = (value: number[]) => {
    setGeofenceRadius(value[0]);
  };

  const handleSaveGeofence = async () => {
    if (user) {
      try {
        await axios.post(`${API_URL}/geofence`, {
          adminId: user.id,
          name: locationName,
          center: geofenceCenter,
          radius: geofenceRadius,
          isActive: true
        });
        
        toast({
          title: 'Geofence Saved',
          description: `Location: ${locationName}, Radius: ${geofenceRadius}m`,
        });
      } catch (error) {
        console.error('Error saving geofence:', error);
        toast({
          variant: 'destructive',
          title: 'Error Saving Geofence',
          description: 'There was a problem saving your geofence settings.',
        });
      }
    }
  };

  const toggleLocationActive = async (id: string) => {
    setActiveLocations(locations => 
      locations.map(location => 
        location.id === id ? { ...location, isActive: !location.isActive } : location
      )
    );
    
    // In a real implementation, this would update the active status in the database
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>GPS Tracking & Geofencing</CardTitle>
              <CardDescription>
                Set up geofence areas for automatic attendance tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <Map 
                isAdmin={true}
                showGeofence={true}
                geofenceRadius={geofenceRadius}
                centerLocation={geofenceCenter}
                onGeofenceChange={handleGeofenceChange}
                userLocations={sampleUserLocations}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Geofence Settings</CardTitle>
              <CardDescription>
                Configure your geofence parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="location-name">Location Name</Label>
                  <Input 
                    id="location-name" 
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Main Campus" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="geofence-radius">Geofence Radius ({geofenceRadius} meters)</Label>
                  <Slider 
                    id="geofence-radius"
                    defaultValue={[geofenceRadius]} 
                    max={500}
                    min={50}
                    step={10}
                    onValueChange={handleRadiusChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Drag the slider to adjust the radius of the geofence area.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Geofence Center</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                      <Input 
                        id="latitude" 
                        value={geofenceCenter.latitude.toFixed(6)}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                      <Input 
                        id="longitude" 
                        value={geofenceCenter.longitude.toFixed(6)}
                        readOnly
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Drag the purple marker on the map to change the center.
                  </p>
                </div>
                
                <Button 
                  type="button" 
                  onClick={handleSaveGeofence}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Geofence Settings
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Active Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeLocations.map(location => (
                  <div 
                    key={location.id}
                    className={`flex items-center justify-between p-3 ${location.isActive ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'} rounded-md border`}
                  >
                    <div className="flex items-center">
                      <MapPin className={`h-4 w-4 ${location.isActive ? 'text-blue-600' : 'text-gray-600'} mr-2`} />
                      <span>{location.name}</span>
                    </div>
                    <Badge 
                      className={location.isActive ? 'bg-green-500 cursor-pointer' : 'bg-gray-500 cursor-pointer'}
                      onClick={() => toggleLocationActive(location.id)}
                    >
                      {location.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Users in Geofence Area
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sampleUserLocations.map(user => {
                  const distance = calculateDistance(
                    user.location.latitude,
                    user.location.longitude,
                    geofenceCenter.latitude,
                    geofenceCenter.longitude
                  );
                  const inGeofence = distance <= geofenceRadius / 1000; // Convert meters to km

                  return (
                    <div 
                      key={user.id}
                      className={`flex items-center justify-between p-3 ${inGeofence ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'} rounded-md border`}
                    >
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                      <Badge className={inGeofence ? 'bg-green-500' : 'bg-red-500'}>
                        {inGeofence ? 'Present' : 'Away'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

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

export default GpsTracking;

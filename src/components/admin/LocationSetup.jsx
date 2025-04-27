
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from '../ui/use-toast';
import { Save, MapPin, AlertTriangle } from 'lucide-react';
import Map from '../Map';

const LocationSetup = () => {
  const [geofenceName, setGeofenceName] = useState('');
  const [geofenceRadius, setGeofenceRadius] = useState(100);
  const [geofenceCenter, setGeofenceCenter] = useState({ latitude: 40.7128, longitude: -74.0060 });
  const [isLoading, setIsLoading] = useState(false);

  const handleGeofenceChange = useCallback((center, radius) => {
    setGeofenceCenter(center);
    setGeofenceRadius(radius);
  }, []);

  const handleSaveGeofence = async () => {
    if (!geofenceName) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please provide a name for this location"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Location Saved",
        description: `Location "${geofenceName}" has been saved successfully.`
      });
      
      // Reset form or redirect
      // setGeofenceName('');
    } catch (error) {
      console.error("Error saving geofence:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save the location. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Location Setup</CardTitle>
          <CardDescription>Define geofence areas for attendance tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="geofenceName">Location Name</Label>
                <Input 
                  id="geofenceName" 
                  value={geofenceName} 
                  onChange={e => setGeofenceName(e.target.value)} 
                  placeholder="e.g., Main Campus" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="geofenceRadius">Radius (meters)</Label>
                <Input 
                  id="geofenceRadius" 
                  type="number" 
                  value={geofenceRadius} 
                  onChange={e => setGeofenceRadius(Number(e.target.value))} 
                  min={10} 
                  max={1000} 
                />
                <p className="text-xs text-muted-foreground">Range: 10-1000 meters</p>
              </div>
              
              <div className="space-y-2">
                <Label>Location Coordinates</Label>
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
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Drag the marker on the map to set location
                </p>
              </div>
              
              <Button 
                onClick={handleSaveGeofence} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Saving..." : "Save Location"}
                <Save className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="md:col-span-2 h-[500px]">
              <Map 
                isAdmin={true}
                showGeofence={true}
                geofenceRadius={geofenceRadius}
                centerLocation={geofenceCenter}
                onGeofenceChange={handleGeofenceChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Active Locations</CardTitle>
          <CardDescription>Manage your saved locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="py-6 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No locations created</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first location using the form above
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationSetup;

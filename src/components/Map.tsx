import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle } from 'lucide-react';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Location {
  latitude: number;
  longitude: number;
}

interface MapProps {
  isAdmin?: boolean;
  showGeofence?: boolean;
  geofenceRadius?: number;
  onGeofenceChange?: (center: Location, radius: number) => void;
  centerLocation?: Location;
  userLocations?: Array<{id: string, name: string, role: string, location: Location}>;
}

const Map: React.FC<MapProps> = ({ 
  isAdmin = false, 
  showGeofence = false, 
  geofenceRadius = 100, 
  onGeofenceChange,
  centerLocation,
  userLocations = []
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const geofenceMarkerRef = useRef<L.Marker | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);
  const userMarkersRef = useRef<L.Marker[]>([]);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Haversine formula to calculate distance between two lat/lng points
  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance * 1000; // Return distance in meters
  };

  // Initialize map only once
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    
    const defaultCenter = centerLocation 
      ? [centerLocation.latitude, centerLocation.longitude] 
      : [51.505, -0.09]; // Default to London
    
    try {
      leafletMapRef.current = L.map(mapRef.current).setView(defaultCenter as [number, number], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(leafletMapRef.current);
      
      // Add location control
      leafletMapRef.current.locate({ setView: true, maxZoom: 16 });
      
      leafletMapRef.current.on('locationfound', (e: L.LocationEvent) => {
        const latlng = e.latlng;
        const location = { latitude: latlng.lat, longitude: latlng.lng };
        
        // Update user marker
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(latlng);
        } else {
          userMarkerRef.current = L.marker(latlng, { draggable: isAdmin })
            .addTo(leafletMapRef.current!)
            .bindPopup('You are here');
          
          if (isAdmin) {
            userMarkerRef.current.on('dragend', () => {
              const position = userMarkerRef.current?.getLatLng();
              if (position && onGeofenceChange) {
                onGeofenceChange(
                  { latitude: position.lat, longitude: position.lng },
                  geofenceRadius
                );
              }
            });
          }
        }
        // If admin mode, initialize geofence
        if (isAdmin && onGeofenceChange && !geofenceMarkerRef.current) {
          onGeofenceChange(location, geofenceRadius);
        }
      });
      
      leafletMapRef.current.on('locationerror', (e: L.ErrorEvent) => {
        toast({
          variant: "destructive",
          title: "Location error",
          description: e.message,
        });
      });
      
      setMapInitialized(true);
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        variant: "destructive",
        title: "Map error",
        description: "Failed to initialize map",
      });
    }
    
    // Cleanup function
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        userMarkerRef.current = null;
        geofenceMarkerRef.current = null;
        geofenceCircleRef.current = null;
        userMarkersRef.current = [];
      }
    };
  }, []); // Empty dependency array ensures this runs only once
  
  // Update center and geofence without reinitializing map
  useEffect(() => {
    if (!leafletMapRef.current || !centerLocation || !mapInitialized) return;
    
    const map = leafletMapRef.current;
    const center = [centerLocation.latitude, centerLocation.longitude] as [number, number];
    
    // Update map center
    map.setView(center, map.getZoom(), { animate: true });
    
    // Update geofence circle
    if (showGeofence) {
      // Changed geofence color to red for better visibility for students
      const geofenceColor = isAdmin ? '#0ea5e9' : '#ef4444';
      const geofenceFillOpacity = isAdmin ? 0.1 : 0.2;
      
      if (geofenceCircleRef.current) {
        geofenceCircleRef.current.setLatLng(center);
        geofenceCircleRef.current.setRadius(geofenceRadius);
        geofenceCircleRef.current.setStyle({
          color: geofenceColor,
          fillColor: geofenceColor,
          fillOpacity: geofenceFillOpacity
        });
      } else {
        geofenceCircleRef.current = L.circle(center, {
          radius: geofenceRadius,
          color: geofenceColor,
          fillColor: geofenceColor,
          fillOpacity: geofenceFillOpacity
        }).addTo(map);
      }
      
      // Update geofence center marker (admin only)
      if (isAdmin && onGeofenceChange) {
        if (geofenceMarkerRef.current) {
          geofenceMarkerRef.current.setLatLng(center);
        } else {
          const geofenceIcon = L.divIcon({
            html: `<div style="background-color: #8b5cf6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>`,
            className: 'custom-div-icon',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          
          geofenceMarkerRef.current = L.marker(center, {
            draggable: true,
            icon: geofenceIcon
          }).addTo(map);
          
          geofenceMarkerRef.current.on('dragend', () => {
            const position = geofenceMarkerRef.current?.getLatLng();
            if (position && onGeofenceChange) {
              onGeofenceChange(
                { latitude: position.lat, longitude: position.lng },
                geofenceRadius
              );
            }
          });
        }
      }
    } else {
      // Remove geofence elements if not showing
      if (geofenceCircleRef.current) {
        geofenceCircleRef.current.remove();
        geofenceCircleRef.current = null;
      }
      
      if (geofenceMarkerRef.current) {
        geofenceMarkerRef.current.remove();
        geofenceMarkerRef.current = null;
      }
    }
  }, [centerLocation, showGeofence, geofenceRadius, isAdmin, onGeofenceChange, mapInitialized]);
  
  // Update user markers without reinitializing map
  useEffect(() => {
    if (!leafletMapRef.current || !mapInitialized) return;
    
    const map = leafletMapRef.current;
    
    // Clear existing markers
    userMarkersRef.current.forEach(marker => marker.remove());
    userMarkersRef.current = [];
    
    // Add new markers
    userLocations.forEach(user => {
      if (!user.location) return;
      
      const { latitude, longitude } = user.location;
      
      const color = user.role === 'student' ? '#0ea5e9' : 
                   user.role === 'orgMember' ? '#10b981' : '#8b5cf6';
      
      const userIcon = L.divIcon({
        html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>`,
        className: 'custom-div-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      
      const marker = L.marker([latitude, longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<strong>${user.name}</strong><p>${user.role}</p>`);
      
      userMarkersRef.current.push(marker);
    });
  }, [userLocations, mapInitialized]);
  
  // Check if user is inside geofence radius
  useEffect(() => {
    if (!centerLocation || !geofenceCircleRef.current) return;
    
    const userLat = centerLocation.latitude;
    const userLon = centerLocation.longitude;
    
    const adminLat = geofenceCircleRef.current.getLatLng().lat;
    const adminLon = geofenceCircleRef.current.getLatLng().lng;
    const radius = geofenceRadius;
    
    const distance = haversine(userLat, userLon, adminLat, adminLon);
    
    const isInsideGeofence = distance <= radius;
    
    if (isInsideGeofence) {
      toast({
        variant: 'default',  // "default" for success or informational messages
        title: 'Inside Geofence',
        description: 'You are within the attendance area.',
      });
    } else {
      toast({
        variant: 'destructive',  // "destructive" for error or warning messages
        title: 'Outside Geofence',
        description: 'You are outside the attendance area.',
      });
    }
  }, [centerLocation, geofenceRadius]);
  
  return (
    <div ref={mapRef} style={{ height: '100vh', width: '100%' }} />
  );
};

export default Map;

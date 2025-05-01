import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle } from 'lucide-react';

import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';

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
  userLocations?: Array<{ id: string; name: string; role: string; location: Location }>;
}

const Map: React.FC<MapProps> = ({
  isAdmin = false,
  showGeofence = false,
  geofenceRadius = 100,
  onGeofenceChange,
  centerLocation,
  userLocations = [],
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const geofenceMarkerRef = useRef<L.Marker | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);
  const userMarkersRef = useRef<L.Marker[]>([]);
  const [mapInitialized, setMapInitialized] = useState(false);

  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
  };

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const defaultCenter = centerLocation
      ? [centerLocation.latitude, centerLocation.longitude]
      : [17.520257, 78.365564]; // default: Hyderabad

    try {
      leafletMapRef.current = L.map(mapRef.current).setView(defaultCenter as [number, number], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(leafletMapRef.current);

      // ✅ Add working search bar using Leaflet-Control-Geocoder
      if (L.Control.geocoder) {
        const geocoderControl = L.Control.geocoder({
          defaultMarkGeocode: true,
          placeholder: 'Search location...',
        })
          .on('markgeocode', function (e: any) {
            const center = e.geocode.center;
            leafletMapRef.current?.setView(center, 16);
          })
          .addTo(leafletMapRef.current);
      }

      leafletMapRef.current.locate({ setView: true, maxZoom: 16 });

      leafletMapRef.current.on('locationfound', (e: L.LocationEvent) => {
        const latlng = e.latlng;
        const location = { latitude: latlng.lat, longitude: latlng.lng };

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

        if (isAdmin && onGeofenceChange && !geofenceMarkerRef.current) {
          onGeofenceChange(location, geofenceRadius);
        }
      });

      leafletMapRef.current.on('locationerror', (e: L.ErrorEvent) => {
        toast({
          variant: 'destructive',
          title: 'Location error',
          description: e.message,
        });
      });

      setMapInitialized(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        variant: 'destructive',
        title: 'Map error',
        description: 'Failed to initialize map',
      });
    }

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
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current || !centerLocation || !mapInitialized) return;

    const map = leafletMapRef.current;
    const center = [centerLocation.latitude, centerLocation.longitude] as [number, number];

    map.setView(center, map.getZoom(), { animate: true });

    if (showGeofence) {
      const geofenceColor = isAdmin ? '#0ea5e9' : '#ef4444';
      const geofenceFillOpacity = isAdmin ? 0.1 : 0.2;

      if (geofenceCircleRef.current) {
        geofenceCircleRef.current.setLatLng(center);
        geofenceCircleRef.current.setRadius(geofenceRadius);
        geofenceCircleRef.current.setStyle({
          color: geofenceColor,
          fillColor: geofenceColor,
          fillOpacity: geofenceFillOpacity,
        });
      } else {
        geofenceCircleRef.current = L.circle(center, {
          radius: geofenceRadius,
          color: geofenceColor,
          fillColor: geofenceColor,
          fillOpacity: geofenceFillOpacity,
        }).addTo(map);
      }

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
            icon: geofenceIcon,
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

  useEffect(() => {
    if (!leafletMapRef.current || !mapInitialized) return;

    const map = leafletMapRef.current;

    userMarkersRef.current.forEach((marker) => marker.remove());
    userMarkersRef.current = [];

    userLocations.forEach((user) => {
      if (!user.location) return;

      const { latitude, longitude } = user.location;

      const color =
        user.role === 'student'
          ? '#0ea5e9'
          : user.role === 'orgMember'
          ? '#10b981'
          : '#8b5cf6';

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

  useEffect(() => {
    if (!centerLocation || !geofenceCircleRef.current) return;

    const userLat = centerLocation.latitude;
    const userLon = centerLocation.longitude;
    const adminLat = geofenceCircleRef.current.getLatLng().lat;
    const adminLon = geofenceCircleRef.current.getLatLng().lng;
    const distance = haversine(userLat, userLon, adminLat, adminLon);

    const isInsideGeofence = distance <= geofenceRadius;

    if (isInsideGeofence) {
      toast({
        variant: 'default',
        title: 'Inside Geofence',
        description: 'You are within the attendance area.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Outside Geofence',
        description: 'You are outside the attendance area.',
      });
    }
  }, [centerLocation, geofenceRadius]);

  return <div ref={mapRef} style={{ height: '100vh', width: '100%' }} />;
};

export default Map;

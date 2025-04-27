import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icons
const InsideIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41]
});

const OutsideIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41]
});

const Map = ({ userLocation, geofenceCenter, geofenceRadius, isWithinFence }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userCircleRef = useRef(null);
  const adminCircleRef = useRef(null);
  const markerRef = useRef(null);
  const connectionLineRef = useRef(null);

  // Initialize map and static elements
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView(
      [geofenceCenter.latitude, geofenceCenter.longitude],
      15
    );

    // Base map tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(mapInstance.current);

    // Admin's geofence circle
    adminCircleRef.current = L.circle(
      [geofenceCenter.latitude, geofenceCenter.longitude],
      {
        color: '#ff0000',
        fillColor: '#ff0000',
        fillOpacity: 0.1,
        radius: geofenceRadius,
        weight: 2
      }
    ).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update student location and visualization
  useEffect(() => {
    if (!mapInstance.current || !userLocation) return;

    // Clear previous elements
    if (userCircleRef.current) mapInstance.current.removeLayer(userCircleRef.current);
    if (markerRef.current) mapInstance.current.removeLayer(markerRef.current);
    if (connectionLineRef.current) mapInstance.current.removeLayer(connectionLineRef.current);

    // Student accuracy circle (blue)
    userCircleRef.current = L.circle(
      [userLocation.latitude, userLocation.longitude],
      {
        color: '#3388ff',
        fillColor: '#3388ff',
        fillOpacity: 0.2,
        radius: 50, // Represents location accuracy
        weight: 1
      }
    ).addTo(mapInstance.current);

    // Student marker (color changes based on geofence status)
    markerRef.current = L.marker(
      [userLocation.latitude, userLocation.longitude],
      { 
        icon: isWithinFence ? InsideIcon : OutsideIcon,
        zIndexOffset: 1000
      }
    )
      .addTo(mapInstance.current)
      .bindPopup(`<b>Your Location</b><br>Lat: ${userLocation.latitude.toFixed(6)}<br>Lng: ${userLocation.longitude.toFixed(6)}`)
      .openPopup();

    // Connection line between student and geofence center
    connectionLineRef.current = L.polyline(
      [
        [geofenceCenter.latitude, geofenceCenter.longitude],
        [userLocation.latitude, userLocation.longitude]
      ],
      {
        color: isWithinFence ? '#00aa00' : '#ff0000',
        weight: 2,
        dashArray: '5,5'
      }
    ).addTo(mapInstance.current);

    // Auto-pan to keep both locations in view
    const bounds = L.latLngBounds(
      [geofenceCenter.latitude, geofenceCenter.longitude],
      [userLocation.latitude, userLocation.longitude]
    );
    mapInstance.current.fitBounds(bounds, { padding: [50, 50] });

  }, [userLocation, isWithinFence]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height: '500px', 
        width: '100%',
        borderRadius: '8px',
        border: '1px solid #ddd',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }} 
    />
  );
};

export default Map;
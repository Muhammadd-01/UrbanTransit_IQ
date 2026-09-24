import React from 'react';
import { MapContainer as LeafletMap, TileLayer } from 'react-leaflet';
import './MapContainer.css';

const MapContainer = ({ center = [24.8607, 67.0011], zoom = 11, children }) => (
  <div className="map-wrapper card">
    <LeafletMap center={center} zoom={zoom} scrollWheelZoom={false} className="leaflet-container">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {children}
    </LeafletMap>
  </div>
);
export default MapContainer;
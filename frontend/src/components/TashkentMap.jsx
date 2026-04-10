import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';

// Fix for default marker icons in Leaflet with React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const OFISLAR = [
  { id: 1, lat: 41.3111, lng: 69.2797, nomi: "RENTAL CAR Markaziy Ofis — Amir Temur 15", tur: "ofis" },
  { id: 2, lat: 41.2581, lng: 69.2811, nomi: "Toshkent Aeroport — Kutib olish nuqtasi", tur: "airport" },
  { id: 3, lat: 41.2995, lng: 69.2401, nomi: "Samarqand Darvoza — Avtoturargoh", tur: "ofis" },
];

const ZARYAD_STANTSIYALARI = [
  { id: 101, lat: 41.3263, lng: 69.2285, nomi: "Chilonzor Fast Charge ZS", tur: "fast" },
  { id: 102, lat: 41.3414, lng: 69.3101, nomi: "Mirzo Ulug'bek ZS", tur: "normal" },
  { id: 103, lat: 41.2825, lng: 69.2081, nomi: "Sergeli ZS", tur: "normal" },
];

const TashkentMap = () => {
  return (
    <div className="w-full h-[500px] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl relative z-10">
      <MapContainer center={[41.3111, 69.2797]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%', background: '#121212' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        {OFISLAR.map(loc => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup className="custom-popup">
              <div className="p-2 text-bg-dark">
                <h4 className="font-bold text-lg">{loc.nomi}</h4>
                <p className="text-sm text-gray-600">Ish vaqti: 24/7</p>
                <div className="mt-2 text-xs font-bold uppercase tracking-widest text-primary">
                    {loc.tur === 'airport' ? '✈️ Aeroport' : '🏢 Asosiy Ofis'}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {ZARYAD_STANTSIYALARI.map(loc => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
             <Popup className="custom-popup">
                <div className="p-2 text-bg-dark">
                    <h4 className="font-bold text-lg">{loc.nomi}</h4>
                    <p className="text-sm text-gray-600">Elektromobillar uchun zaryadlash nuqtasi</p>
                    <div className="mt-2 text-xs font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                        ⚡ {loc.tur === 'fast' ? 'Tezkor (Fast Charge)' : 'Oddiy'}
                    </div>
                </div>
             </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default TashkentMap;

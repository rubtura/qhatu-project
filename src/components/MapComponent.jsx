// src/components/MapComponent.jsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Componente que solo se ejecuta en el cliente
function ClientMap() {
  const [geoData, setGeoData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const COCHABAMBA_CENTER = [-17.3895, -66.1568];

  useEffect(() => {
    setIsClient(true);
    
    // Cargar datos solo en el cliente
    fetch('/data/fotos_gps.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('GeoJSON loaded:', data);
        setGeoData(data);
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
      });
  }, []);

  // Fix para iconos de Leaflet (solo en cliente)
  useEffect(() => {
    if (isClient) {
      import('leaflet').then(L => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      });
    }
  }, [isClient]);

  function MapController({ geoData }) {
    const map = useMap();
    
    useEffect(() => {
      if (geoData && geoData.features && geoData.features.length > 0) {
        import('leaflet').then(L => {
          const group = new L.FeatureGroup();
          
          geoData.features.forEach(feature => {
            if (feature.geometry && feature.geometry.coordinates) {
              const marker = L.circleMarker(
                [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
                {
                  radius: 8,
                  fillColor: "#f59e0b",
                  color: "#ea580c",
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.8
                }
              );
              
              if (feature.properties && feature.properties.name) {
                marker.bindPopup(`
                  <div style="padding: 8px;">
                    <h3 style="font-weight: bold; color: #f59e0b; margin-bottom: 4px;">${feature.properties.name}</h3>
                    <p style="font-size: 14px; margin-bottom: 4px;">${feature.properties.description || 'Mercado informal'}</p>
                    <p style="font-size: 12px; color: #666;">
                      Coordenadas: ${feature.geometry.coordinates[1].toFixed(6)}, ${feature.geometry.coordinates[0].toFixed(6)}
                    </p>
                  </div>
                `);
              }
              group.addLayer(marker);
            }
          });
          
          map.addLayer(group);
          map.fitBounds(group.getBounds(), { padding: [20, 20] });
        });
      }
    }, [geoData, map]);

    return null;
  }

  if (!isClient) {
    return (
      <div className="h-screen w-full pt-16 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full pt-16">
      <MapContainer
        center={COCHABAMBA_CENTER}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {geoData && <MapController geoData={geoData} />}
      </MapContainer>
    </div>
  );
}

// Componente principal que usa client:only
export default function MapComponent() {
  return <ClientMap />;
}
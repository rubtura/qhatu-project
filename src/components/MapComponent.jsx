// src/components/MapComponent.jsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Componente que solo se ejecuta en el cliente
function ClientMap() {
  const [geoData, setGeoData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const COCHABAMBA_CENTER = [-17.3895, -66.1568];

  useEffect(() => {
    setIsClient(true);
    setLoading(true);
    
    // IMPORTANTE: Usa la ruta base correcta para GitHub Pages
    // Con tu configuración, BASE_URL será "/qhatu-project/"
    const baseUrl = import.meta.env.BASE_URL || '/';
    console.log('Base URL:', baseUrl);
    
    // Construye la URL correctamente
    const jsonUrl = `${baseUrl}data/fotos_gps.json`;
    console.log('Fetching JSON from:', jsonUrl);
    
    fetch(jsonUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}, URL: ${jsonUrl}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('GeoJSON loaded successfully:', data);
        setGeoData(data);
        setError(null);
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
        setError(`Error cargando datos: ${error.message}`);
        
        // Datos de prueba como fallback
        setGeoData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [-66.1568, -17.3895]
              },
              properties: {
                name: "Centro de Cochabamba",
                description: "Ubicación de prueba - Verifica la ruta del JSON"
              }
            },
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [-66.1658, -17.3795]
              },
              properties: {
                name: "Mercado Test",
                description: "Otro punto de prueba"
              }
            }
          ]
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Fix para iconos de Leaflet (solo en cliente)
  useEffect(() => {
    if (isClient) {
      import('leaflet').then(L => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: `${import.meta.env.BASE_URL || '/'}leaflet/images/marker-icon-2x.png`,
          iconUrl: `${import.meta.env.BASE_URL || '/'}leaflet/images/marker-icon.png`,
          shadowUrl: `${import.meta.env.BASE_URL || '/'}leaflet/images/marker-shadow.png`,
        });
      }).catch(err => {
        console.error('Error loading leaflet:', err);
      });
    }
  }, [isClient]);

  function MapController({ geoData }) {
    const map = useMap();
    
    useEffect(() => {
      if (geoData && geoData.features && geoData.features.length > 0) {
        import('leaflet').then(L => {
          // Limpiar marcadores anteriores
          map.eachLayer((layer) => {
            if (layer instanceof L.CircleMarker || layer instanceof L.FeatureGroup) {
              map.removeLayer(layer);
            }
          });
          
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
                  <div style="padding: 8px; min-width: 200px;">
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
          
          if (group.getLayers().length > 0) {
            map.addLayer(group);
            map.fitBounds(group.getBounds(), { 
              padding: [50, 50],
              maxZoom: 16 
            });
          }
        }).catch(err => {
          console.error('Error creating markers:', err);
        });
      }
    }, [geoData, map]);

    return null;
  }

  if (!isClient || loading) {
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
      {error && (
        <div className="absolute top-20 right-4 z-[1000] bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded shadow-lg">
          <p className="font-semibold">⚠️ Advertencia</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-1">Mostrando datos de prueba</p>
        </div>
      )}
      
      <MapContainer
        center={COCHABAMBA_CENTER}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        className="z-0"
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

export default function MapComponent() {
  return <ClientMap />;
}

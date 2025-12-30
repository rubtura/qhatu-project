// src/components/MapComponent.jsx
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Componente que solo se ejecuta en el cliente
function ClientMap() {
  const [geoData, setGeoData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const COCHABAMBA_CENTER = [-17.3895, -66.1568];

  useEffect(() => {
    setIsClient(true);

    // ✅ Ruta compatible con LOCAL y GitHub Pages
    const url = `${import.meta.env.BASE_URL}data/fotos_gps.json`;
    console.log("Cargando GeoJSON desde:", url);

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok (HTTP ${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("GeoJSON loaded:", data);
        setGeoData(data);
      })
      .catch((error) => {
        console.error("Error loading GeoJSON:", error);
      });
  }, []);

  // Fix para iconos de Leaflet (solo en cliente)
  useEffect(() => {
    if (isClient) {
      import("leaflet").then((L) => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });
      });
    }
  }, [isClient]);

  function MapController({ geoData }) {
    const map = useMap();

    // ✅ Guardamos el grupo en un ref para poder removerlo (cleanup)
    const groupRef = useRef(null);

    useEffect(() => {
      if (!map) return;
      if (!geoData || !geoData.features || geoData.features.length === 0) return;

      let cancelled = false;

      import("leaflet").then((L) => {
        if (cancelled) return;

        // ✅ Si ya existe un grupo anterior, lo quitamos antes de crear uno nuevo
        if (groupRef.current) {
          map.removeLayer(groupRef.current);
          groupRef.current = null;
        }

        const group = new L.FeatureGroup();

        geoData.features.forEach((feature) => {
          if (feature.geometry && feature.geometry.coordinates) {
            const lat = feature.geometry.coordinates[1];
            const lng = feature.geometry.coordinates[0];

            const marker = L.circleMarker([lat, lng], {
              radius: 8,
              fillColor: "#f59e0b",
              color: "#ea580c",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8,
            });

            if (feature.properties && feature.properties.name) {
              marker.bindPopup(`
                <div style="padding: 8px;">
                  <h3 style="font-weight: bold; color: #f59e0b; margin-bottom: 4px;">${feature.properties.name}</h3>
                  <p style="font-size: 14px; margin-bottom: 4px;">${
                    feature.properties.description || "Mercado informal"
                  }</p>
                  <p style="font-size: 12px; color: #666;">
                    Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}
                  </p>
                </div>
              `);
            }

            group.addLayer(marker);
          }
        });

        // ✅ Guardar referencia y agregar al mapa
        groupRef.current = group;
        map.addLayer(group);

        // ✅ Fitbounds solo si hay algo (evita errores)
        if (group.getLayers().length > 0) {
          map.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
      });

      // ✅ Cleanup: si el componente se desmonta o cambia geoData, removemos capa
      return () => {
        cancelled = true;
        if (groupRef.current) {
          map.removeLayer(groupRef.current);
          groupRef.current = null;
        }
      };
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
        style={{ height: "100%", width: "100%" }}
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

// Componente principal
export default function MapComponent() {
  return <ClientMap />;
}

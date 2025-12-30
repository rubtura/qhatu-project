// src/components/MapComponent.jsx
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapComponent() {
  const [geoData, setGeoData] = useState(null);
  const COCHABAMBA_CENTER = [-17.3895, -66.1568];

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/fotos_gps.json`;
    console.log("Cargando GeoJSON:", url);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("GeoJSON cargado:", data.features.length);
        setGeoData(data);
      })
      .catch((err) => console.error("Error cargando JSON:", err));
  }, []);

  // Estilo de los puntos
  const pointStyle = {
    radius: 8,
    fillColor: "#f59e0b",
    color: "#ea580c",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.85
  };

  // Popup por feature
  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      layer.bindPopup(`
        <div style="padding:8px">
          <strong style="color:#f59e0b">
            ${feature.properties.name || "Punto GPS"}
          </strong>
          <p style="margin:4px 0">
            ${feature.properties.description || "Mercado informal"}
          </p>
          <small>
            ${feature.geometry.coordinates[1].toFixed(6)},
            ${feature.geometry.coordinates[0].toFixed(6)}
          </small>
        </div>
      `);
    }
  };

  return (
    <div className="h-screen w-full pt-16">
      <MapContainer
        center={COCHABAMBA_CENTER}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {geoData && (
          <GeoJSON
            data={geoData}
            pointToLayer={(feature, latlng) =>
              window.L.circleMarker(latlng, pointStyle)
            }
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
}

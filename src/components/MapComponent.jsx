// src/components/MapComponent.jsx
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function FitBounds({ geoData }) {
  const map = useMap();

  useEffect(() => {
    if (!geoData?.features?.length) return;

    const coords = geoData.features
      .map((f) => f?.geometry?.coordinates)
      .filter((c) => Array.isArray(c) && c.length >= 2)
      .map(([lng, lat]) => [lat, lng]); // Leaflet usa [lat, lng]

    if (coords.length === 0) return;

    let minLat = coords[0][0];
    let maxLat = coords[0][0];
    let minLng = coords[0][1];
    let maxLng = coords[0][1];

    for (const [lat, lng] of coords) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }

    map.fitBounds(
      [
        [minLat, minLng],
        [maxLat, maxLng],
      ],
      { padding: [30, 30] }
    );
  }, [geoData, map]);

  return null;
}

export default function MapComponent() {
  const [geoData, setGeoData] = useState(null);
  const COCHABAMBA_CENTER = [-17.3895, -66.1568];

  useEffect(() => {
    // ✅ Forma robusta (NO falla por slash) para Astro/Vite + GitHub Pages
    const url = new URL("data/fotos_gps.json", import.meta.env.BASE_URL).toString();

    console.log("Cargando GeoJSON desde:", url);

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        console.log("GeoJSON cargado. Features:", data?.features?.length || 0);
        setGeoData(data);
      })
      .catch((err) => console.error("Error cargando GeoJSON:", err));
  }, []);

  const geoJsonOptions = useMemo(() => {
    return {
      pointToLayer: (feature, latlng) => {
        // ✅ CircleMarker usando Leaflet del navegador (ya está cargado por react-leaflet)
        return window.L.circleMarker(latlng, {
          radius: 8,
          fillColor: "#f59e0b",
          color: "#ea580c",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        });
      },
      onEachFeature: (feature, layer) => {
        const name = feature?.properties?.name || "Punto";
        const desc = feature?.properties?.description || "Mercado informal";
        const c = feature?.geometry?.coordinates;

        if (Array.isArray(c) && c.length >= 2) {
          const [lng, lat] = c;
          layer.bindPopup(`
            <div style="padding: 8px;">
              <h3 style="font-weight: bold; color: #f59e0b; margin-bottom: 4px;">${name}</h3>
              <p style="font-size: 14px; margin-bottom: 4px;">${desc}</p>
              <p style="font-size: 12px; color: #666;">
                Coordenadas: ${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}
              </p>
            </div>
          `);
        }
      },
    };
  }, []);

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
          <>
            {/* ✅ Enfoca donde están tus puntos */}
            <FitBounds geoData={geoData} />

            {/* ✅ Dibuja los puntos */}
            <GeoJSON data={geoData} {...geoJsonOptions} />
          </>
        )}
      </MapContainer>
    </div>
  );
}

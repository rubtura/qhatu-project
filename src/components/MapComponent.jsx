// src/components/MapComponent.jsx
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function FitBounds({ geoData }) {
  const map = useMap();

  useEffect(() => {
    if (!geoData?.features?.length) return;

    // Calcula bounds en base a puntos (lng,lat)
    const coords = geoData.features
      .map((f) => f?.geometry?.coordinates)
      .filter((c) => Array.isArray(c) && c.length >= 2)
      .map(([lng, lat]) => [lat, lng]); // Leaflet: [lat,lng]

    if (coords.length === 0) return;

    // bounds manual sin depender de L
    let minLat = coords[0][0],
      maxLat = coords[0][0],
      minLng = coords[0][1],
      maxLng = coords[0][1];

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
    const url = `${import.meta.env.BASE_URL}data/fotos_gps.json`;
    console.log("Cargando GeoJSON desde:", url);

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        console.log("GeoJSON cargado. Features:", data?.features?.length);
        setGeoData(data);
      })
      .catch((err) => console.error("Error cargando GeoJSON:", err));
  }, []);

  // Estilo para los puntos (círculos naranjas)
  const geoJsonOptions = useMemo(() => {
    return {
      pointToLayer: (feature, latlng) => {
        // Circle marker sin depender de window.L
        // Leaflet interno lo maneja react-leaflet
        return new window.L.CircleMarker(latlng, {
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
            {/* ✅ Esto hace que SIEMPRE te enfoque donde están los puntos */}
            <FitBounds geoData={geoData} />

            {/* ✅ Render real de los puntos */}
            <GeoJSON key={geoData?.features?.length || 0} data={geoData} {...geoJsonOptions} />
          </>
        )}
      </MapContainer>
    </div>
  );
}

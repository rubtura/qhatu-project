import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function MapComponent() {
  const [geoData, setGeoData] = useState(null);
  const COCHABAMBA_CENTER = [-17.3895, -66.1568];

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/fotos_gps.json`;
    console.log("Cargando JSON:", url);

    fetch(url)
      .then(r => r.json())
      .then(data => {
        console.log("Features:", data.features.length);
        setGeoData(data);
      })
      .catch(err => console.error(err));
  }, []);

  const pointToLayer = (feature, latlng) =>
    L.circleMarker(latlng, {
      radius: 8,
      fillColor: "#f59e0b",
      color: "#ea580c",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85
    });

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      layer.bindPopup(`
        <strong>${feature.properties.name}</strong><br/>
        ${feature.properties.description}
      `);
    }
  };

  return (
    <div className="h-screen w-full pt-16">
      <MapContainer
        center={COCHABAMBA_CENTER}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        {geoData && (
          <GeoJSON
            data={geoData}
            pointToLayer={pointToLayer}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
}

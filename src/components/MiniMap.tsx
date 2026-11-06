import { useEffect, useRef } from 'react';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { darkMapStyles, loadGoogleMaps } from '../lib/googleMaps';

const pin = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export type MapPoint = { lat: number; lng: number; label?: string };

type Props = {
  points: MapPoint[];
  path?: [number, number][];
  height?: number;
  label: string;
};

function hasViteGoogleKey() {
  return Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
}

export default function MiniMap({ points, path, height = 190, label }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!host.current || !points.length) return;
    let cancelled = false;
    let leaflet: L.Map | null = null;

    const drawLeaflet = () => {
      if (cancelled || !host.current) return;
      leaflet = L.map(host.current, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(leaflet);
      const layers = L.layerGroup().addTo(leaflet);
      const bounds: L.LatLng[] = [];
      points.forEach((point) => {
        const latlng = L.latLng(point.lat, point.lng);
        bounds.push(latlng);
        L.marker(latlng, { icon: pin, title: point.label || label })
          .bindPopup(point.label || label)
          .addTo(layers);
      });
      if (path && path.length > 1) {
        const line = path.map(([lat, lng]) => L.latLng(lat, lng));
        L.polyline(line, { color: '#e10600', weight: 4, opacity: 0.9 }).addTo(layers);
        line.forEach((pt) => bounds.push(pt));
      }
      if (bounds.length === 1) leaflet.setView(bounds[0], 14);
      else if (bounds.length > 1) leaflet.fitBounds(L.latLngBounds(bounds), { padding: [28, 28] });
      window.setTimeout(() => leaflet?.invalidateSize(), 80);
    };

    const drawGoogle = () => {
      if (cancelled || !host.current) return;
      const google = (window as unknown as { google: { maps: Record<string, unknown> } }).google;
      const maps = google.maps as {
        Map: new (el: HTMLElement, opts: object) => {
          fitBounds: (b: object, p?: number) => void;
          setCenter: (c: object) => void;
          setZoom: (z: number) => void;
        };
        Marker: new (opts: object) => unknown;
        Polyline: new (opts: object) => unknown;
        LatLng: new (lat: number, lng: number) => object;
        LatLngBounds: new () => { extend: (p: object) => void };
      };
      const map = new maps.Map(host.current, {
        zoom: 14,
        center: { lat: points[0].lat, lng: points[0].lng },
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'cooperative',
        styles: darkMapStyles,
        backgroundColor: '#1a1a1a',
      });
      const bounds = new maps.LatLngBounds();
      points.forEach((point) => {
        const position = new maps.LatLng(point.lat, point.lng);
        bounds.extend(position);
        new maps.Marker({
          position,
          map,
          title: point.label || label,
        });
      });
      if (path && path.length > 1) {
        new maps.Polyline({
          path: path.map(([lat, lng]) => ({ lat, lng })),
          strokeColor: '#e10600',
          strokeOpacity: 0.9,
          strokeWeight: 4,
          map,
        });
        path.forEach(([lat, lng]) => bounds.extend(new maps.LatLng(lat, lng)));
      }
      if (points.length === 1 && (!path || path.length < 2)) {
        map.setCenter({ lat: points[0].lat, lng: points[0].lng });
        map.setZoom(14);
      } else {
        map.fitBounds(bounds, 28);
      }
    };

    if (hasViteGoogleKey()) {
      loadGoogleMaps().then(drawGoogle).catch(drawLeaflet);
    } else {
      drawLeaflet();
    }

    return () => {
      cancelled = true;
      leaflet?.remove();
    };
  }, [points, path, label]);

  return (
    <div
      ref={host}
      className="mini-map"
      style={{ height, display: points.length ? 'block' : 'none' }}
      role="img"
      aria-label={label}
    />
  );
}

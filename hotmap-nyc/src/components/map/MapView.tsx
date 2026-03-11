'use client';
import { useState, useCallback } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Place, CATEGORY_COLORS } from '@/types';

interface MapViewProps {
  places: Place[];
  selectedPlaceId: string | null;
  onSelectPlace: (id: string) => void;
}

// Refined category colors matching the new palette
const CAT_COLOR: Record<string, string> = {
  COFFEE:  '#C8923A',
  STUDY:   '#6B8FC8',
  LIBRARY: '#8B6BC8',
  GYM:     '#4ECBA0',
  BAR:     '#C86B8F',
  FOOD:    '#C8923A',
  PARK:    '#6BC87A',
};

export function MapView({ places, selectedPlaceId, onSelectPlace }: MapViewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelectPlace(id);
  }, [onSelectPlace]);

  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{ longitude: -73.9857, latitude: 40.7484, zoom: 12.5 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      minZoom={10}
      maxZoom={18}
      maxBounds={[[-74.2591, 40.4774], [-73.7004, 40.9176]]}
    >
      <NavigationControl position="bottom-right" showCompass={false} />

      {places.map(place => {
        const color     = CAT_COLOR[place.category] || '#C8923A';
        const selected  = place.id === selectedPlaceId;
        const hovered   = place.id === hoveredId;
        const trending  = (place.trendVelocity || 0) > 2;
        const busy      = (place.avgCrowdLevel || 0) >= 4;

        // Marker sizes — restrained, not giant
        const outer = selected ? 32 : trending ? 28 : 22;
        const inner = selected ? 20 : trending ? 16 : 12;
        const scale = selected ? 1 : hovered ? 1.15 : 1;

        return (
          <Marker
            key={place.id}
            longitude={place.lng}
            latitude={place.lat}
            anchor="center"
          >
            <div
              onClick={e => handleClick(e, place.id)}
              onMouseEnter={() => setHoveredId(place.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                width:  outer,
                height: outer,
                borderRadius: '50%',
                background: selected ? color : `${color}18`,
                border: `1px solid ${selected ? color : `${color}60`}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transform: `scale(${scale})`,
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                boxShadow: selected
                  ? `0 0 0 4px ${color}22, 0 0 16px ${color}33`
                  : trending
                  ? `0 0 8px ${color}33`
                  : 'none',
                position: 'relative',
                zIndex: selected ? 20 : hovered ? 10 : 1,
              }}
            >
              {/* Inner dot */}
              <div style={{
                width:  inner,
                height: inner,
                borderRadius: '50%',
                background: selected ? '#0C0C0C' : color,
                flexShrink: 0,
              }} />

              {/* Busy pulse ring */}
              {busy && !selected && (
                <div style={{
                  position: 'absolute',
                  inset: -3,
                  borderRadius: '50%',
                  border: `1px solid ${color}`,
                  opacity: 0.35,
                  pointerEvents: 'none',
                  animation: 'ping-ring 1.8s ease-out infinite',
                }} />
              )}
            </div>
          </Marker>
        );
      })}
    </Map>
  );
}
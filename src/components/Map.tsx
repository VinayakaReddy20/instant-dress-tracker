import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { Tables } from "@/integrations/supabase/types";

type Shop = Tables<'shops'>;

interface ShopMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  location?: string;
}

interface MapProps {
  shops: Shop[] | ShopMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (shopId: string) => void;
}

const Map = ({
  shops,
  center = [15.1394, 76.9214],
  zoom = 13,
  height = "400px",
  onMarkerClick
}: MapProps) => {
  const validShops = shops.filter(shop => shop.latitude && shop.longitude);

  const handleMapClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      style={{ height, width: '100%', pointerEvents: 'auto' }}
      onClick={handleMapClick}
      onMouseDown={handleMapClick}
      onTouchStart={handleMapClick}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validShops.map((shop) => (
          <Marker
            key={shop.id}
            position={[shop.latitude!, shop.longitude!]}
            eventHandlers={{
              click: () => onMarkerClick?.(shop.id),
            }}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold text-sm">{shop.name}</h3>
                {shop.location && (
                  <p className="text-xs text-gray-600">{shop.location}</p>
                )}
                {shop.address && (
                  <p className="text-xs text-gray-600">{shop.address}</p>
                )}
                {onMarkerClick && (
                  <button
                    className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    onClick={() => onMarkerClick(shop.id)}
                  >
                    View Shop
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;

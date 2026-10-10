import React, { useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { CENTRAL_FARM_HUB, getDistrictCoordinates, interpolatePosition } from '../constants/locations';
import { Order } from '../types';
import { Truck, MapPin, Store, Navigation } from 'lucide-react';

interface GoogleDeliveryMapProps {
  order: Order;
  apiKey: string;
}

export const GoogleDeliveryMap: React.FC<GoogleDeliveryMapProps> = ({ order, apiKey }) => {
  const destinationCoords = useMemo(() => {
    return getDistrictCoordinates(order.district);
  }, [order.district]);

  // Determine courier position based on order status progress
  const courierCoords = useMemo(() => {
    switch (order.status) {
      case 'confirmed':
        return CENTRAL_FARM_HUB;
      case 'packing':
        return interpolatePosition(CENTRAL_FARM_HUB, destinationCoords, 0.15);
      case 'on_the_way':
        return interpolatePosition(CENTRAL_FARM_HUB, destinationCoords, 0.65);
      case 'delivered':
        return destinationCoords;
      default:
        return CENTRAL_FARM_HUB;
    }
  }, [order.status, destinationCoords]);

  // Center between hub and destination
  const mapCenter = useMemo(() => {
    return {
      lat: (CENTRAL_FARM_HUB.lat + destinationCoords.lat) / 2,
      lng: (CENTRAL_FARM_HUB.lng + destinationCoords.lng) / 2,
    };
  }, [destinationCoords]);

  return (
    <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner bg-slate-100">
      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: '100%', height: '100%' }}
          defaultCenter={mapCenter}
          defaultZoom={11}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          mapId="nasbaladna-delivery-map"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          {/* Farm Central Hub Marker */}
          <AdvancedMarker
            position={CENTRAL_FARM_HUB}
            title="NasBaladna Central Farm Hub"
          >
            <Pin
              background="#047857"
              borderColor="#065f46"
              glyphColor="#FFFFFF"
              scale={1.1}
            />
          </AdvancedMarker>

          {/* Customer Destination Marker */}
          <AdvancedMarker
            position={destinationCoords}
            title={`Customer Delivery: ${order.address}`}
          >
            <Pin
              background="#DC2626"
              borderColor="#991B1B"
              glyphColor="#FFFFFF"
              scale={1.1}
            />
          </AdvancedMarker>

          {/* Courier Van GPS Live Marker */}
          <AdvancedMarker
            position={courierCoords}
            title={`Courier: ${order.courier.name} (${order.courier.vehicle})`}
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute -inset-2 rounded-full bg-emerald-500 opacity-75 animate-ping" />
              <div className="relative bg-emerald-700 text-white p-2 rounded-full shadow-lg border-2 border-white flex items-center justify-center">
                <Truck className="w-4 h-4 text-white" />
              </div>
            </div>
          </AdvancedMarker>
        </Map>
      </APIProvider>

      {/* Live Telemetry Overlay */}
      <div className="absolute top-2 left-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] text-white flex items-center gap-2 shadow-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono font-bold text-emerald-400">GOOGLE MAPS GPS LIVE</span>
        <span className="text-slate-400">·</span>
        <span className="text-slate-300 font-medium">{order.district}</span>
      </div>

      <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md p-2 rounded-xl border border-slate-200 text-[11px] text-slate-700 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate max-w-[200px] sm:max-w-xs font-medium">
            To: {order.address} ({order.district})
          </span>
        </div>
        <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
          {order.status === 'delivered' ? 'Arrived' : `~${order.estimatedMinutes} mins away`}
        </span>
      </div>
    </div>
  );
};

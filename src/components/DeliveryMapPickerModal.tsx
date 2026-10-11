import React, { useState } from 'react';
import {
  X,
  MapPin,
  Navigation,
  CheckCircle2,
  ExternalLink,
  Compass,
  Building,
  Home,
  Info,
  LocateFixed,
} from 'lucide-react';
import { QATAR_DISTRICT_COORDINATES, LatLng, getDistrictCoordinates } from '../constants/locations';

interface DeliveryMapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDistrict: string;
  currentAddress: string;
  initialCoordinates?: LatLng;
  onConfirmLocation: (data: {
    district: string;
    address: string;
    coordinates: LatLng;
    googleMapsUrl: string;
    deliveryNotes: string;
  }) => void;
}

export const DeliveryMapPickerModal: React.FC<DeliveryMapPickerModalProps> = ({
  isOpen,
  onClose,
  currentDistrict,
  currentAddress,
  initialCoordinates,
  onConfirmLocation,
}) => {
  if (!isOpen) return null;

  const defaultCoords = initialCoordinates || getDistrictCoordinates(currentDistrict);
  const [selectedCoords, setSelectedCoords] = useState<LatLng>(defaultCoords);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(currentDistrict);
  const [addressDetails, setAddressDetails] = useState<string>(currentAddress);
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationSuccess, setLocationSuccess] = useState<string>('');

  // Qatar bounding box coordinates for mapping onto our visual SVG map
  // North: 25.55 (Lusail/Al Khor), South: 25.10 (Al Wakrah/Mesaieed)
  // West: 51.35 (Al Shahaniya/Rayyan), East: 51.65 (The Pearl/Coast)
  const MIN_LAT = 25.12;
  const MAX_LAT = 25.50;
  const MIN_LNG = 51.36;
  const MAX_LNG = 51.63;

  // Convert lat/lng to SVG viewBox (600 x 400) percentages
  const getSvgCoordinates = (coords: LatLng) => {
    const x = ((coords.lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 600;
    const y = ((MAX_LAT - coords.lat) / (MAX_LAT - MIN_LAT)) * 400;
    return {
      x: Math.max(30, Math.min(570, x)),
      y: Math.max(30, Math.min(370, y)),
    };
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = 600 / rect.width;
    const scaleY = 400 / rect.height;

    const svgX = clickX * scaleX;
    const svgY = clickY * scaleY;

    // Convert SVG coordinates back to estimated Lat/Lng
    const lng = MIN_LNG + (svgX / 600) * (MAX_LNG - MIN_LNG);
    const lat = MAX_LAT - (svgY / 400) * (MAX_LAT - MIN_LAT);

    const newCoords = {
      lat: Number(lat.toFixed(4)),
      lng: Number(lng.toFixed(4)),
    };

    setSelectedCoords(newCoords);
    setLocationSuccess('Pin dropped on map!');

    // Find closest district
    let closestDist = selectedDistrict;
    let minDistance = 9999;
    Object.entries(QATAR_DISTRICT_COORDINATES).forEach(([dist, c]) => {
      const d = Math.hypot(c.lat - lat, c.lng - lng);
      if (d < minDistance) {
        minDistance = d;
        closestDist = dist;
      }
    });
    setSelectedDistrict(closestDist);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationSuccess('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(4));
        const lng = Number(position.coords.longitude.toFixed(4));
        const coords = { lat, lng };

        setSelectedCoords(coords);
        setIsLocating(false);
        setLocationSuccess('GPS location detected successfully!');

        // Find closest Qatar district
        let closestDist = selectedDistrict;
        let minDistance = 9999;
        Object.entries(QATAR_DISTRICT_COORDINATES).forEach(([dist, c]) => {
          const d = Math.hypot(c.lat - lat, c.lng - lng);
          if (d < minDistance) {
            minDistance = d;
            closestDist = dist;
          }
        });
        setSelectedDistrict(closestDist);
      },
      (error) => {
        setIsLocating(false);
        // Fallback gracefully
        setSelectedCoords(getDistrictCoordinates(selectedDistrict));
        setLocationSuccess('Using selected district coordinates.');
        console.warn('Geolocation error:', error.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    const googleMapsUrl = `https://www.google.com/maps?q=${selectedCoords.lat},${selectedCoords.lng}`;
    onConfirmLocation({
      district: selectedDistrict,
      address: addressDetails,
      coordinates: selectedCoords,
      googleMapsUrl,
      deliveryNotes,
    });
    onClose();
  };

  const pinPos = getSvgCoordinates(selectedCoords);
  const mapsLink = `https://www.google.com/maps?q=${selectedCoords.lat},${selectedCoords.lng}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-['Outfit']">
                Pinpoint Delivery Address on Map
              </h3>
              <p className="text-[11px] text-slate-300">
                Drop your villa / building location pin for precise Qatar courier routing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* Geolocation & Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-50"
            >
              <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting GPS...' : 'Use My Current Location'}</span>
            </button>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>GPS: {selectedCoords.lat.toFixed(4)}° N, {selectedCoords.lng.toFixed(4)}° E</span>
            </div>

            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              <span>Test Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {locationSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{locationSuccess}</span>
            </div>
          )}

          {/* Interactive Qatar Vector Map */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0c1424] shadow-inner">
            <div className="absolute top-2.5 left-2.5 z-10 bg-slate-900/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-slate-700 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Click map to move pin</span>
            </div>

            <svg
              viewBox="0 0 600 400"
              onClick={handleMapClick}
              className="w-full h-56 sm:h-64 cursor-crosshair select-none"
            >
              {/* Arabian Gulf Water Background */}
              <rect width="600" height="400" fill="#08101d" />

              {/* Qatar Peninsula Landmass Silhouette */}
              <path
                d="M 120 380 L 160 300 Q 200 240 230 180 Q 280 80 340 50 Q 420 50 480 120 Q 520 200 500 280 Q 470 350 440 380 Z"
                fill="#13233c"
                stroke="#1e3a63"
                strokeWidth="2"
              />

              {/* Major Highway Corridors */}
              <path
                d="M 280 380 L 350 250 L 390 140 L 360 60"
                stroke="#1e3a63"
                strokeWidth="3"
                strokeDasharray="4 4"
                fill="none"
              />
              <path
                d="M 350 250 L 490 220"
                stroke="#1e3a63"
                strokeWidth="2.5"
                strokeDasharray="3 3"
                fill="none"
              />

              {/* District Hub Landmarks */}
              {Object.entries(QATAR_DISTRICT_COORDINATES).map(([distName, coords]) => {
                const pos = getSvgCoordinates(coords);
                const isSelected = selectedDistrict === distName;
                return (
                  <g
                    key={distName}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCoords(coords);
                      setSelectedDistrict(distName);
                      setLocationSuccess(`Selected ${distName}!`);
                    }}
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? '6' : '3.5'}
                      fill={isSelected ? '#10b981' : '#64748b'}
                      stroke={isSelected ? '#ffffff' : '#1e293b'}
                      strokeWidth={isSelected ? '2' : '1'}
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 7}
                      fontSize="9"
                      fill={isSelected ? '#34d399' : '#94a3b8'}
                      textAnchor="middle"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="pointer-events-none select-none font-sans"
                    >
                      {distName.split(',')[0]}
                    </text>
                  </g>
                );
              })}

              {/* Active Drop Pin Marker with pulsing radar ring */}
              <circle
                cx={pinPos.x}
                cy={pinPos.y}
                r="18"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
                className="animate-ping opacity-60 pointer-events-none"
              />
              <circle
                cx={pinPos.x}
                cy={pinPos.y}
                r="8"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2.5"
                className="pointer-events-none shadow-lg"
              />
            </svg>

            {/* Bottom Status Overlay */}
            <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-semibold text-white">Target Zone:</span>
                <span className="text-emerald-300 font-bold">{selectedDistrict}</span>
              </div>
              <span className="text-slate-400 text-[10px]">
                Coordinates will be sent to the delivery driver
              </span>
            </div>
          </div>

          {/* Quick District Presets */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Select or Jump to District:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(QATAR_DISTRICT_COORDINATES).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    const c = QATAR_DISTRICT_COORDINATES[d];
                    setSelectedCoords(c);
                    setSelectedDistrict(d);
                    setLocationSuccess(`Selected ${d}!`);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    selectedDistrict === d
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Address Details & Driver Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-emerald-600" />
                <span>Street, Villa / Building Number</span>
              </label>
              <input
                type="text"
                value={addressDetails}
                onChange={(e) => setAddressDetails(e.target.value)}
                placeholder="Villa 24, Street 902, Zone 66"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                <span>Driver Delivery Instructions (Optional)</span>
              </label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Ring buzzer, black villa gate next to mosque"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold rounded-xl text-xs hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Delivery Location Pin</span>
          </button>
        </div>
      </div>
    </div>
  );
};

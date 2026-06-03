import { useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { TaxiVehicle, TaxiVehicleStatus } from '../../types/taxi';

interface VehicleMapProps {
  vehicles: TaxiVehicle[];
}

const ANTANANARIVO_CENTER: [number, number] = [-18.8792, 47.5079];

const fallbackLocations: Array<[number, number]> = [
  [-18.8792, 47.5079],
  [-18.8896, 47.5255],
  [-18.8704, 47.5212],
  [-18.8992, 47.5067],
  [-18.8627, 47.4934],
  [-18.9141, 47.5317],
];

const statusLabels: Record<TaxiVehicleStatus, string> = {
  AVAILABLE: 'Disponible',
  IN_SERVICE: 'En course',
  MAINTENANCE: 'Maintenance',
  RENTED: 'Loué',
  OFFLINE: 'Hors ligne',
};

const statusColors: Record<TaxiVehicleStatus, string> = {
  AVAILABLE: '#16a34a',
  IN_SERVICE: '#0891b2',
  MAINTENANCE: '#d97706',
  RENTED: '#7c3aed',
  OFFLINE: '#64748b',
};

const createVehicleIcon = (status: TaxiVehicleStatus) => {
  const color = statusColors[status] ?? '#0891b2';

  return L.divIcon({
    className: 'vehicle-location-marker',
    html: `
      <span style="
        display: block;
        width: 18px;
        height: 18px;
        border-radius: 9999px;
        background: ${color};
        border: 3px solid white;
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.25);
      "></span>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
};

const getVehiclePosition = (vehicle: TaxiVehicle, index: number): [number, number] => {
  if (
    typeof vehicle.currentLocation?.latitude === 'number' &&
    typeof vehicle.currentLocation?.longitude === 'number'
  ) {
    return [vehicle.currentLocation.latitude, vehicle.currentLocation.longitude];
  }

  return fallbackLocations[index % fallbackLocations.length];
};

export default function VehicleMap({ vehicles }: VehicleMapProps) {
  const mappedVehicles = useMemo(
    () =>
      vehicles.map((vehicle, index) => ({
        vehicle,
        position: getVehiclePosition(vehicle, index),
        isLive: Boolean(vehicle.currentLocation),
      })),
    [vehicles]
  );

  return (
    <div className="h-[360px] overflow-hidden rounded-xl border border-gray-100">
      <MapContainer
        center={ANTANANARIVO_CENTER}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mappedVehicles.map(({ vehicle, position, isLive }) => (
          <Marker
            key={vehicle.id || vehicle._id || vehicle.plateNumber}
            position={position}
            icon={createVehicleIcon(vehicle.status)}
          >
            <Popup>
              <div className="min-w-44">
                <p className="font-semibold text-gray-900">{vehicle.plateNumber}</p>
                <p className="text-sm text-gray-600">{vehicle.brand} {vehicle.model}</p>
                <p className="mt-2 text-xs font-medium text-gray-500">
                  {statusLabels[vehicle.status] ?? vehicle.status}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {isLive ? vehicle.currentLocation?.address || 'Position GPS transmise' : 'Position de démonstration'}
                </p>
                {vehicle.currentLocation?.speed !== undefined && (
                  <p className="mt-1 text-xs text-gray-500">{vehicle.currentLocation.speed} km/h</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

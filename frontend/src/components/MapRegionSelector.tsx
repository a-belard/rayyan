'use client';

import { useEffect, useState } from 'react';
import Maps from '@/components/Maps';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface CropRegionSelection {
  points: [number, number][];
  cropType: string;
}

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  permissionStatus: string | null;
}

export interface MapRegionSelectorProps {
  className?: string;
  title?: string;
  infoTitle?: string;
  showInfoSection?: boolean;
  showHeader?: boolean;
  fullHeight?: boolean;
  initialCenter?: LatLng | null;
  defaultZoom?: number;
  enableWatch?: boolean;
  onRegionAdded?: (region: CropRegionSelection) => void;
  onRegionsChange?: (regions: CropRegionSelection[]) => void;
}

/**
 * MapRegionSelector
 *
 * A full, self-contained component that provides:
 * - Location permission + status UI
 * - Interactive map (via Maps component) with region drawing and crop type selection
 * - Selected regions summary and an info section
 *
 * Drop this into any page (e.g., a dashboard) and it will work out of the box.
 */
export default function MapRegionSelector({
  className = '',
  title = 'Crop Region Mapping',
  infoTitle = '🛡️ Privacy & Security',
  showInfoSection = true,
  showHeader = true,
  fullHeight = false,
  initialCenter = null,
  defaultZoom = 15,
  enableWatch = true,
  onRegionAdded,
  onRegionsChange,
}: MapRegionSelectorProps) {
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState<LocationState>({
    latitude: initialCenter?.lat ?? null,
    longitude: initialCenter?.lng ?? null,
    accuracy: null,
    loading: false,
    error: null,
    permissionStatus: null,
  });

  const [mapCenter, setMapCenter] = useState<LatLng | null>(initialCenter);
  const [selectedRegions, setSelectedRegions] = useState<CropRegionSelection[]>([]);
  const [showMap, setShowMap] = useState<boolean>(Boolean(initialCenter));

  // Collect regions and bubble up
  const handleRegionSelect = (region: CropRegionSelection) => {
    setSelectedRegions((prev: CropRegionSelection[]) => {
      const next = [...prev, region];
      onRegionAdded?.(region);
      onRegionsChange?.(next);
      return next;
    });
  };

  useEffect(() => setMounted(true), []);

  const isGeolocationSupported = mounted && typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const requestLocation = () => {
    if (!isGeolocationSupported) {
      setLocation((prev: LocationState) => ({ ...prev, error: 'Geolocation is not supported by this browser.' }));
      return;
    }

    setLocation((prev: LocationState) => ({ ...prev, loading: true, error: null }));

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({
          latitude,
          longitude,
          accuracy,
          loading: false,
          error: null,
          permissionStatus: 'granted',
        });
        setMapCenter({ lat: latitude, lng: longitude });
        setShowMap(true);
      },
      (error) => {
        let errorMessage = 'Failed to get location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
  setLocation((prev: LocationState) => ({ ...prev, loading: false, error: errorMessage, permissionStatus: 'denied' }));
      },
      options,
    );
  };

  const watchLocation = () => {
    if (!isGeolocationSupported || !enableWatch) return;

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
  setLocation((prev: LocationState) => ({ ...prev, latitude, longitude, accuracy, loading: false, error: null }));
        setMapCenter({ lat: latitude, lng: longitude });
        setShowMap(true);
      },
      () => {},
      options,
    );

    return () => navigator.geolocation.clearWatch(watchId);
  };

  useEffect(() => {
    if (mounted && typeof navigator !== 'undefined' && 'permissions' in navigator) {
      // @ts-ignore - permissions typing varies by browser
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result: { state?: string }) => {
          setLocation((prev: LocationState) => ({ ...prev, permissionStatus: result?.state ?? prev.permissionStatus }));
        })
        .catch(() => {});
    }
  }, [mounted]);

  return (
    <div className={`${fullHeight ? 'min-h-screen' : ''} bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        {showHeader && (
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{title}</h1>
            <p className="text-base md:text-lg text-gray-900 max-w-2xl">
              Select crop regions on an interactive map using your GPS location. Grant location permission to start mapping your agricultural areas.
            </p>
          </div>
        )}

        {/* Location Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Location Services</h2>

          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={requestLocation}
              disabled={location.loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {location.loading ? 'Getting Location...' : 'Get My Location'}
            </button>

            {enableWatch && (
              <button
                onClick={watchLocation}
                disabled={!location.latitude || location.loading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
              >
                Watch Location
              </button>
            )}
          </div>

          {/* Location Status */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Location Status</h3>
              {location.error && (
                <div className="text-gray-900 bg-red-50 p-3 rounded border border-red-200">
                  <span className="block font-medium text-gray-900">⚠️ Error:</span>
                  {location.error}
                </div>
              )}

              {location.loading && (
                <div className="text-gray-900 bg-blue-50 p-3 rounded border border-blue-200">📍 Getting your location...</div>
              )}

              {location.latitude && location.longitude && (
                <div className="text-gray-900 bg-green-50 p-3 rounded border border-green-200">
                  <div className="font-medium text-gray-900">✅ Location Found</div>
                  <div className="text-sm mt-1 text-gray-900">
                    <div>Lat: {location.latitude.toFixed(6)}</div>
                    <div>Lng: {location.longitude.toFixed(6)}</div>
                    {location.accuracy && <div>Accuracy: ±{Math.round(location.accuracy)}m</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Permission Status</h3>
              <div
                className={`p-3 rounded border text-gray-900 ${
                  location.permissionStatus === 'granted'
                    ? 'bg-green-50 border-green-200'
                    : location.permissionStatus === 'denied'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                {location.permissionStatus === 'granted' && '✅ Permission Granted'}
                {location.permissionStatus === 'denied' && '❌ Permission Denied'}
                {location.permissionStatus === 'prompt' && '❓ Permission Required'}
                {!location.permissionStatus && '⏳ Checking permissions...'}
              </div>
            </div>
          </div>

          {mounted && !isGeolocationSupported && (
            <div className="mt-4 text-gray-900 bg-red-50 p-3 rounded border border-red-200">⚠️ Geolocation is not supported by this browser.</div>
          )}
        </div>

        {/* Main Map - Only show after location is granted (or initialCenter provided) */}
        {showMap && mapCenter ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Interactive Map with Region Selection</h2>
            <div className="mb-4 text-sm text-gray-900">
              <p>🎯 Click "Draw Region" to start selecting an area on the map</p>
              <p>
                ⌨️ <strong>Hold Ctrl + Click</strong> (Cmd + Click on Mac) to add points
              </p>
              <p>📍 Add at least 3 points to create a crop region</p>
              <p>🌾 Select the crop type when finished drawing</p>
            </div>
            <Maps
              center={mapCenter}
              zoom={defaultZoom}
              className="rounded-lg shadow-sm"
              showUserLocation={true}
              userLocation={location.latitude && location.longitude ? { lat: location.latitude, lng: location.longitude } : null}
              onRegionSelect={handleRegionSelect}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Map Access Required</h2>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Location Permission Needed</h3>
              <p className="text-gray-900 mb-6 max-w-md">
                To use the interactive map and region selection features, please grant location access by clicking "Get My Location" above.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-900">
                <p className="font-medium mb-1 text-gray-900">🔒 Privacy Note:</p>
                <p className="text-gray-900">Your location is only used to center the map and is not stored or shared.</p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Regions Summary */}
        {selectedRegions.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Selected Crop Regions ({selectedRegions.length})</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedRegions.map((region, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">🌾 {region.cropType}</h3>
                  <p className="text-sm text-gray-900">Area points: {region.points.length}</p>
                  <div className="mt-2 text-xs text-gray-900">
                    <details>
                      <summary className="cursor-pointer hover:text-gray-900">View coordinates</summary>
                      <div className="mt-1 space-y-1">
                        {region.points.map((point, idx) => (
                          <div key={idx}>Point {idx + 1}: [{point[0].toFixed(6)}, {point[1].toFixed(6)}]</div>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        {showInfoSection && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{infoTitle}</h3>
            <ul className="list-disc list-inside text-gray-900 space-y-1">
              <li>Your location data is only used to center the map</li>
              <li>No location data is stored or transmitted to external servers</li>
              <li>You can revoke location permission at any time in your browser settings</li>
              <li>Location access requires explicit user consent</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

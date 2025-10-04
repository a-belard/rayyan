'use client';

import { useEffect, useRef, useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import dynamic from 'next/dynamic';
import './Map.css';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then((mod) => mod.Polygon), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((mod) => mod.CircleMarker), { ssr: false });

interface MapsProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  showUserLocation?: boolean;
  userLocation?: { lat: number; lng: number } | null;
  onRegionSelect?: (region: { points: [number, number][]; cropType: string }) => void;
}

interface CropRegion {
  id: string;
  points: [number, number][];
  cropType: string;
  color: string;
}

export default function Maps({ 
  center = { lat: 40.7128, lng: -74.0060 }, // Default to New York City
  zoom = 10,
  className = '',
  showUserLocation = false,
  userLocation = null,
  onRegionSelect
}: MapsProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [regions, setRegions] = useState<CropRegion[]>([]);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedCropType, setSelectedCropType] = useState('');

  const cropTypes = [
    'Wheat', 'Rice', 'Corn', 'Soybeans', 'Cotton', 'Sugarcane', 
    'Potatoes', 'Tomatoes', 'Barley', 'Oats', 'Other'
  ];

  const regionColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Map click handler component - Override all click behavior when drawing
  const MapClickHandler = ({ isDrawing, onMapClick }: { isDrawing: boolean; onMapClick: (lat: number, lng: number) => void }) => {
    const map = useMapEvents({
      click: (e: any) => {
        console.log('🔥 Map clicked!', {
          isDrawing,
          ctrlKey: e.originalEvent?.ctrlKey,
          metaKey: e.originalEvent?.metaKey,
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
        
        if (isDrawing) {
          // Prevent all default map behaviors when drawing
          e.originalEvent?.preventDefault();
          e.originalEvent?.stopPropagation();
          
          // Check for modifier key (Ctrl or Cmd)
          const isModifierPressed = e.originalEvent?.ctrlKey || e.originalEvent?.metaKey;
          console.log('🎯 Modifier pressed:', isModifierPressed);
          
          if (isModifierPressed) {
            console.log('✅ Adding point via callback');
            onMapClick(e.latlng.lat, e.latlng.lng);
          } else {
            console.log('ℹ️ Hold Ctrl/Cmd while clicking to add points');
          }
          // Always return false to prevent other handlers
          return false;
        } else {
          console.log('❌ Not in drawing mode');
        }
      },
      // Override other mouse events when drawing to prevent interference
  mousedown: (e: any) => {
        if (isDrawing) {
          e.originalEvent.preventDefault();
          e.originalEvent.stopPropagation();
        }
      },
      mousemove: () => {
        const container = (map as any)?.getContainer?.();
        if (!container) return;
        if (isDrawing) {
          container.style.cursor = 'crosshair';
        } else {
          container.style.cursor = '';
        }
      },
  contextmenu: (e: any) => {
        if (isDrawing) {
          // Disable right-click context menu when drawing
          e.originalEvent.preventDefault();
          e.originalEvent.stopPropagation();
          return false;
        }
      }
    });

    // Set initial cursor when drawing mode changes
    useEffect(() => {
      const container = (map as any)?.getContainer?.();
      if (!container) return;
      if (isDrawing) {
        container.style.cursor = 'crosshair';
      } else {
        container.style.cursor = '';
      }
    }, [isDrawing, map]);

    return null;
  };

  const handleMapClick = (lat: number, lng: number) => {
    console.log('🎯 handleMapClick called with:', { lat, lng });
    const newPoint: [number, number] = [lat, lng];
    console.log('🔥 Adding new point:', newPoint);
    
    setDrawingPoints(prev => {
      const updated = [...prev, newPoint];
      console.log('📍 Updated drawing points:', updated);
      return updated;
    });
  };

  const startDrawing = () => {
    setIsDrawing(true);
    setDrawingPoints([]);
  };

  const finishDrawing = () => {
    if (drawingPoints.length >= 3) {
      setShowCropModal(true);
    } else {
      alert('Please select at least 3 points to create a region');
    }
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setDrawingPoints([]);
  };

  const handleCropTypeSubmit = () => {
    if (!selectedCropType) {
      alert('Please select a crop type');
      return;
    }

    const newRegion: CropRegion = {
      id: Date.now().toString(),
      points: [...drawingPoints],
      cropType: selectedCropType,
      color: regionColors[regions.length % regionColors.length]
    };

    setRegions(prev => [...prev, newRegion]);
    setIsDrawing(false);
    setDrawingPoints([]);
    setShowCropModal(false);
    setSelectedCropType('');

    if (onRegionSelect) {
      onRegionSelect({
        points: newRegion.points,
        cropType: newRegion.cropType
      });
    }
  };

  const deleteRegion = (regionId: string) => {
    setRegions(prev => prev.filter(region => region.id !== regionId));
  };

  // Fallback component for when Leaflet is not available
  const FallbackMap = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg relative">
      <div className="text-center">
        <div className="text-4xl mb-4">🗺️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Map Loading...</h3>
        <p className="text-gray-900 mb-2">
          Center: {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
        </p>
        <p className="text-gray-900 mb-4">Zoom Level: {zoom}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <p className="text-gray-900 font-medium mb-1">📦 Installation Required:</p>
          <p className="text-gray-900">Run: <code className="bg-blue-100 px-1 rounded">pnpm add leaflet react-leaflet @types/leaflet</code></p>
        </div>
      </div>
      {showUserLocation && userLocation && (
        <div className="absolute top-3 right-3 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
      )}
    </div>
  );

  // Try to render the actual map, fallback to placeholder if dependencies not available
  const renderMap = () => {
    if (!isClient) {
      return <FallbackMap />;
    }

    try {
      return (
        <div className="relative">
          <MapContainer
            center={[center.lat, center.lng]}
            zoom={zoom}
            style={{ height: '400px', width: '100%' }}
            className="rounded-lg"
            dragging={!isDrawing}
            touchZoom={!isDrawing}
            doubleClickZoom={!isDrawing}
            scrollWheelZoom={!isDrawing}
            boxZoom={!isDrawing}
            keyboard={!isDrawing}
          >
            <MapClickHandler isDrawing={isDrawing} onMapClick={handleMapClick} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* User location marker */}
              {showUserLocation && userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                  <div className="text-center text-gray-900">
                    <strong>📍 Your Location</strong>
                    <br />
                    Lat: {userLocation.lat.toFixed(6)}
                    <br />
                    Lng: {userLocation.lng.toFixed(6)}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Drawing points */}
            {drawingPoints.map((point, index) => (
              <CircleMarker 
                key={index} 
                center={point}
                radius={8}
                pathOptions={{
                  color: '#ff6b6b',
                  fillColor: '#ff6b6b',
                  fillOpacity: 0.8,
                  weight: 2
                }}
              >
                <Popup>
                  <span className="text-gray-900">Point {index + 1}</span>
                </Popup>
              </CircleMarker>
            ))}

            {/* Current drawing polygon */}
            {drawingPoints.length >= 3 && (
              <Polygon 
                positions={drawingPoints}
                pathOptions={{ 
                  color: '#ff6b6b', 
                  fillColor: '#ff6b6b', 
                  fillOpacity: 0.2,
                  dashArray: '5, 5'
                }}
              />
            )}

            {/* Completed regions */}
            {regions.map((region) => (
              <Polygon
                key={region.id}
                positions={region.points}
                pathOptions={{
                  color: region.color,
                  fillColor: region.color,
                  fillOpacity: 0.3
                }}
              >
                <Popup>
                  <div className="text-center text-gray-900">
                    <strong>{region.cropType}</strong>
                    <br />
                    <button
                      onClick={() => deleteRegion(region.id)}
                      className="mt-2 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                    >
                      Delete Region
                    </button>
                  </div>
                </Popup>
              </Polygon>
            ))}
          </MapContainer>

          {/* Drawing controls */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] min-w-[200px]">
            <div className="mb-2 p-2 bg-gray-50 border rounded text-xs">
              <strong>🐛 Debug Info:</strong><br/>
              Drawing Mode: {isDrawing ? '✅ ON' : '❌ OFF'}<br/>
              Points: {drawingPoints.length}<br/>
              Regions: {regions.length}
            </div>
            {!isDrawing ? (
              <div>
                <button
                  onClick={startDrawing}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full mb-2"
                >
                  🎯 Draw Region
                </button>
                <p className="text-xs text-gray-900">Click to start drawing a crop region</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                  <div className="text-sm font-medium text-gray-900 mb-1">🎯 Drawing Mode Active</div>
                  <div className="text-xs text-gray-900 mb-1">
                    <strong>Hold Ctrl + Click</strong> on the map to add points
                  </div>
                  <div className="text-xs text-gray-900 bg-orange-50 border border-orange-200 rounded px-2 py-1 mb-2">
                    ⌨️ Windows/Linux: Ctrl + Click | Mac: Cmd + Click
                  </div>
                  <div className="text-sm text-gray-900">
                    Points: <span className="font-bold text-gray-900">{drawingPoints.length}</span> (min 3 required)
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={finishDrawing}
                    disabled={drawingPoints.length < 3}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex-1"
                  >
                    ✅ Finish
                  </button>
                  <button
                    onClick={cancelDrawing}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex-1"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Regions list */}
          {regions.length > 0 && (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-xs z-[1000]">
              <h4 className="font-semibold text-gray-900 mb-2">Selected Regions</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {regions.map((region) => (
                  <div key={region.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: region.color }}
                      ></div>
                      <span className="text-sm">{region.cropType}</span>
                    </div>
                    <button
                      onClick={() => deleteRegion(region.id)}
                      className="text-gray-900 hover:text-gray-700 text-xs"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.log('Map libraries not available, showing fallback');
      return <FallbackMap />;
    }
  };

  return (
    <div className={`w-full ${className}`} style={{ minHeight: '400px' }}>
      {renderMap()}
      
      {/* Crop Type Selection Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Select Crop Type</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {cropTypes.map((crop) => (
                <label key={crop} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cropType"
                    value={crop}
                    checked={selectedCropType === crop}
                    onChange={(e) => setSelectedCropType(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">{crop}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCropModal(false);
                  cancelDrawing();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCropTypeSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
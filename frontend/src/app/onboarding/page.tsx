"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sprout,
  MapPin,
  Check,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Map,
  Trash2,
} from "lucide-react";
import Maps from "@/components/Maps";
import api from "@/lib/api";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  permissionStatus: string | null;
}

interface CropRegion {
  id: string;
  points: [number, number][];
  cropType: string;
  color: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form data
  const [farmName, setFarmName] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [soilType, setSoilType] = useState("");
  const [irrigationType, setIrrigationType] = useState("");

  // Location state
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: false,
    error: null,
    permissionStatus: null,
  });

  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<CropRegion[]>([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check geolocation support only after mounting
  const isGeolocationSupported =
    mounted && typeof navigator !== "undefined" && "geolocation" in navigator;

  // Request location permission and get current position
  const requestLocation = () => {
    if (!isGeolocationSupported) {
      setLocation((prev) => ({
        ...prev,
        error: "Geolocation is not supported by this browser.",
      }));
      return;
    }

    setLocation((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
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
          permissionStatus: "granted",
        });
        setMapCenter({ lat: latitude, lng: longitude });
        setShowMap(true);
      },
      (error) => {
        let errorMessage = "Failed to get location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          permissionStatus: "denied",
        }));
      },
      options
    );
  };

  // Handle region selection from the map
  const handleRegionSelect = (region: {
    points: [number, number][];
    cropType: string;
  }) => {
    const newRegion: CropRegion = {
      id: Date.now().toString(),
      points: region.points,
      cropType: region.cropType,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random color
    };
    setSelectedRegions((prev) => [...prev, newRegion]);
  };

  const handleSubmit = async () => {
    if (!farmName.trim()) {
      alert("Please enter a farm name");
      return;
    }

    if (!location.latitude || !location.longitude) {
      alert("Please enable location services to set your farm location");
      return;
    }

    if (selectedRegions.length === 0) {
      alert("Please select at least one crop region on the map");
      return;
    }

    setSaving(true);
    try {
      // Prepare zones data
      const zones = selectedRegions.map((region) => ({
        id: region.id,
        name: region.cropType,
        crop: region.cropType,
        points: region.points,
        color: region.color,
      }));

      // Extract unique crop types
      const crops = [...new Set(selectedRegions.map((r) => r.cropType))];

      // Create farm
      await api.createFarm({
        name: farmName,
        location: `${location.latitude}, ${location.longitude}`,
        latitude: location.latitude,
        longitude: location.longitude,
        size_hectares: farmSize ? parseFloat(farmSize) : undefined,
        soil_type: soilType || undefined,
        irrigation_type: irrigationType || undefined,
        crops,
        zones,
        metadata: {
          onboarding_completed: true,
          onboarding_date: new Date().toISOString(),
        },
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Failed to save farm:", error);
      alert(
        error.response?.data?.detail ||
          "Failed to save farm configuration. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (
      confirm(
        "Are you sure you want to skip farm setup? You can configure it later from the dashboard."
      )
    ) {
      router.push("/dashboard");
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-900">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Sprout className="w-10 h-10 text-green-600" />
            Welcome to Rayyan
          </h1>
          <p className="text-lg text-gray-700">
            Let's get your farm set up in just 2 simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center ${
                currentStep >= 1 ? "text-green-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? "bg-green-600 text-white" : "bg-gray-300"
                }`}
              >
                {currentStep > 1 ? "✓" : "1"}
              </div>
              <span className="ml-2 font-medium">Farm Details</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div
              className={`flex items-center ${
                currentStep >= 2 ? "text-green-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? "bg-green-600 text-white" : "bg-gray-300"
                }`}
              >
                {currentStep > 2 ? "✓" : "2"}
              </div>
              <span className="ml-2 font-medium">Your Fields</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Basic Farm Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Tell us about your farm
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farm Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g., Green Valley Farm"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm Size (hectares)
                  </label>
                  <input
                    type="number"
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    placeholder="e.g., 50"
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soil Type
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select soil type</option>
                    <option value="clay">Clay</option>
                    <option value="sandy">Sandy</option>
                    <option value="loamy">Loamy</option>
                    <option value="silty">Silty</option>
                    <option value="peaty">Peaty</option>
                    <option value="chalky">Chalky</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Irrigation Type
                </label>
                <select
                  value={irrigationType}
                  onChange={(e) => setIrrigationType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select irrigation type</option>
                  <option value="drip">Drip Irrigation</option>
                  <option value="sprinkler">Sprinkler</option>
                  <option value="flood">Flood Irrigation</option>
                  <option value="center-pivot">Center Pivot</option>
                  <option value="manual">Manual</option>
                  <option value="rainfed">Rainfed</option>
                </select>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                >
                  I'll do this later
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!farmName.trim()}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Map Regions */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Map className="w-6 h-6 text-blue-600" />
                    Map Your Fields
                  </h2>
                  <p className="text-gray-600">
                    Draw your crop areas on the map
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ← Back
                </button>
              </div>

              {/* Location Controls */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      Find Your Location
                    </h3>
                    <p className="text-sm text-gray-700">
                      This helps us show your farm on the map
                    </p>
                  </div>
                  <button
                    onClick={requestLocation}
                    disabled={location.loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {location.loading
                      ? "Finding..."
                      : location.latitude
                      ? "Update"
                      : "Use My Location"}
                  </button>
                </div>

                {location.error && (
                  <div className="text-sm text-red-700 bg-red-50 p-2 rounded border border-red-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {location.error}
                  </div>
                )}

                {location.latitude && location.longitude && (
                  <div className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    Location found! Map is now centered on your farm
                  </div>
                )}
              </div>

              {/* Map */}
              {showMap && mapCenter ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="mb-3 text-sm text-gray-700 bg-white p-3 rounded border">
                    <p className="mb-2 font-semibold">Quick Guide:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>
                        Click the{" "}
                        <span className="font-medium">"Draw Region"</span>{" "}
                        button below
                      </li>
                      <li>
                        Hold{" "}
                        <kbd className="bg-gray-200 px-2 py-0.5 rounded font-mono">
                          Ctrl
                        </kbd>{" "}
                        (or{" "}
                        <kbd className="bg-gray-200 px-2 py-0.5 rounded font-mono">
                          Cmd
                        </kbd>{" "}
                        on Mac) and click on the map to mark your field
                        boundaries
                      </li>
                      <li>
                        Click <span className="font-medium">"Finish"</span> and
                        choose your crop type
                      </li>
                      <li>Add more fields if you have different crops</li>
                    </ol>
                  </div>
                  <Maps
                    center={mapCenter}
                    zoom={15}
                    className="rounded-lg shadow-sm"
                    showUserLocation={true}
                    userLocation={
                      location.latitude && location.longitude
                        ? { lat: location.latitude, lng: location.longitude }
                        : null
                    }
                    onRegionSelect={handleRegionSelect}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
                  <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Let's find your farm
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Click "Use My Location" above to show the map
                  </p>
                </div>
              )}

              {/* Selected Regions Summary */}
              {selectedRegions.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Your Fields ({selectedRegions.length})
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedRegions.map((region, index) => (
                      <div
                        key={region.id}
                        className="bg-white p-3 rounded-lg border flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: region.color }}
                          ></div>
                          <span className="text-sm font-medium flex items-center gap-1">
                            <Sprout className="w-4 h-4 text-green-600" />
                            {region.cropType}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setSelectedRegions((prev) =>
                              prev.filter((r) => r.id !== region.id)
                            )
                          }
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                >
                  I'll do this later
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving || selectedRegions.length === 0}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Complete Setup
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

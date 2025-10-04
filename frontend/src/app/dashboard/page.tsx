"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Droplets,
  Thermometer,
  Wind,
  Sun,
  AlertCircle,
  TrendingUp,
  Leaf,
  Users,
  CheckCircle,
  SmilePlus,
  Meh,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Map,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";
import {
  farmsApi,
  sensorsApi,
  alertsApi,
  recommendationsApi,
  type Farm,
  type FarmZone,
  type SensorReading,
  type ZoneAlert,
  type ZoneRecommendation,
} from "@/lib/api";

// Define the type for field data structure
interface FieldData {
  id: string;
  name: string;
  crop: string;
  cropAge: number; // Age in days
  health: "good" | "warning" | "critical";
  healthIcon: React.ReactNode;
  lastUpdate: string;
  sensors: {
    soilMoisture: number | null;
    temperature: number | null;
    humidity: number | null;
    ph: number | null;
  };
  alerts: Array<{
    id: string;
    type: "info" | "warning" | "critical";
    message: string;
    priority: number;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>;
}

/**
 * Dashboard Page Component
 *
 * Provides field-specific data insights for farmers managing multiple fields.
 * Features include:
 * - Field selection interface
 * - Real-time sensor data visualization from backend API
 * - Health status indicators with emoji-based visual feedback
 * - Priority-based alerts and recommendations from backend
 * - Responsive design for mobile and desktop usage
 */
export default function Dashboard() {
  // State management
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");
  const [fieldsData, setFieldsData] = useState<FieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation();

  // Check authentication and fetch data on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/login");
      return;
    }

    fetchDashboardData();
  }, [router]);

  /**
   * Fetch all dashboard data from API
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all farms for the user
      const farms = await farmsApi.list();

      if (!farms || farms.length === 0) {
        setError("No farms found. Please create a farm first.");
        setLoading(false);
        return;
      }

      // Get the first farm (or allow user to select)
      const farm = farms[0];
      const zones = farm.zones || [];

      if (zones.length === 0) {
        setError(
          "No zones found for this farm. Please add zones to your farm."
        );
        setLoading(false);
        return;
      }

      // Fetch data for each zone in parallel
      const fieldsPromises = zones.map(async (zone: FarmZone) => {
        try {
          // Fetch latest sensor reading
          const latestSensor = await sensorsApi.getLatest(zone.id);

          // Fetch active alerts
          const alerts = await alertsApi.getByZone(zone.id, false);

          // Fetch active recommendations
          const recommendations = await recommendationsApi.getByZone(
            zone.id,
            true
          );

          // Calculate crop age from planting date
          const cropAge = zone.planting_date
            ? Math.floor(
                (new Date().getTime() -
                  new Date(zone.planting_date).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0;

          // Determine health status based on sensors and alerts
          const health = determineZoneHealth(latestSensor, alerts);
          const healthIcon = getHealthIcon(health);

          return {
            id: zone.id,
            name: zone.name || "Unnamed Zone",
            crop: zone.crop || "Unknown Crop",
            cropAge,
            health,
            healthIcon,
            lastUpdate: latestSensor
              ? formatLastUpdate(latestSensor.reading_timestamp)
              : "No data",
            sensors: {
              soilMoisture: latestSensor?.soil_moisture || null,
              temperature: latestSensor?.temperature || null,
              humidity: latestSensor?.humidity || null,
              ph: latestSensor?.soil_ph || null,
            },
            alerts: alerts.map((alert: ZoneAlert) => ({
              id: alert.id,
              type: alert.alert_type,
              message: alert.message,
              priority: alert.priority,
            })),
            recommendations: recommendations.map((rec: ZoneRecommendation) => ({
              id: rec.id,
              title: rec.title,
              description: rec.description,
              priority: rec.priority,
            })),
          };
        } catch (error) {
          console.error(`Error fetching data for zone ${zone.id}:`, error);
          // Return zone with default/error data
          return {
            id: zone.id,
            name: zone.name || "Unnamed Zone",
            crop: zone.crop || "Unknown Crop",
            cropAge: 0,
            health: "warning" as const,
            healthIcon: <Meh className="w-8 h-8 text-yellow-600" />,
            lastUpdate: "Data unavailable",
            sensors: {
              soilMoisture: null,
              temperature: null,
              humidity: null,
              ph: null,
            },
            alerts: [],
            recommendations: [],
          };
        }
      });

      const fields = await Promise.all(fieldsPromises);
      setFieldsData(fields);

      // Set first field as selected if none selected
      if (!selectedFieldId && fields.length > 0) {
        setSelectedFieldId(fields[0].id);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Determine zone health based on sensor data and alerts
   */
  const determineZoneHealth = (
    sensor: SensorReading | null,
    alerts: ZoneAlert[]
  ): "good" | "warning" | "critical" => {
    // Critical if any critical alerts
    if (alerts.some((a) => a.alert_type === "critical")) {
      return "critical";
    }

    // Warning if any warning alerts
    if (alerts.some((a) => a.alert_type === "warning")) {
      return "warning";
    }

    // Check sensor values if available
    if (sensor) {
      const { soil_moisture, temperature, soil_ph } = sensor;

      // Critical conditions
      if (soil_moisture !== null && soil_moisture < 30) return "critical";
      if (temperature !== null && (temperature < 10 || temperature > 35))
        return "critical";
      if (soil_ph !== null && (soil_ph < 5.0 || soil_ph > 8.5))
        return "critical";

      // Warning conditions
      if (soil_moisture !== null && soil_moisture < 50) return "warning";
      if (temperature !== null && (temperature < 15 || temperature > 30))
        return "warning";
      if (soil_ph !== null && (soil_ph < 5.5 || soil_ph > 8.0))
        return "warning";
    }

    return "good";
  };

  /**
   * Get health icon based on status
   */
  const getHealthIcon = (health: "good" | "warning" | "critical") => {
    switch (health) {
      case "good":
        return <SmilePlus className="w-8 h-8 text-green-600" />;
      case "warning":
        return <Meh className="w-8 h-8 text-yellow-600" />;
      case "critical":
        return <AlertTriangle className="w-8 h-8 text-red-600" />;
    }
  };

  /**
   * Format last update timestamp
   */
  const formatLastUpdate = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  // Get current field data based on selection
  const currentField =
    fieldsData.find((field) => field.id === selectedFieldId) || fieldsData[0];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Load Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show no data state
  if (fieldsData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Zones Found
          </h2>
          <p className="text-gray-600 mb-4">
            Please add zones to your farm to start monitoring.
          </p>
          <Link
            href="/farm-dashboard"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Farm Dashboard
          </Link>
        </div>
      </div>
    );
  }

  /**
   * Renders sensor data cards with icons and values
   */
  const renderSensorCard = (
    icon: React.ReactNode,
    label: string,
    value: string | number | null,
    unit: string,
    status: "good" | "warning" | "critical"
  ) => {
    const statusColors = {
      good: "border-green-200 bg-green-50",
      warning: "border-yellow-200 bg-yellow-50",
      critical: "border-red-200 bg-red-50",
    };

    // Handle null/undefined values
    const displayValue = value !== null && value !== undefined ? value : "--";

    return (
      <div className={`p-4 rounded-lg border-2 ${statusColors[status]}`}>
        <div className="flex items-center gap-3">
          <div className="text-blue-600">{icon}</div>
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-xl font-semibold">
              {displayValue}
              {displayValue !== "--" ? unit : ""}
            </p>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Determines sensor status based on crop type and values
   */
  const getSensorStatus = (
    sensor: string,
    value: number | null,
    crop: string
  ): "good" | "warning" | "critical" => {
    // Handle null values
    if (value === null || value === undefined) return "warning";

    // Simplified logic - in real app, this would be more sophisticated
    switch (sensor) {
      case "moisture":
        if (value > 60) return "good";
        if (value > 30) return "warning";
        return "critical";
      case "temperature":
        if (value >= 20 && value <= 28) return "good";
        if (value >= 15 && value <= 35) return "warning";
        return "critical";
      case "humidity":
        if (value >= 50 && value <= 70) return "good";
        if (value >= 30 && value <= 80) return "warning";
        return "critical";
      case "ph":
        if (value >= 6.0 && value <= 7.5) return "good";
        if (value >= 5.5 && value <= 8.0) return "warning";
        return "critical";
      case "age":
        // Crop age status based on typical growth cycles
        if (crop === "Tomatoes") {
          if (value >= 60 && value <= 120) return "good";
          if (value >= 30 && value <= 150) return "warning";
        } else if (crop === "Corn") {
          if (value >= 30 && value <= 90) return "good";
          if (value >= 15 && value <= 120) return "warning";
        } else if (crop === "Lettuce") {
          if (value >= 20 && value <= 60) return "good";
          if (value >= 10 && value <= 80) return "warning";
        }
        return "critical";
      default:
        return "good";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Top row - Main navigation and controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/farm-dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t("dashboard.title")}
                </h1>
                <p className="text-gray-600">{t("dashboard.subtitle")}</p>
              </div>
            </div>

            {/* Language selector and field selector */}
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  {t("dashboard.selectField")}:
                </label>
                <select
                  value={selectedFieldId}
                  onChange={(e) => setSelectedFieldId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {fieldsData.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name} - {field.crop}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Welcome section - text only (map moved near yield) */}
          <div className="bg-green-50 rounded-lg p-4 md:p-5">
            <p className="text-lg font-semibold text-gray-900">
              Welcome back, Farmer! 👋
            </p>
            <p className="text-sm text-gray-600">
              Monitor your fields and explore insights tailored for this week.
            </p>
          </div>
        </div>
      </div>

      {/* Main dashboard content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Fields</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <div className="text-green-600">
                <Leaf size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <div className="text-blue-600">
                <Users size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="text-purple-600">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week's Yield</p>
                <p className="text-2xl font-bold text-gray-900">2.4T</p>
              </div>
              <div className="text-orange-600">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Map - full width */}
        <div className="mb-6">
          <Link href="/dashboard/map" className="block group">
            <div className="relative h-56 md:h-64 w-full overflow-hidden rounded-xl border bg-gradient-to-br from-green-100 via-blue-50 to-green-100 shadow-sm">
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-3">
                <div className="col-span-2 row-span-2 m-1 rounded bg-green-300/70"></div>
                <div className="col-span-2 m-1 rounded bg-emerald-300/70"></div>
                <div className="col-span-2 m-1 rounded bg-lime-300/70"></div>
                <div className="col-span-3 m-1 rounded bg-teal-300/70"></div>
                <div className="col-span-3 m-1 rounded bg-green-400/70"></div>
              </div>
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 px-2 py-1 rounded shadow">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="text-xs font-medium text-gray-700">
                  North Field
                </span>
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 px-2 py-1 rounded shadow">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="text-xs font-medium text-gray-700">
                  South Field
                </span>
              </div>
              <div className="absolute inset-0 flex items-end justify-end p-3">
                <span className="inline-flex items-center gap-2 bg-green-600 text-white text-xs md:text-sm font-semibold px-3 py-2 rounded-lg shadow group-hover:bg-green-700 transition-colors">
                  <Map className="w-4 h-4" /> Open Map
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Field overview card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full">
                {currentField.healthIcon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentField.name}
                </h2>
                <p className="text-gray-600">
                  {t("dashboard.growing")} {currentField.crop}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Calendar size={16} className="text-green-600" />
                  <span className="text-sm text-gray-600 font-medium">
                    Crop Age: {currentField.cropAge} days
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {t("dashboard.lastUpdated")}
              </p>
              <p className="text-sm font-medium">{currentField.lastUpdate}</p>
            </div>
          </div>

          {/* Health status indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                currentField.health === "good"
                  ? "bg-green-500"
                  : currentField.health === "warning"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm font-medium capitalize">
              {t(`dashboard.healthStatus.${currentField.health}`)}
            </span>
          </div>
        </div>

        {/* Sensor data grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {renderSensorCard(
            <Droplets size={24} />,
            t("dashboard.sensors.soilMoisture"),
            currentField.sensors.soilMoisture,
            "%",
            getSensorStatus(
              "moisture",
              currentField.sensors.soilMoisture,
              currentField.crop
            )
          )}
          {renderSensorCard(
            <Thermometer size={24} />,
            t("dashboard.sensors.temperature"),
            currentField.sensors.temperature,
            "°C",
            getSensorStatus(
              "temperature",
              currentField.sensors.temperature,
              currentField.crop
            )
          )}
          {renderSensorCard(
            <Wind size={24} />,
            t("dashboard.sensors.humidity"),
            currentField.sensors.humidity,
            "%",
            getSensorStatus(
              "humidity",
              currentField.sensors.humidity,
              currentField.crop
            )
          )}
          {renderSensorCard(
            <Leaf size={24} />,
            t("dashboard.sensors.soilPh"),
            currentField.sensors.ph,
            "",
            getSensorStatus("ph", currentField.sensors.ph, currentField.crop)
          )}
          {renderSensorCard(
            <Calendar size={24} />,
            t("dashboard.sensors.cropAge"),
            currentField.cropAge,
            " days",
            getSensorStatus("age", currentField.cropAge, currentField.crop)
          )}
        </div>

        {/* Alerts and recommendations grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active alerts */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-yellow-600" />
              {t("dashboard.alerts.title")}
            </h3>
            <div className="space-y-3">
              {currentField.alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle
                    size={48}
                    className="mx-auto mb-2 text-green-500"
                  />
                  <p>No active alerts</p>
                  <p className="text-sm mt-1">All systems operating normally</p>
                </div>
              ) : (
                currentField.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.type === "critical"
                        ? "border-red-500 bg-red-50"
                        : alert.type === "warning"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-blue-500 bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          alert.type === "critical"
                            ? "bg-red-100 text-red-800"
                            : alert.type === "warning"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {alert.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI recommendations */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-green-600" />
              {t("dashboard.recommendations.title")}
            </h3>
            <div className="space-y-4">
              {currentField.recommendations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Leaf size={48} className="mx-auto mb-2 text-gray-400" />
                  <p>No recommendations available</p>
                  <p className="text-sm mt-1">
                    Check back later for AI insights
                  </p>
                </div>
              ) : (
                currentField.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-lg bg-gray-50 border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          rec.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : rec.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {rec.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Navigation to team management and task tracking */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link href="/team" className="block">
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Users size={24} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">
                  {t("dashboard.navigation.teamManagement")}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                {t("dashboard.navigation.teamDescription")}
              </p>
            </div>
          </Link>

          <Link href="/tasks" className="block">
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle size={24} className="text-green-600" />
                <h3 className="font-semibold text-gray-900">
                  {t("dashboard.navigation.taskAssignment")}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                {t("dashboard.navigation.taskDescription")}
              </p>
            </div>
          </Link>

          <Link href="/tracker" className="block">
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={24} className="text-purple-600" />
                <h3 className="font-semibold text-gray-900">
                  {t("dashboard.navigation.taskTracker")}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                {t("dashboard.navigation.trackerDescription")}
              </p>
            </div>
          </Link>

          <button className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left">
            <div className="flex items-center gap-3 mb-2">
              <Sun size={24} className="text-yellow-600" />
              <h3 className="font-semibold text-gray-900">
                {t("dashboard.navigation.startIrrigation")}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {t("dashboard.navigation.irrigationDescription")}
            </p>
          </button>

          <Link
            href="/dashboard/map"
            className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <Map size={24} className="text-indigo-600" />
              <h3 className="font-semibold text-gray-900">See Map</h3>
            </div>
            <p className="text-sm text-gray-600">
              View field locations and geographical layout
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

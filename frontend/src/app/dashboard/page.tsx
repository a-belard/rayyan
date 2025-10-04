'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Droplets, Thermometer, Wind, Sun, AlertCircle, TrendingUp, Leaf, Users, CheckCircle, SmilePlus, Meh, AlertTriangle, Calendar, Map, MapPin, Layers, Satellite } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';

// Define the type for field data structure
interface FieldData {
  id: string;
  name: string;
  crop: string;
  cropAge: number; // Age in days
  health: 'good' | 'warning' | 'critical';
  healthIcon: React.ReactNode;
  lastUpdate: string;
  sensors: {
    soilMoisture: number;
    temperature: number;
    humidity: number;
    ph: number;
  };
  alerts: Array<{
    type: 'info' | 'warning' | 'critical';
    message: string;
    priority: number;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

// Sample field data with realistic agricultural metrics
const fieldsData: FieldData[] = [
  {
    id: 'field1',
    name: 'North Field',
    crop: 'Tomatoes',
    cropAge: 85, // 85 days old
    health: 'good',
    healthIcon: <SmilePlus className="w-8 h-8 text-green-600" />,
    lastUpdate: '2 minutes ago',
    sensors: {
      soilMoisture: 78,
      temperature: 24,
      humidity: 65,
      ph: 6.8
    },
    alerts: [
      { type: 'info', message: 'Optimal growing conditions detected', priority: 1 },
      { type: 'warning', message: 'Consider pruning for better air circulation', priority: 2 }
    ],
    recommendations: [
      {
        title: 'Maintain Current Irrigation',
        description: 'Soil moisture levels are optimal. Continue current watering schedule.',
        priority: 'high'
      },
      {
        title: 'Monitor for Pests',
        description: 'Warm, humid conditions favor pest development. Inspect regularly.',
        priority: 'medium'
      }
    ]
  },
  {
    id: 'field2',
    name: 'South Field',
    crop: 'Corn',
    cropAge: 42, // 42 days old
    health: 'warning',
    healthIcon: <Meh className="w-8 h-8 text-yellow-600" />,
    lastUpdate: '5 minutes ago',
    sensors: {
      soilMoisture: 45,
      temperature: 28,
      humidity: 40,
      ph: 7.2
    },
    alerts: [
      { type: 'warning', message: 'Low soil moisture detected', priority: 1 },
      { type: 'info', message: 'Temperature within acceptable range', priority: 2 }
    ],
    recommendations: [
      {
        title: 'Increase Irrigation',
        description: 'Soil moisture is below optimal. Increase watering frequency.',
        priority: 'high'
      },
      {
        title: 'Check Irrigation System',
        description: 'Verify all sprinklers are functioning properly in this zone.',
        priority: 'high'
      }
    ]
  },
  {
    id: 'field3',
    name: 'East Field',
    crop: 'Lettuce',
    cropAge: 28, // 28 days old
    health: 'critical',
    healthIcon: <AlertTriangle className="w-8 h-8 text-red-600" />,
    lastUpdate: '1 minute ago',
    sensors: {
      soilMoisture: 25,
      temperature: 32,
      humidity: 30,
      ph: 8.1
    },
    alerts: [
      { type: 'critical', message: 'Critical soil moisture - immediate action required', priority: 1 },
      { type: 'warning', message: 'High temperature stress', priority: 2 },
      { type: 'warning', message: 'pH levels too high', priority: 3 }
    ],
    recommendations: [
      {
        title: 'Emergency Irrigation',
        description: 'Immediately increase watering. Consider shade cloth installation.',
        priority: 'high'
      },
      {
        title: 'pH Adjustment',
        description: 'Apply sulfur or organic matter to lower soil pH to 6.0-7.0 range.',
        priority: 'high'
      },
      {
        title: 'Heat Stress Management',
        description: 'Install temporary shade structures and increase misting frequency.',
        priority: 'medium'
      }
    ]
  }
];

/**
 * Dashboard Page Component
 * 
 * Provides field-specific data insights for farmers managing multiple fields.
 * Features include:
 * - Field selection interface
 * - Real-time sensor data visualization
 * - Health status indicators with emoji-based visual feedback
 * - Priority-based alerts and recommendations
 * - Responsive design for mobile and desktop usage
 */
export default function Dashboard() {
  // State to track currently selected field
  const [selectedFieldId, setSelectedFieldId] = useState<string>(fieldsData[0].id);
  const router = useRouter();
  const { t } = useTranslation();

  // Check authentication on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      router.push('/login');
      return;
    }
  }, [router]);
  
  // Get current field data based on selection
  const currentField = fieldsData.find(field => field.id === selectedFieldId) || fieldsData[0];

  /**
   * Renders sensor data cards with icons and values
   */
  const renderSensorCard = (icon: React.ReactNode, label: string, value: string | number, unit: string, status: 'good' | 'warning' | 'critical') => {
    const statusColors = {
      good: 'border-green-200 bg-green-50',
      warning: 'border-yellow-200 bg-yellow-50',
      critical: 'border-red-200 bg-red-50'
    };

    return (
      <div className={`p-4 rounded-lg border-2 ${statusColors[status]}`}>
        <div className="flex items-center gap-3">
          <div className="text-blue-600">
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-xl font-semibold">{value}{unit}</p>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Determines sensor status based on crop type and values
   */
  const getSensorStatus = (sensor: string, value: number, crop: string): 'good' | 'warning' | 'critical' => {
    // Simplified logic - in real app, this would be more sophisticated
    switch (sensor) {
      case 'moisture':
        if (value > 60) return 'good';
        if (value > 30) return 'warning';
        return 'critical';
      case 'temperature':
        if (value >= 20 && value <= 28) return 'good';
        if (value >= 15 && value <= 35) return 'warning';
        return 'critical';
      case 'humidity':
        if (value >= 50 && value <= 70) return 'good';
        if (value >= 30 && value <= 80) return 'warning';
        return 'critical';
      case 'ph':
        if (value >= 6.0 && value <= 7.5) return 'good';
        if (value >= 5.5 && value <= 8.0) return 'warning';
        return 'critical';
      case 'age':
        // Crop age status based on typical growth cycles
        if (crop === 'Tomatoes') {
          if (value >= 60 && value <= 120) return 'good';
          if (value >= 30 && value <= 150) return 'warning';
        } else if (crop === 'Corn') {
          if (value >= 30 && value <= 90) return 'good';
          if (value >= 15 && value <= 120) return 'warning';
        } else if (crop === 'Lettuce') {
          if (value >= 20 && value <= 60) return 'good';
          if (value >= 10 && value <= 80) return 'warning';
        }
        return 'critical';
      default:
        return 'good';
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
              <Link href="/farm-dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
                <p className="text-gray-600">{t('dashboard.subtitle')}</p>
              </div>
            </div>
            
            {/* Language selector and field selector */}
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">{t('dashboard.selectField')}:</label>
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
            <p className="text-lg font-semibold text-gray-900">Welcome back, Farmer! 👋</p>
            <p className="text-sm text-gray-600">Monitor your fields and explore insights tailored for this week.</p>
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
                <span className="text-xs font-medium text-gray-700">North Field</span>
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 px-2 py-1 rounded shadow">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="text-xs font-medium text-gray-700">South Field</span>
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
              <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full">{currentField.healthIcon}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentField.name}</h2>
                <p className="text-gray-600">{t('dashboard.growing')} {currentField.crop}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Calendar size={16} className="text-green-600" />
                  <span className="text-sm text-gray-600 font-medium">
                    Crop Age: {currentField.cropAge} days
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{t('dashboard.lastUpdated')}</p>
              <p className="text-sm font-medium">{currentField.lastUpdate}</p>
            </div>
          </div>
          
          {/* Health status indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              currentField.health === 'good' ? 'bg-green-500' : 
              currentField.health === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium capitalize">{t(`dashboard.healthStatus.${currentField.health}`)}</span>
          </div>
        </div>

        {/* Sensor data grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {renderSensorCard(
            <Droplets size={24} />,
            t('dashboard.sensors.soilMoisture'),
            currentField.sensors.soilMoisture,
            "%",
            getSensorStatus('moisture', currentField.sensors.soilMoisture, currentField.crop)
          )}
          {renderSensorCard(
            <Thermometer size={24} />,
            t('dashboard.sensors.temperature'),
            currentField.sensors.temperature,
            "°C",
            getSensorStatus('temperature', currentField.sensors.temperature, currentField.crop)
          )}
          {renderSensorCard(
            <Wind size={24} />,
            t('dashboard.sensors.humidity'),
            currentField.sensors.humidity,
            "%",
            getSensorStatus('humidity', currentField.sensors.humidity, currentField.crop)
          )}
          {renderSensorCard(
            <Leaf size={24} />,
            t('dashboard.sensors.soilPh'),
            currentField.sensors.ph,
            "",
            getSensorStatus('ph', currentField.sensors.ph, currentField.crop)
          )}
          {renderSensorCard(
            <Calendar size={24} />,
            t('dashboard.sensors.cropAge'),
            currentField.cropAge,
            " days",
            getSensorStatus('age', currentField.cropAge, currentField.crop)
          )}
        </div>

        {/* Alerts and recommendations grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active alerts */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-yellow-600" />
              {t('dashboard.alerts.title')}
            </h3>
            <div className="space-y-3">
              {currentField.alerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'critical' ? 'border-red-500 bg-red-50' :
                  alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI recommendations */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-green-600" />
              {t('dashboard.recommendations.title')}
            </h3>
            <div className="space-y-4">
              {currentField.recommendations.map((rec, index) => (
                <div key={index} className="p-4 rounded-lg bg-gray-50 border">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {rec.priority} priority
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation to team management and task tracking */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link href="/team" className="block">
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Users size={24} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">{t('dashboard.navigation.teamManagement')}</h3>
              </div>
              <p className="text-sm text-gray-600">{t('dashboard.navigation.teamDescription')}</p>
            </div>
          </Link>
          
          <Link href="/tasks" className="block">
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle size={24} className="text-green-600" />
                <h3 className="font-semibold text-gray-900">{t('dashboard.navigation.taskAssignment')}</h3>
              </div>
              <p className="text-sm text-gray-600">{t('dashboard.navigation.taskDescription')}</p>
            </div>
          </Link>
          
          <Link href="/tracker" className="block">
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={24} className="text-purple-600" />
                <h3 className="font-semibold text-gray-900">{t('dashboard.navigation.taskTracker')}</h3>
              </div>
              <p className="text-sm text-gray-600">{t('dashboard.navigation.trackerDescription')}</p>
            </div>
          </Link>
          
          <button className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left">
            <div className="flex items-center gap-3 mb-2">
              <Sun size={24} className="text-yellow-600" />
              <h3 className="font-semibold text-gray-900">{t('dashboard.navigation.startIrrigation')}</h3>
            </div>
            <p className="text-sm text-gray-600">{t('dashboard.navigation.irrigationDescription')}</p>
          </button>
          
          <Link href="/dashboard/map" className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <Map size={24} className="text-indigo-600" />
              <h3 className="font-semibold text-gray-900">See Map</h3>
            </div>
            <p className="text-sm text-gray-600">View field locations and geographical layout</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
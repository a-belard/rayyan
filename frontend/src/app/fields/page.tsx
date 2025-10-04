'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../components/LanguageSelector';
import { 
  ArrowLeft, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  MapPin,
  Calendar,
  Clock,
  BarChart3,
  Zap,
  Eye
} from 'lucide-react';

interface SensorData {
  id: string;
  name: string;
  location: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  ph: number;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  lastUpdated: string;
  status: 'healthy' | 'warning' | 'critical';
  irrigationStatus: 'active' | 'scheduled' | 'off';
  weatherCondition: string;
}

const fieldsData: SensorData[] = [
  {
    id: 'field-1',
    name: 'North Field - Tomatoes',
    location: 'Section A1',
    temperature: 24.5,
    humidity: 65,
    soilMoisture: 42,
    ph: 6.8,
    nutrients: { nitrogen: 78, phosphorus: 65, potassium: 82 },
    lastUpdated: '2 minutes ago',
    status: 'healthy',
    irrigationStatus: 'scheduled',
    weatherCondition: 'Sunny'
  },
  {
    id: 'field-2',
    name: 'South Field - Corn',
    location: 'Section B2',
    temperature: 26.1,
    humidity: 58,
    soilMoisture: 28,
    ph: 7.2,
    nutrients: { nitrogen: 45, phosphorus: 72, potassium: 68 },
    lastUpdated: '5 minutes ago',
    status: 'warning',
    irrigationStatus: 'active',
    weatherCondition: 'Partly Cloudy'
  },
  {
    id: 'field-3',
    name: 'East Field - Wheat',
    location: 'Section C1',
    temperature: 23.8,
    humidity: 72,
    soilMoisture: 55,
    ph: 6.5,
    nutrients: { nitrogen: 89, phosphorus: 58, potassium: 75 },
    lastUpdated: '1 minute ago',
    status: 'healthy',
    irrigationStatus: 'off',
    weatherCondition: 'Overcast'
  },
  {
    id: 'field-4',
    name: 'West Field - Peppers',
    location: 'Section D3',
    temperature: 27.3,
    humidity: 48,
    soilMoisture: 18,
    ph: 5.9,
    nutrients: { nitrogen: 32, phosphorus: 45, potassium: 38 },
    lastUpdated: '8 minutes ago',
    status: 'critical',
    irrigationStatus: 'scheduled',
    weatherCondition: 'Hot & Dry'
  }
];

export default function FieldsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedField, setSelectedField] = useState<SensorData>(fieldsData[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication - use same key as dashboard and login
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading field data...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIrrigationColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'scheduled': return 'text-orange-600 bg-orange-100';
      case 'off': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link
                href="/farm-dashboard"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('fields.title')}</h1>
                <p className="text-sm text-gray-600">{t('fields.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Activity className="w-4 h-4" />
                <span>{t('fields.liveData')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Field Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('fields.activeFields')}</h2>
              <div className="space-y-3">
                {fieldsData.map((field) => (
                  <div
                    key={field.id}
                    onClick={() => setSelectedField(field)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedField.id === field.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{field.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(field.status)}`}>
                        {field.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {field.location}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {field.lastUpdated}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Field Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedField.name}</h2>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {selectedField.location} • {selectedField.weatherCondition}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedField.status)}`}>
                    {selectedField.status.charAt(0).toUpperCase() + selectedField.status.slice(1)}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getIrrigationColor(selectedField.irrigationStatus)}`}>
                    Irrigation: {selectedField.irrigationStatus}
                  </span>
                </div>
              </div>

              {/* Environmental Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <Thermometer className="w-5 h-5 text-blue-600" />
                    <span className="text-xs text-blue-600 font-medium">°C</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-gray-900">{selectedField.temperature}</div>
                    <div className="text-xs text-gray-600">Temperature</div>
                  </div>
                </div>

                <div className="bg-cyan-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <Droplets className="w-5 h-5 text-cyan-600" />
                    <span className="text-xs text-cyan-600 font-medium">%</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-gray-900">{selectedField.humidity}</div>
                    <div className="text-xs text-gray-600">Humidity</div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <Wind className="w-5 h-5 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">%</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-gray-900">{selectedField.soilMoisture}</div>
                    <div className="text-xs text-gray-600">Soil Moisture</div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <span className="text-xs text-purple-600 font-medium">pH</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-gray-900">{selectedField.ph}</div>
                    <div className="text-xs text-gray-600">Soil pH</div>
                  </div>
                </div>
              </div>

              {/* Soil Nutrients */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Soil Nutrient Levels</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{selectedField.nutrients.nitrogen}%</div>
                    <div className="text-sm text-gray-600">Nitrogen (N)</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${selectedField.nutrients.nitrogen}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">{selectedField.nutrients.phosphorus}%</div>
                    <div className="text-sm text-gray-600">Phosphorus (P)</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full" 
                        style={{ width: `${selectedField.nutrients.phosphorus}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{selectedField.nutrients.potassium}%</div>
                    <div className="text-sm text-gray-600">Potassium (K)</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${selectedField.nutrients.potassium}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                AI Recommendations
              </h3>
              <div className="space-y-4">
                {selectedField.status === 'critical' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-red-900">Critical: Low Soil Moisture</h4>
                        <p className="text-sm text-red-700 mt-1">
                          Immediate irrigation required. Soil moisture at {selectedField.soilMoisture}% is below critical threshold.
                        </p>
                        <button className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                          Activate Emergency Irrigation
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedField.status === 'warning' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Warning: Monitor Soil Moisture</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Soil moisture at {selectedField.soilMoisture}% requires attention. Consider scheduling irrigation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-green-900">Optimize Nutrient Balance</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Based on current soil analysis, consider adding phosphorus-rich fertilizer to boost crop yield.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Sun className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-900">Weather-Based Scheduling</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Current weather conditions are optimal for growth. Next irrigation recommended in 8 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
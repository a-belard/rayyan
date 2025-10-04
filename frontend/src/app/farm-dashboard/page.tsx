'use client';

import React, { useState, useEffect } from 'react';
import { LogOut, User, Bell, Settings, BarChart3, Users, CheckCircle, MapPin, Calendar, TrendingUp, Droplets, Sun, Moon, Cloud, CloudRain, CloudSnow, Zap, Wind, Eye, Thermometer, RefreshCw, AlertTriangle, ShowerHead, Beaker, Target, Sprout, Database, Map } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../components/LanguageSelector';

/**
 * Protected Farm Dashboard Component
 * 
 * Accessible only after successful login
 * Features:
 * - User authentication check
 * - Personalized farmer dashboard
 * - Farm management tools
 * - Quick access to all platform features
 */
// Weather data interface
interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  name: string;
}

export default function FarmDashboard() {
  const { t } = useTranslation();
  const [userEmail, setUserEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Sample data for detailed views
  const fieldsData = [
    { id: 1, name: 'North Field', size: '2.5 acres', crop: 'Tomatoes', status: 'Healthy', soilMoisture: '65%', lastWatered: '2 hours ago', cropAge: 85 },
    { id: 2, name: 'South Field', size: '1.8 acres', crop: 'Corn', status: 'Needs Water', soilMoisture: '45%', lastWatered: '6 hours ago', cropAge: 42 },
    { id: 3, name: 'East Field', size: '3.2 acres', crop: 'Wheat', status: 'Excellent', soilMoisture: '72%', lastWatered: '1 hour ago', cropAge: 28 }
  ];

  const teamData = [
    { id: 1, name: 'Ahmed Hassan', role: 'Senior Worker', status: 'Active', location: 'North Field', tasks: 3 },
    { id: 2, name: 'Maria Rodriguez', role: 'Field Specialist', status: 'Active', location: 'South Field', tasks: 2 },
    { id: 3, name: 'John Smith', role: 'Equipment Operator', status: 'Break', location: 'Equipment Shed', tasks: 1 },
    { id: 4, name: 'Sarah Johnson', role: 'Quality Inspector', status: 'Active', location: 'East Field', tasks: 2 },
    { id: 5, name: 'Carlos Miguel', role: 'Irrigation Specialist', status: 'Active', location: 'Multiple Fields', tasks: 4 }
  ];

  const tasksData = [
    { id: 1, title: 'Water North Field', assignee: 'Ahmed Hassan', priority: 'High', dueTime: '2 hours', status: 'In Progress' },
    { id: 2, title: 'Pest Inspection - South Field', assignee: 'Maria Rodriguez', priority: 'Medium', dueTime: '4 hours', status: 'Pending' },
    { id: 3, title: 'Harvest East Section', assignee: 'John Smith', priority: 'High', dueTime: '1 hour', status: 'In Progress' },
    { id: 4, title: 'Equipment Maintenance', assignee: 'Carlos Miguel', priority: 'Low', dueTime: '6 hours', status: 'Pending' },
    { id: 5, title: 'Soil Testing - Multiple Fields', assignee: 'Sarah Johnson', priority: 'Medium', dueTime: '3 hours', status: 'In Progress' },
    { id: 6, title: 'Fertilizer Application', assignee: 'Ahmed Hassan', priority: 'Medium', dueTime: '5 hours', status: 'Pending' },
    { id: 7, title: 'Crop Quality Assessment', assignee: 'Maria Rodriguez', priority: 'High', dueTime: '1.5 hours', status: 'In Progress' }
  ];

  const yieldData = [
    { field: 'North Field', crop: 'Tomatoes', thisWeek: '450 lbs', lastWeek: '420 lbs', change: '+7.1%', trend: 'up' },
    { field: 'South Field', crop: 'Corn', thisWeek: '680 lbs', lastWeek: '595 lbs', change: '+14.3%', trend: 'up' },
    { field: 'East Field', crop: 'Wheat', thisWeek: '720 lbs', lastWeek: '650 lbs', change: '+10.8%', trend: 'up' }
  ];

  // Farm Analytics Data
  const analyticsData = {
    waterUsage: {
      totalUsed: 9274, // liters this week
      dailyAverage: 1325,
      weeklyTarget: 10599,
      efficiency: 87.5,
      breakdown: [
        { field: 'North Field', used: 3218, percentage: 34.7 },
        { field: 'South Field', used: 2725, percentage: 29.4 },
        { field: 'East Field', used: 3331, percentage: 35.9 }
      ]
    },
    waterStorage: {
      currentLevel: 32175, // liters
      capacity: 45425,
      percentage: 70.8,
      refillDate: '2025-10-06',
      daysLeft: 3,
      criticalLevel: 11356
    },
    irrigationSchedule: [
      { field: 'North Field', nextIrrigation: '2025-10-04 06:00', amount: '1703 L', priority: 'High' },
      { field: 'South Field', nextIrrigation: '2025-10-04 14:00', amount: '1438 L', priority: 'Critical' },
      { field: 'East Field', nextIrrigation: '2025-10-05 08:00', amount: '1968 L', priority: 'Medium' }
    ],
    pesticides: {
      inventory: [
        { name: 'Desert-Grade Neem Oil', current: 15, unit: 'liters', capacity: 25, lastUsed: '2025-09-28', nextOrder: '2025-10-08' },
        { name: 'Heat-Resistant Fungicide', current: 8, unit: 'kg', capacity: 20, lastUsed: '2025-09-30', nextOrder: '2025-10-15' },
        { name: 'Arid Climate Bt Spray', current: 22, unit: 'liters', capacity: 30, lastUsed: '2025-10-01', nextOrder: 'Stocked' },
        { name: 'Sand Fly Deterrent', current: 12, unit: 'kg', capacity: 15, lastUsed: '2025-09-25', nextOrder: 'Soon' }
      ],
      monthlyUsage: [
        { month: 'Aug', amount: 45, cost: 835 }, // QAR
        { month: 'Sep', amount: 38, cost: 710 }, // QAR
        { month: 'Oct', amount: 28, cost: 525 } // QAR
      ]
    },
    costAnalysis: {
      waterCost: 530.00, // QAR - Higher water costs in Qatar due to desalination
      pesticideCost: 710.00, // QAR - Imported pesticides cost more in Qatar
      equipmentCost: 310.50, // QAR - Equipment maintenance in hot climate
      totalWeekly: 1550.50, // QAR - Total weekly operational costs
      savings: 12.8 // percentage saved vs last month through efficient practices
    }
  };

  // Fetch weather data
  const fetchWeatherData = async () => {
    try {
      setWeatherLoading(true);
      const response = await fetch(
        'https://api.openweathermap.org/data/2.5/weather?q=Doha,qa&APPID=13f5c4253fcdb0a944d5ca70edbab565&units=metric'
      );
      
      if (!response.ok) {
        throw new Error('Weather data fetch failed');
      }
      
      const data = await response.json();
      setWeatherData(data);
      setWeatherError(null);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherError('Unable to fetch weather data');
    } finally {
      setWeatherLoading(false);
    }
  };

  // Check authentication status on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const email = localStorage.getItem('userEmail');
    
    if (isLoggedIn === 'true' && email) {
      setIsAuthenticated(true);
      setUserEmail(email);
      // Fetch weather data after authentication
      fetchWeatherData();
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  }, []);

  // Helper function to get weather icon component
  const getWeatherIcon = (weatherMain: string, icon: string) => {
    const iconProps = { className: "w-8 h-8", color: "#2563eb" };
    
    if (icon === '01d') return <Sun {...iconProps} color="#f59e0b" />;
    if (icon === '01n') return <Moon {...iconProps} color="#6366f1" />;
    if (icon.startsWith('02')) return <Cloud {...iconProps} />;
    if (icon.startsWith('03') || icon.startsWith('04')) return <Cloud {...iconProps} />;
    if (icon.startsWith('09') || icon.startsWith('10')) return <CloudRain {...iconProps} />;
    if (icon.startsWith('11')) return <Zap {...iconProps} color="#7c3aed" />;
    if (icon.startsWith('13')) return <CloudSnow {...iconProps} />;
    if (icon.startsWith('50')) return <Eye {...iconProps} color="#6b7280" />;
    
    return <Sun {...iconProps} color="#f59e0b" />;
  };

  // Helper function to get wind direction
  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
  };

  // Helpers for crop ages and stages (mirrors Field Monitoring page)
  const daysToMonths = (days: number) => {
    const months = Math.floor(days / 30);
    const remDays = days % 30;
    return { months, remDays };
  };

  const getCropStage = (days: number) => {
    if (days <= 21) return { label: 'Seedling', color: 'bg-amber-100 text-amber-800' };
    if (days <= 60) return { label: 'Vegetative', color: 'bg-emerald-100 text-emerald-800' };
    if (days <= 90) return { label: 'Flowering', color: 'bg-purple-100 text-purple-800' };
    return { label: 'Fruiting / Harvest', color: 'bg-blue-100 text-blue-800' };
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = '/';
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-800">FarmWise Dashboard</h1>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">{userEmail}</span>
              </div>
              
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="w-5 h-5" />
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">{t('navigation.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
            <h2 className="text-4xl font-bold mb-3">
              {t('farmDashboard.welcome', { name: userEmail.split('@')[0] })}
            </h2>
            <p className="text-green-100 text-lg">
              {t('farmDashboard.todayActivity', { date: new Date().toLocaleDateString() })}
            </p>
            <div className="mt-6 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">All systems operational</span>
              </div>
              <div className="text-sm opacity-75">Last updated: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div 
            onClick={() => setActiveModal('fields')}
            className="bg-white rounded-xl shadow-lg border-0 p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('farmDashboard.quickStats.activeFields')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">3</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => setActiveModal('team')}
            className="bg-white rounded-xl shadow-lg border-0 p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('farmDashboard.quickStats.teamMembers')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">5</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => setActiveModal('tasks')}
            className="bg-white rounded-xl shadow-lg border-0 p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <CheckCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('farmDashboard.quickStats.activeTasks')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">7</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => setActiveModal('yield')}
            className="bg-white rounded-xl shadow-lg border-0 p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('farmDashboard.quickStats.weeklyYield')}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">+12%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Map - full width */}
        <div className="mb-12">
          <Link href="/farm-dashboard/map" className="block group">
            <div className="relative h-56 md:h-64 w-full overflow-hidden rounded-2xl border bg-gradient-to-br from-green-100 via-blue-50 to-green-100 shadow-sm">
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

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Field Monitoring */}
          <Link href="/field-monitoring" className="block">
            <div className="bg-white rounded-xl shadow-lg border-0 p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-100 rounded-xl">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="ml-4 text-xl font-bold text-gray-900">Field Monitoring</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Real-time sensor data, soil health metrics, and AI-powered recommendations for all your fields.
              </p>
              <div className="text-green-600 font-semibold text-sm flex items-center">
                Open Field Monitoring 
                <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Team Management */}
          <Link href="/team" className="block">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="ml-4 text-xl font-bold text-gray-900">Team Management</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Manage worker farmers, assign field tasks, and coordinate team activities via SMS.
              </p>
              <div className="text-blue-600 font-semibold text-sm flex items-center">
                Manage Team 
                <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Task Assignment */}
          <Link href="/tasks" className="block">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="ml-4 text-xl font-bold text-gray-900">Task Assignment</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Create and assign tasks to workers, set priorities, and track completion status.
              </p>
              <div className="text-yellow-600 font-semibold text-sm flex items-center">
                Create Tasks 
                <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Real-Time Tracker */}
          <Link href="/tracker" className="block">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="ml-4 text-xl font-bold text-gray-900">Real-Time Tracker</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Monitor live task progress, SMS communications, and worker location updates.
              </p>
              <div className="text-purple-600 font-semibold text-sm flex items-center">
                View Tracker 
                <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Weather & Alerts */}
          <div 
            onClick={() => setActiveModal('weather')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="ml-4 text-xl font-bold text-gray-900">Weather & Alerts</h3>
            </div>
            
            {weatherLoading ? (
              <div className="text-gray-600 mb-6 leading-relaxed">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : weatherData ? (
              <div className="text-gray-600 mb-6 leading-relaxed">
                <div className="flex items-center mb-2">
                  <div className="mr-3">
                    {getWeatherIcon(weatherData.weather[0].main, weatherData.weather[0].icon)}
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-gray-900">
                      {Math.round(weatherData.main.temp)}°C
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {weatherData.weather[0].description}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Humidity: {weatherData.main.humidity}% • Wind: {Math.round(weatherData.wind.speed * 3.6)} km/h
                </p>
              </div>
            ) : (
              <p className="text-gray-600 mb-6 leading-relaxed">
                Weather data loading...
                <br />
                Location: Doha, Qatar
              </p>
            )}
            
            <div className="text-orange-600 font-semibold text-sm flex items-center">
              View Weather Details 
              <span className="ml-1">→</span>
            </div>
          </div>

          {/* Farm Analytics */}
          <div 
            onClick={() => setActiveModal('analytics')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <BarChart3 className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="ml-4 text-xl font-bold text-gray-900">Farm Analytics</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Water usage, storage levels, pesticide tracking, and comprehensive farm metrics.
            </p>
            <div className="text-indigo-600 font-semibold text-sm flex items-center">
              View Analytics 
              <span className="ml-1">→</span>
            </div>
          </div>

          {/* Interactive Map card removed - map preview moved next to Weekly Yield */}
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Ahmed Hassan</span> completed irrigation system check in North Field
                  </p>
                  <span className="text-xs text-gray-400">2 hours ago</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    New task assigned: <span className="font-medium">Pest inspection in South Field</span>
                  </p>
                  <span className="text-xs text-gray-400">4 hours ago</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Maria Rodriguez</span> joined the team
                  </p>
                  <span className="text-xs text-gray-400">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {activeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white shadow-2xl overflow-hidden ${
              activeModal === 'analytics' || activeModal === 'weather' || activeModal === 'fields'
                ? 'fixed inset-4 rounded-xl' 
                : 'rounded-xl max-w-4xl w-full max-h-[80vh]'
            }`}>
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeModal === 'fields' && 'Active Fields Details'}
                    {activeModal === 'team' && 'Team Members Overview'}
                    {activeModal === 'tasks' && 'Active Tasks Management'}
                    {activeModal === 'yield' && 'This Week\'s Yield Report'}
                    {activeModal === 'analytics' && 'Farm Analytics Dashboard'}
                    {activeModal === 'weather' && 'Weather Dashboard & Alerts'}
                  </h2>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className={`p-6 overflow-y-auto ${
                activeModal === 'analytics' || activeModal === 'weather' || activeModal === 'fields'
                  ? 'h-[calc(100vh-140px)]' 
                  : 'max-h-[60vh]'
              }`}>
                {/* Fields Modal Content */}
                {activeModal === 'fields' && (
                  <div className="space-y-4">
                    {fieldsData.map((field) => (
                      <div key={field.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
                            <p className="text-sm text-gray-600">{field.size} • {field.crop}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            field.status === 'Healthy' ? 'bg-green-100 text-green-700' :
                            field.status === 'Excellent' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {field.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Soil Moisture</p>
                            <p className="font-semibold">{field.soilMoisture}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Last Watered</p>
                            <p className="font-semibold">{field.lastWatered}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Crop Age</p>
                            <p className="font-semibold">
                              {(() => {
                                const age = field.cropAge ?? 0;
                                const m = daysToMonths(age);
                                return `${age} days • ~${m.months}m ${m.remDays}d`;
                              })()}
                            </p>
                            <div className="mt-1">
                              {(() => {
                                const stage = getCropStage(field.cropAge ?? 0);
                                return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${stage.color}`}>
                                  <Sprout className="w-3 h-3" />
                                  {stage.label}
                                </span>;
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Team Modal Content */}
                {activeModal === 'team' && (
                  <div className="space-y-4">
                    {teamData.map((member) => (
                      <div key={member.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                              <p className="text-sm text-gray-600">{member.role}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            member.status === 'Active' ? 'bg-green-100 text-green-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {member.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Current Location</p>
                            <p className="font-semibold">{member.location}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Active Tasks</p>
                            <p className="font-semibold">{member.tasks} tasks</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tasks Modal Content */}
                {activeModal === 'tasks' && (
                  <div className="space-y-4">
                    {tasksData.map((task) => (
                      <div key={task.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                            <p className="text-sm text-gray-600">Assigned to: {task.assignee}</p>
                          </div>
                          <div className="flex space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.priority === 'High' ? 'bg-red-100 text-red-700' :
                              task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {task.priority}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">Due in: {task.dueTime}</p>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Yield Modal Content */}
                {activeModal === 'yield' && (
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4 mb-6">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Overall Performance</h3>
                      <p className="text-3xl font-bold text-green-600">+12% increase</p>
                      <p className="text-sm text-green-700">Compared to last week</p>
                    </div>
                    
                    {yieldData.map((field, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{field.field}</h3>
                            <p className="text-sm text-gray-600">{field.crop}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            {field.change}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">This Week</p>
                            <p className="font-semibold text-lg">{field.thisWeek}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Last Week</p>
                            <p className="font-semibold">{field.lastWeek}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Analytics Modal Content */}
                {activeModal === 'analytics' && (
                  <div className="space-y-6">
                    {/* Water Usage Section */}
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                        <Droplets className="w-5 h-5 inline mr-2" /> Water Usage Analytics
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-gray-600">Total Used This Week</p>
                          <p className="text-2xl font-bold text-blue-600">{analyticsData.waterUsage.totalUsed} L</p>
                          <p className="text-xs text-green-600">Target: {analyticsData.waterUsage.weeklyTarget} L</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-gray-600">Daily Average</p>
                          <p className="text-2xl font-bold text-blue-600">{analyticsData.waterUsage.dailyAverage} L</p>
                          <p className="text-xs text-blue-600">Per day consumption</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-gray-600">Efficiency</p>
                          <p className="text-2xl font-bold text-green-600">{analyticsData.waterUsage.efficiency}%</p>
                          <p className="text-xs text-green-600">Above target efficiency</p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Usage by Field</h4>
                        {analyticsData.waterUsage.breakdown.map((field, index) => (
                          <div key={index} className="flex justify-between items-center mb-2">
                            <span className="text-sm">{field.field}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${field.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold">{field.used} L</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Water Storage Section */}
                    <div className="bg-cyan-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-cyan-800 mb-4 flex items-center">
                        <Database className="w-5 h-5 mr-2" /> Water Storage Status
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Current Level</span>
                            <span className="text-sm font-semibold">{analyticsData.waterStorage.currentLevel} / {analyticsData.waterStorage.capacity} L</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                            <div 
                              className={`h-4 rounded-full ${
                                analyticsData.waterStorage.percentage > 50 ? 'bg-green-600' :
                                analyticsData.waterStorage.percentage > 25 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${analyticsData.waterStorage.percentage}%` }}
                            ></div>
                          </div>
                          <p className="text-lg font-bold text-cyan-600">{analyticsData.waterStorage.percentage}% Full</p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-gray-600">Next Refill Scheduled</p>
                          <p className="text-lg font-bold text-cyan-600">{analyticsData.waterStorage.refillDate}</p>
                          <p className="text-sm text-orange-600">In {analyticsData.waterStorage.daysLeft} days</p>
                          <p className="text-xs text-red-600 mt-2 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> Critical level: {analyticsData.waterStorage.criticalLevel} L (Desert reserve minimum)</p>
                        </div>
                      </div>
                    </div>

                    {/* Irrigation Schedule */}
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                        <ShowerHead className="w-5 h-5 mr-2" /> Irrigation Schedule
                      </h3>
                      
                      <div className="space-y-3">
                        {analyticsData.irrigationSchedule.map((schedule, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold">{schedule.field}</h4>
                              <p className="text-sm text-gray-600">{schedule.nextIrrigation}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{schedule.amount}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                schedule.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                schedule.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {schedule.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pesticides Tracking */}
                    <div className="bg-amber-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                        <Beaker className="w-5 h-5 mr-2" /> Pesticide Inventory & Usage
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Current Inventory</h4>
                          <div className="space-y-3">
                            {analyticsData.pesticides.inventory.map((item, index) => (
                              <div key={index} className="border-b pb-2">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium">{item.name}</span>
                                  <span className="text-sm">{item.current} / {item.capacity} {item.unit}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      (item.current / item.capacity) > 0.5 ? 'bg-green-600' :
                                      (item.current / item.capacity) > 0.25 ? 'bg-yellow-600' : 'bg-red-600'
                                    }`}
                                    style={{ width: `${(item.current / item.capacity) * 100}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                  <span>Last used: {item.lastUsed}</span>
                                  <span className={item.nextOrder === 'Soon' || item.nextOrder.includes('2025-10') ? 'text-orange-600' : 'text-green-600'}>
                                    Next order: {item.nextOrder}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Monthly Usage Trends</h4>
                          {analyticsData.pesticides.monthlyUsage.map((month, index) => (
                            <div key={index} className="flex justify-between items-center mb-3">
                              <span className="text-sm">{month.month} 2025</span>
                              <div className="text-right">
                                <p className="text-sm font-medium">{month.amount} units</p>
                                <p className="text-xs text-gray-600">QAR {month.cost}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Cost Analysis */}
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 inline mr-2" /> Cost Analysis
                      </h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-600">Water Costs</p>
                          <p className="text-lg font-bold text-blue-600">QAR {analyticsData.costAnalysis.waterCost}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-600">Pesticide Costs</p>
                          <p className="text-lg font-bold text-amber-600">QAR {analyticsData.costAnalysis.pesticideCost}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-600">Equipment</p>
                          <p className="text-lg font-bold text-gray-600">QAR {analyticsData.costAnalysis.equipmentCost}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-600">Total Weekly</p>
                          <p className="text-lg font-bold text-purple-600">QAR {analyticsData.costAnalysis.totalWeekly}</p>
                          <p className="text-xs text-green-600">{analyticsData.costAnalysis.savings}% saved</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Weather Modal Content */}
                {activeModal === 'weather' && (
                  <div className="space-y-6">
                    {weatherLoading ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <div className="animate-pulse">
                          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                        </div>
                      </div>
                    ) : weatherError ? (
                      <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Weather Service Unavailable</h3>
                        <p className="text-red-700 flex items-center"><AlertTriangle className="w-4 h-4 mr-1" /> {weatherError}</p>
                        <button 
                          onClick={fetchWeatherData}
                          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Retry Connection
                        </button>
                      </div>
                    ) : weatherData ? (
                      <>
                        {/* Current Weather Overview */}
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-blue-800">Current Conditions</h3>
                            <button 
                              onClick={fetchWeatherData}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                            >
                              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg p-6">
                              <div className="flex items-center mb-4">
                                <div className="mr-4">
                                  {getWeatherIcon(weatherData.weather[0].main, weatherData.weather[0].icon)}
                                </div>
                                <div>
                                  <p className="text-3xl font-bold text-gray-900">{Math.round(weatherData.main.temp)}°C</p>
                                  <p className="text-sm text-gray-600 capitalize">{weatherData.weather[0].description}</p>
                                  <p className="text-sm text-gray-600">Feels like {Math.round(weatherData.main.feels_like)}°C</p>
                                </div>
                              </div>
                              <p className="text-sm text-blue-600 font-medium flex items-center"><MapPin className="w-4 h-4 mr-1" /> {weatherData.name}, Qatar</p>
                            </div>
                            
                            <div className="bg-white rounded-lg p-6">
                              <h4 className="font-semibold mb-3 text-gray-800">Atmospheric Conditions</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Humidity</span>
                                  <span className="font-medium">{weatherData.main.humidity}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Pressure</span>
                                  <span className="font-medium">{weatherData.main.pressure} hPa</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Wind</span>
                                  <span className="font-medium">{Math.round(weatherData.wind.speed * 3.6)} km/h {getWindDirection(weatherData.wind.deg)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Visibility</span>
                                  <span className="font-medium">{(weatherData.visibility / 1000).toFixed(1)} km</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Visual Weather Metrics */}
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><BarChart3 className="w-5 h-5 mr-2" /> Weather Metrics</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Temperature Range */}
                            <div className="bg-white rounded-lg p-4">
                              <h4 className="font-medium text-gray-700 mb-3 flex items-center"><Thermometer className="w-4 h-4 mr-2" /> Temperature Analysis</h4>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Current</span>
                                    <span className="font-medium">{Math.round(weatherData.main.temp)}°C</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-orange-500 h-2 rounded-full"
                                      style={{ width: `${Math.min((weatherData.main.temp / 50) * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Feels Like</span>
                                    <span className="font-medium">{Math.round(weatherData.main.feels_like)}°C</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-red-500 h-2 rounded-full"
                                      style={{ width: `${Math.min((weatherData.main.feels_like / 50) * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Humidity & Pressure */}
                            <div className="bg-white rounded-lg p-4">
                              <h4 className="font-medium text-gray-700 mb-3 flex items-center"><Droplets className="w-4 h-4 mr-2" /> Atmospheric Pressure</h4>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Humidity</span>
                                    <span className="font-medium">{weatherData.main.humidity}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{ width: `${weatherData.main.humidity}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Pressure</span>
                                    <span className="font-medium">{weatherData.main.pressure} hPa</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-500 h-2 rounded-full"
                                      style={{ width: `${Math.min(((weatherData.main.pressure - 950) / 100) * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">Normal range: 1000-1020 hPa</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Wind Analysis */}
                        <div className="bg-white rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Wind className="w-5 h-5 mr-2" /> Wind Analysis</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <p className="text-2xl font-bold text-blue-600">{Math.round(weatherData.wind.speed * 3.6)}</p>
                              <p className="text-sm text-blue-700">km/h</p>
                              <p className="text-xs text-gray-600">Wind Speed</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <p className="text-2xl font-bold text-green-600">{getWindDirection(weatherData.wind.deg)}</p>
                              <p className="text-sm text-green-700">{weatherData.wind.deg}°</p>
                              <p className="text-xs text-gray-600">Direction</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                              <p className="text-2xl font-bold text-purple-600">
                                {weatherData.wind.speed < 5 ? 'Light' : weatherData.wind.speed < 15 ? 'Moderate' : 'Strong'}
                              </p>
                              <p className="text-sm text-purple-700">Intensity</p>
                              <p className="text-xs text-gray-600">Assessment</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-700">
                              <strong>Qatar Desert Farming Impact:</strong> 
                              {weatherData.wind.speed < 5 ? 
                                'Calm conditions perfect for precision agriculture and greenhouse ventilation control.' :
                                weatherData.wind.speed < 15 ?
                                'Moderate winds good for natural cooling. Safe for most operations including drone spraying.' :
                                'Strong desert winds (Shamal) detected - secure shade structures, postpone aerial applications, and protect young plants.'
                              }
                            </p>
                          </div>
                        </div>

                        {/* Agricultural Alerts */}
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /> Agricultural Alerts</h3>
                          
                          {weatherData.main.temp > 35 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="flex items-center">
                                <Thermometer className="w-6 h-6 mr-3 text-red-600" />
                                <div>
                                  <p className="font-medium text-red-800">High Temperature Alert</p>
                                  <p className="text-sm text-red-700">Extreme Qatar heat ({Math.round(weatherData.main.temp)}°C) detected. Activate emergency cooling: increase drip irrigation to 3x frequency, deploy shade nets, and consider midday misting for greenhouse crops. Avoid field work during 10 AM - 4 PM.</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {weatherData.main.humidity < 30 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="flex items-center">
                                <Sprout className="w-6 h-6 mr-3 text-yellow-600" />
                                <div>
                                  <p className="font-medium text-yellow-800">Low Humidity Alert</p>
                                  <p className="text-sm text-yellow-700">Humidity is {weatherData.main.humidity}%. Monitor plants for signs of stress and consider misting systems for greenhouse crops.</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {weatherData.wind.speed > 10 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center">
                                <Wind className="w-6 h-6 mr-3 text-blue-600" />
                                <div>
                                  <p className="font-medium text-blue-800">Strong Wind Alert</p>
                                  <p className="text-sm text-blue-700">Strong winds ({Math.round(weatherData.wind.speed * 3.6)} km/h) - possible Shamal conditions. Secure greenhouse panels, reinforce shade structures, protect date palm fronds, and postpone all spraying operations. Monitor sand drift around crops.</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {weatherData.main.temp <= 35 && weatherData.main.humidity >= 30 && weatherData.wind.speed <= 10 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex items-center">
                                <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                                <div>
                                  <p className="font-medium text-green-800">Optimal Conditions</p>
                                  <p className="text-sm text-green-700">Excellent conditions for Qatar desert farming! Perfect for early morning field operations, greenhouse maintenance, and precision irrigation adjustments. Ideal time for date palm care and vegetable transplanting.</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Recommendations */}
                        <div className="bg-indigo-50 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center"><Target className="w-5 h-5 mr-2" /> Farm Recommendations</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded p-4">
                              <h4 className="font-medium text-gray-800 mb-2 flex items-center"><Droplets className="w-4 h-4 mr-2" /> Irrigation Schedule</h4>
                              <p className="text-sm text-gray-600">
                                {weatherData.main.temp > 30 ? 
                                  'High desert heat detected. Increase drip irrigation frequency and use shade cloth. Early morning (4-6 AM) irrigation critical to reduce evaporation.' :
                                  weatherData.main.temp < 15 ?
                                  'Cool desert weather - rare in Qatar. Reduce watering but monitor salt buildup in soil.' :
                                  'Optimal temperature for Qatar farming. Maintain standard desert irrigation schedule with mulching.'
                                }
                              </p>
                            </div>
                            
                            <div className="bg-white rounded p-4">
                              <h4 className="font-medium text-gray-800 mb-2 flex items-center"><Sprout className="w-4 h-4 mr-2" /> Crop Care</h4>
                              <p className="text-sm text-gray-600">
                                {weatherData.main.humidity < 40 ? 
                                  'Typical Qatar arid conditions. Use reflective mulch, shade nets, and consider greenhouse cultivation for sensitive crops.' :
                                  weatherData.main.humidity > 80 ?
                                  'Unusually high humidity for Qatar - risk of fungal diseases. Increase ventilation and reduce irrigation frequency.' :
                                  'Good humidity levels for Qatar. Continue desert-adapted farming practices.'
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-600 mb-4">Weather data is currently unavailable</p>
                        <button 
                          onClick={fetchWeatherData}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Try Loading Weather Data
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
'use client';

// Ensure this route is always rendered dynamically so UI updates are immediately visible
export const dynamic = 'force-dynamic';

import React from 'react';
import { ArrowLeft, MapPin, Layers, Satellite, Zap, LogOut, User, Bell, Settings } from 'lucide-react';
import Link from 'next/link';

export default function FarmMapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/farm-dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Farm Dashboard
              </Link>
              <div className="text-2xl font-bold text-gray-900">Interactive Farm Map</div>
            </div>
            
            {/* Top Navigation */}
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Farm Manager</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
              <Layers size={16} />
              Field Layers
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
              <Satellite size={16} />
              Satellite View
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors">
              <Zap size={16} />
              Live Sensors
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            Last Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[calc(100vh-8rem)]">
        {/* Map Placeholder */}
        <div className="w-full h-full bg-gradient-to-br from-green-100 via-blue-50 to-green-200 flex items-center justify-center relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-green-300/30 rounded-full"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-blue-300/30 rounded-full"></div>
          <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-yellow-300/20 rounded-full"></div>
          
          <div className="text-center z-10">
            <div className="w-32 h-32 mx-auto mb-8 bg-white rounded-full flex items-center justify-center shadow-2xl">
              <MapPin size={60} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Farm Geographic Overview</h2>
            <p className="text-gray-600 max-w-lg text-lg leading-relaxed">
              Interactive mapping system showing field boundaries, sensor locations, irrigation zones, and real-time agricultural data across your entire farm operation.
            </p>
          </div>
        </div>

        {/* Field Management Panel */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl p-6 max-w-sm">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">Field Management</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div>
                <span className="font-medium text-gray-800">North Field</span>
                <p className="text-sm text-gray-600">Tomatoes • Healthy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <div>
                <span className="font-medium text-gray-800">South Field</span>
                <p className="text-sm text-gray-600">Corn • Needs Water</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <div>
                <span className="font-medium text-gray-800">East Field</span>
                <p className="text-sm text-gray-600">Lettuce • Critical</p>
              </div>
            </div>
          </div>
        </div>

        {/* Farm Statistics */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-6 min-w-[280px]">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">Farm Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">15.7</div>
              <div className="text-sm text-gray-600">Total Acres</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Active Sensors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <div className="text-sm text-gray-600">Irrigation Zones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">85%</div>
              <div className="text-sm text-gray-600">Field Efficiency</div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Quick Actions</h3>
                <p className="text-gray-600 text-sm">Manage your fields directly from the map</p>
              </div>
              <div className="flex gap-3">
                <Link 
                  href="/farm-dashboard"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Back to Dashboard
                </Link>
                <Link
                  href="/field-monitoring" 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Open Field Monitoring
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

// Ensure this route is always rendered dynamically so UI updates are immediately visible
export const dynamic = 'force-dynamic';

import React from 'react';
import { ArrowLeft, MapPin, Layers, Satellite, Zap } from 'lucide-react';
import Link from 'next/link';

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </Link>
              <div className="text-2xl font-bold text-gray-900">Farm Map</div>
            </div>
            
            {/* Map Controls */}
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                <Layers size={16} />
                Layers
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                <Satellite size={16} />
                Satellite
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[calc(100vh-4rem)]">
        {/* Map Placeholder */}
        <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-lg">
              <MapPin size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Interactive Farm Map</h2>
            <p className="text-gray-600 max-w-md">
              Geographic overview of your fields with real-time sensor data, irrigation zones, and field boundaries.
            </p>
          </div>
        </div>

        {/* Field Legend */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-semibold text-gray-800 mb-3">Field Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-700">Healthy Fields</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-700">Needs Attention</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-700">Critical Issues</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-700">Irrigation Active</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Fields:</span>
              <span className="font-semibold text-gray-800">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Sensors:</span>
              <span className="font-semibold text-green-600">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Area Coverage:</span>
              <span className="font-semibold text-gray-800">15.7 acres</span>
            </div>
          </div>
        </div>

        {/* Field Cards */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* North Field */}
            <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">North Field</h4>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Tomatoes • 85 days old</p>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Healthy</span>
                <span className="text-xs text-gray-500">78% moisture</span>
              </div>
            </div>

            {/* South Field */}
            <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">South Field</h4>
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Corn • 42 days old</p>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Warning</span>
                <span className="text-xs text-gray-500">45% moisture</span>
              </div>
            </div>

            {/* East Field */}
            <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">East Field</h4>
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Lettuce • 28 days old</p>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Critical</span>
                <span className="text-xs text-gray-500">25% moisture</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
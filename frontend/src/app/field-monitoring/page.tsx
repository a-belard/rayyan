'use client';

import { ArrowLeft, Calendar, Sprout } from 'lucide-react';
import Link from 'next/link';

// Sample field data with crop ages prominently featured
const fieldsData = [
  {
    id: 'field1',
    name: 'North Field',
    crop: 'Tomatoes',
    cropAge: 85, // 85 days old
    location: 'Section A',
  },
  {
    id: 'field2', 
    name: 'South Field',
    crop: 'Corn',
    cropAge: 42, // 42 days old
    location: 'Section B',
  },
  {
    id: 'field3',
    name: 'East Field', 
    crop: 'Lettuce',
    cropAge: 28, // 28 days old
    location: 'Section C',
  }
];

export default function FieldMonitoring() {
  // Helpers to compute months and crop stage from days
  const daysToMonths = (days: number) => {
    const months = Math.floor(days / 30);
    const remDays = days % 30;
    return { months, remDays };
  };

  const getCropStage = (days: number) => {
    // Generic thresholds by days
    // 0-21: Seedling, 22-60: Vegetative, 61-90: Flowering, 91+: Fruiting/Harvest
    if (days <= 21) return { label: 'Seedling', color: 'bg-amber-100 text-amber-800', idx: 0 };
    if (days <= 60) return { label: 'Vegetative', color: 'bg-emerald-100 text-emerald-800', idx: 1 };
    if (days <= 90) return { label: 'Flowering', color: 'bg-purple-100 text-purple-800', idx: 2 };
    return { label: 'Fruiting / Harvest', color: 'bg-blue-100 text-blue-800', idx: 3 };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Field Monitoring</h1>
              <p className="text-gray-600">Monitor your active fields and crop ages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fieldsData.map((field) => (
            <div key={field.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              {/* Field Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{field.name}</h3>
                  <p className="text-gray-600">Growing {field.crop}</p>
                  <p className="text-sm text-gray-500">{field.location}</p>
                </div>
              </div>

              {/* Crop Age Display */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Crop Age</p>
                      <p className="text-2xl font-bold text-green-700">{field.cropAge} days</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {(() => { const m = daysToMonths(field.cropAge); return `≈ ${m.months} mo ${m.remDays} d`; })()}
                      </p>
                    </div>
                  </div>
                  {(() => { const s = getCropStage(field.cropAge); return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${s.color}`}>
                      <Sprout className="w-3.5 h-3.5" /> {s.label}
                    </span>
                  ); })()}
                </div>

                {/* Stage timeline */}
                {(() => { const s = getCropStage(field.cropAge); return (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-600 mb-1">
                      <span>Seedling</span>
                      <span>Vegetative</span>
                      <span>Flowering</span>
                      <span>Harvest</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[0,1,2,3].map(i => (
                        <div key={i} className={`h-1.5 rounded-full ${i <= s.idx ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                      ))}
                    </div>
                  </div>
                ); })()}
              </div>

              {/* Action Button */}
              <Link href="/dashboard" className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-center block">
                View Detailed Dashboard
              </Link>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 Crop Age Information</h3>
          <p className="text-blue-800 mb-4">
            Track the maturity of your crops to optimize harvest timing and care schedules.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {fieldsData.map((f) => {
              const m = Math.floor(f.cropAge / 30);
              const rd = f.cropAge % 30;
              const s = ((): { label: string } => {
                if (f.cropAge <= 21) return { label: 'Seedling' };
                if (f.cropAge <= 60) return { label: 'Vegetative' };
                if (f.cropAge <= 90) return { label: 'Flowering' };
                return { label: 'Fruiting / Harvest' };
              })();
              return (
                <div key={f.id} className="bg-white rounded p-3 border border-blue-200">
                  <strong>{f.crop}:</strong> {f.cropAge} days (≈ {m} mo {rd} d) – {s.label} stage
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Phone, User, Trash2, Edit3, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';

// Define worker farmer interface
interface WorkerFarmer {
  id: string;
  name: string;
  phoneNumber: string;
  preferredLanguage: string;
  assignedFields: string[];
  activeTasks: number;
  status: 'active' | 'inactive';
  joinedDate: string;
}

// Language options for SMS/WhatsApp communication
const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic (العربية)', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi (हिन्दी)', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu (اردو)', flag: '🇵🇰' },
  { code: 'pt', name: 'Portuguese (Português)', flag: '🇧🇷' },
  { code: 'sw', name: 'Swahili (Kiswahili)', flag: '🇰🇪' },
  { code: 'am', name: 'Amharic (አማርኛ)', flag: '🇪🇹' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'zh', name: 'Mandarin (中文)', flag: '🇨🇳' },
  { code: 'ru', name: 'Russian (Русский)', flag: '🇷🇺' }
];

/**
 * Team Management Page Component
 * 
 * Allows head farmers to:
 * - Add new worker farmers by name and phone number
 * - View all registered worker farmers
 * - Edit worker farmer information
 * - Remove worker farmers from the team
 * - Track worker farmer activity and task assignments
 */
export default function TeamManagement() {
  const { t } = useTranslation();
  
  // Check authentication on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      window.location.href = '/login';
      return;
    }
  }, []);

  // State for managing worker farmers list
  const [workerFarmers, setWorkerFarmers] = useState<WorkerFarmer[]>([
    {
      id: 'wf001',
      name: 'Ahmed Hassan',
      phoneNumber: '+1234567890',
      preferredLanguage: 'ar',
      assignedFields: ['North Field', 'South Field'],
      activeTasks: 3,
      status: 'active',
      joinedDate: '2025-09-15'
    },
    {
      id: 'wf002', 
      name: 'Maria Rodriguez',
      phoneNumber: '+1234567891',
      preferredLanguage: 'es',
      assignedFields: ['East Field'],
      activeTasks: 1,
      status: 'active',
      joinedDate: '2025-09-20'
    }
  ]);

  // State for add/edit form
  const [showForm, setShowForm] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<WorkerFarmer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    preferredLanguage: 'en'
  });

  /**
   * Handle input changes in the form
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle form submission for adding/editing worker farmers
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phoneNumber.trim() || !formData.preferredLanguage) {
      alert('Please fill in all fields including language preference');
      return;
    }

    if (editingFarmer) {
      // Update existing farmer
      setWorkerFarmers(prev => prev.map(farmer => 
        farmer.id === editingFarmer.id 
          ? { 
              ...farmer, 
              name: formData.name, 
              phoneNumber: formData.phoneNumber,
              preferredLanguage: formData.preferredLanguage
            }
          : farmer
      ));
    } else {
      // Add new farmer
      const newFarmer: WorkerFarmer = {
        id: `wf${Date.now()}`,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        preferredLanguage: formData.preferredLanguage,
        assignedFields: [],
        activeTasks: 0,
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setWorkerFarmers(prev => [...prev, newFarmer]);
    }

    // Reset form
    setFormData({ name: '', phoneNumber: '', preferredLanguage: 'en' });
    setShowForm(false);
    setEditingFarmer(null);
  };

  /**
   * Handle editing a worker farmer
   */
  const handleEdit = (farmer: WorkerFarmer) => {
    setEditingFarmer(farmer);
    setFormData({
      name: farmer.name,
      phoneNumber: farmer.phoneNumber,
      preferredLanguage: farmer.preferredLanguage
    });
    setShowForm(true);
  };

  /**
   * Handle removing a worker farmer
   */
  const handleRemove = (farmerId: string) => {
    if (confirm('Are you sure you want to remove this worker farmer?')) {
      setWorkerFarmers(prev => prev.filter(farmer => farmer.id !== farmerId));
    }
  };

  /**
   * Cancel form operation
   */
  const handleCancel = () => {
    setFormData({ name: '', phoneNumber: '', preferredLanguage: 'en' });
    setShowForm(false);
    setEditingFarmer(null);
  };

  /**
   * Get language display info
   */
  const getLanguageInfo = (languageCode: string) => {
    return LANGUAGE_OPTIONS.find(lang => lang.code === languageCode) || LANGUAGE_OPTIONS[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/farm-dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users size={28} className="text-blue-600" />
                  {t('team.title')}
                </h1>
                <p className="text-gray-600">{t('team.subtitle')}</p>
              </div>
            </div>
            
            {/* Add new farmer button */}
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={20} />
              {t('team.addWorker')}
            </button>
            
            {/* Language Selector */}
            <LanguageSelector />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Team overview stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('team.totalWorkers')}</p>
                <p className="text-2xl font-bold text-gray-900">{workerFarmers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('team.activeToday')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workerFarmers.filter(f => f.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CheckCircle size={24} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('team.completedTasks')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workerFarmers.reduce((sum, farmer) => sum + farmer.activeTasks, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingFarmer ? 'Edit Worker Farmer' : 'Add New Worker Farmer'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User size={16} className="inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter farmer's full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone size={16} className="inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1234567890"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🌐 Preferred Language for SMS/WhatsApp
                  </label>
                  <select
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {LANGUAGE_OPTIONS.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.flag} {language.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Messages and notifications will be sent in this language
                  </p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editingFarmer ? 'Update' : 'Add'} Worker
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Worker farmers list */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Worker Farmers</h2>
            <p className="text-sm text-gray-600">Manage your team members and their assignments</p>
          </div>
          
          <div className="p-6">
            {workerFarmers.length === 0 ? (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">No worker farmers added yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Worker
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {workerFarmers.map((farmer) => (
                  <div key={farmer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{farmer.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} />
                            {farmer.phoneNumber}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <span>🌐</span>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              {getLanguageInfo(farmer.preferredLanguage).flag} {getLanguageInfo(farmer.preferredLanguage).name}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="text-gray-600">Active Tasks</p>
                          <p className="font-semibold text-blue-600">{farmer.activeTasks}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(farmer)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleRemove(farmer.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {farmer.assignedFields.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600 mb-2">Assigned Fields:</p>
                        <div className="flex flex-wrap gap-2">
                          {farmer.assignedFields.map((field, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
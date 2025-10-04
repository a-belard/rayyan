'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, MapPin, User, Clock, MessageSquare, CheckCircle, AlertTriangle, Phone, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';

// Define task with real-time tracking
interface TrackedTask {
  id: string;
  title: string;
  field: string;
  assignedFarmerName: string;
  assignedFarmerPhone: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dueDate: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  smsHistory: Array<{
    timestamp: string;
    type: 'sent' | 'received';
    message: string;
    status: 'delivered' | 'failed' | 'pending';
  }>;
  location?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  progress: number; // 0-100
  estimatedTimeHours: number;
  actualTimeSpent?: number;
}

/**
 * Real-Time Task Tracker Component
 * 
 * Provides live monitoring of:
 * - Task progress and status updates
 * - SMS communication history 
 * - Worker location tracking (simulated)
 * - Real-time notifications and alerts
 * - Performance analytics and time tracking
 */
export default function TaskTracker() {
  const { t } = useTranslation();
  
  // Check authentication on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      window.location.href = '/login';
      return;
    }
  }, []);

  // State for tracked tasks with real-time updates
  const [trackedTasks, setTrackedTasks] = useState<TrackedTask[]>([
    {
      id: 'track001',
      title: 'Irrigation System Check - North Field',
      field: 'North Field',
      assignedFarmerName: 'Ahmed Hassan',
      assignedFarmerPhone: '+1234567890',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2025-10-03',
      createdAt: '2025-10-03T08:00:00Z',
      startedAt: '2025-10-03T08:30:00Z',
      smsHistory: [
        {
          timestamp: '2025-10-03T08:00:00Z',
          type: 'sent',
          message: 'Task assigned: Check irrigation system in North Field. Due today by 5 PM. Reply with progress updates.',
          status: 'delivered'
        },
        {
          timestamp: '2025-10-03T08:35:00Z',
          type: 'received',
          message: 'Starting irrigation check now',
          status: 'delivered'
        },
        {
          timestamp: '2025-10-03T09:15:00Z',
          type: 'received',
          message: 'Found 2 blocked sprinklers, cleaning them',
          status: 'delivered'
        }
      ],
      location: {
        lat: 40.7128,
        lng: -74.0060,
        timestamp: '2025-10-03T09:20:00Z'
      },
      progress: 65,
      estimatedTimeHours: 2,
      actualTimeSpent: 0.75
    },
    {
      id: 'track002',
      title: 'Pest Inspection - Tomato Crops',
      field: 'South Field',
      assignedFarmerName: 'Maria Rodriguez',
      assignedFarmerPhone: '+1234567891',
      priority: 'medium',
      status: 'completed',
      dueDate: '2025-10-03',
      createdAt: '2025-10-03T07:00:00Z',
      startedAt: '2025-10-03T07:30:00Z',
      completedAt: '2025-10-03T09:00:00Z',
      smsHistory: [
        {
          timestamp: '2025-10-03T07:00:00Z',
          type: 'sent',
          message: 'Please inspect tomato plants for pest damage. Take photos of any issues found.',
          status: 'delivered'
        },
        {
          timestamp: '2025-10-03T07:32:00Z',
          type: 'received',
          message: 'Starting inspection',
          status: 'delivered'
        },
        {
          timestamp: '2025-10-03T08:45:00Z',
          type: 'received',
          message: 'Found minor aphid activity on 3 plants, applied organic spray',
          status: 'delivered'
        },
        {
          timestamp: '2025-10-03T09:00:00Z',
          type: 'received',
          message: 'done ✓ All plants inspected, treatment applied',
          status: 'delivered'
        }
      ],
      progress: 100,
      estimatedTimeHours: 1.5,
      actualTimeSpent: 1.5
    },
    {
      id: 'track003',
      title: 'Fertilizer Application - Corn Field',
      field: 'East Field',
      assignedFarmerName: 'John Smith',
      assignedFarmerPhone: '+1234567892',
      priority: 'high',
      status: 'overdue',
      dueDate: '2025-10-02',
      createdAt: '2025-10-02T06:00:00Z',
      smsHistory: [
        {
          timestamp: '2025-10-02T06:00:00Z',
          type: 'sent',
          message: 'Apply organic fertilizer to corn crops in East Field. Due by end of day.',
          status: 'delivered'
        },
        {
          timestamp: '2025-10-03T08:00:00Z',
          type: 'sent',
          message: 'REMINDER: Fertilizer task is overdue. Please complete ASAP.',
          status: 'delivered'
        }
      ],
      progress: 0,
      estimatedTimeHours: 3,
      actualTimeSpent: 0
    }
  ]);

  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Filter and view state
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const [selectedTask, setSelectedTask] = useState<TrackedTask | null>(null);

  /**
   * Simulate real-time updates
   */
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdated(new Date());
      
      // Simulate task progress updates
      setTrackedTasks(prev => prev.map(task => {
        if (task.status === 'in-progress' && task.progress < 100) {
          // Randomly increment progress for demonstration
          const newProgress = Math.min(100, task.progress + Math.random() * 5);
          const newActualTime = task.actualTimeSpent ? task.actualTimeSpent + 0.1 : 0.1;
          
          return {
            ...task,
            progress: newProgress,
            actualTimeSpent: newActualTime,
            ...(newProgress >= 100 && {
              status: 'completed' as const,
              completedAt: new Date().toISOString(),
              smsHistory: [
                ...task.smsHistory,
                {
                  timestamp: new Date().toISOString(),
                  type: 'received' as const,
                  message: 'Task completed successfully ✓',
                  status: 'delivered' as const
                }
              ]
            })
          };
        }
        return task;
      }));
    }, 10000); // Update every 10 seconds for demo

    return () => clearInterval(interval);
  }, [autoRefresh]);

  /**
   * Handle manual refresh
   */
  const handleRefresh = () => {
    setLastUpdated(new Date());
    // In real app, this would fetch fresh data from API
  };

  /**
   * Filter tasks based on active filter
   */
  const filteredTasks = trackedTasks.filter(task => {
    switch (activeFilter) {
      case 'active': return task.status === 'in-progress' || task.status === 'pending';
      case 'completed': return task.status === 'completed';
      case 'overdue': return task.status === 'overdue';
      default: return true;
    }
  });

  /**
   * Get status color and icon
   */
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return { 
          color: 'text-green-600 bg-green-100', 
          icon: <CheckCircle size={16} />,
          text: 'Completed'
        };
      case 'in-progress':
        return { 
          color: 'text-blue-600 bg-blue-100', 
          icon: <Clock size={16} />,
          text: 'In Progress'
        };
      case 'pending':
        return { 
          color: 'text-yellow-600 bg-yellow-100', 
          icon: <Clock size={16} />,
          text: 'Pending'
        };
      case 'overdue':
        return { 
          color: 'text-red-600 bg-red-100', 
          icon: <AlertTriangle size={16} />,
          text: 'Overdue'
        };
      default:
        return { 
          color: 'text-gray-600 bg-gray-100', 
          icon: <Clock size={16} />,
          text: 'Unknown'
        };
    }
  };

  /**
   * Format time difference
   */
  const formatTimeDiff = (timestamp: string): string => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/farm-dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle size={28} className="text-blue-600" />
                  Real-Time Task Tracker
                </h1>
                <p className="text-gray-600">Monitor task progress and farmer communication</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  Auto-refresh
                </label>
              </div>
              
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Real-time stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Tasks</p>
                <p className="text-xl font-bold text-gray-900">
                  {trackedTasks.filter(t => t.status === 'in-progress' || t.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-xl font-bold text-gray-900">
                  {trackedTasks.filter(t => t.status === 'completed' && 
                    t.completedAt && new Date(t.completedAt).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-xl font-bold text-gray-900">
                  {trackedTasks.filter(t => t.status === 'overdue').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MessageSquare size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">SMS Sent Today</p>
                <p className="text-xl font-bold text-gray-900">
                  {trackedTasks.reduce((acc, task) => 
                    acc + task.smsHistory.filter(sms => 
                      sms.type === 'sent' && 
                      new Date(sms.timestamp).toDateString() === new Date().toDateString()
                    ).length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {(['all', 'active', 'completed', 'overdue'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter} ({trackedTasks.filter(task => {
                  switch (filter) {
                    case 'active': return task.status === 'in-progress' || task.status === 'pending';
                    case 'completed': return task.status === 'completed';
                    case 'overdue': return task.status === 'overdue';
                    default: return true;
                  }
                }).length})
              </button>
            ))}
          </div>
        </div>

        {/* Tasks grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredTasks.map((task) => {
            const statusDisplay = getStatusDisplay(task.status);
            
            return (
              <div key={task.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Task header */}
                <div className="p-4 border-b">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                      {statusDisplay.icon}
                      {statusDisplay.text}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      {task.field}
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      {task.assignedFarmerName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone size={14} />
                      {task.assignedFarmerPhone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {task.status === 'in-progress' && (
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">{Math.round(task.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Time tracking */}
                <div className="px-4 py-3 border-b">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Estimated:</span>
                      <span className="ml-1 font-medium">{task.estimatedTimeHours}h</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Actual:</span>
                      <span className="ml-1 font-medium">
                        {task.actualTimeSpent ? `${task.actualTimeSpent.toFixed(1)}h` : '0h'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SMS communication */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare size={16} className="text-blue-600" />
                    <span className="font-medium text-gray-900">Communication</span>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {task.smsHistory.slice(-3).map((sms, index) => (
                      <div key={index} className={`text-xs p-2 rounded-lg ${
                        sms.type === 'sent' 
                          ? 'bg-blue-50 border-l-2 border-blue-300' 
                          : 'bg-green-50 border-l-2 border-green-300'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {sms.type === 'sent' ? 'Sent' : 'Received'}
                          </span>
                          <span className="text-gray-500">
                            {formatTimeDiff(sms.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-700">{sms.message}</p>
                      </div>
                    ))}
                  </div>
                  
                  {task.smsHistory.length > 3 && (
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                    >
                      View all messages ({task.smsHistory.length})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No tasks found for the selected filter</p>
            <Link 
              href="/tasks" 
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Task
            </Link>
          </div>
        )}

        {/* Task detail modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{selectedTask.title}</h2>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold mb-4">Complete SMS History</h3>
                <div className="space-y-3">
                  {selectedTask.smsHistory.map((sms, index) => (
                    <div key={index} className={`p-3 rounded-lg ${
                      sms.type === 'sent' 
                        ? 'bg-blue-50 border-l-4 border-blue-300' 
                        : 'bg-green-50 border-l-4 border-green-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {sms.type === 'sent' ? 'Sent to farmer' : 'Received from farmer'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(sms.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{sms.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
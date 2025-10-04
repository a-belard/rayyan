'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Calendar, MapPin, User, Clock, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';

// Define task interface
interface Task {
  id: string;
  title: string;
  description: string;
  field: string;
  assignedTo: string;
  assignedFarmerName: string;
  assignedFarmerPhone: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dueDate: string;
  createdDate: string;
  completedDate?: string;
  smsStatus: 'sent' | 'delivered' | 'responded' | 'failed';
  responseMessage?: string;
  estimatedTime: string; // in hours
}

// Sample worker farmers data (in real app, this would come from API)
const workerFarmers = [
  { id: 'wf001', name: 'Ahmed Hassan', phone: '+1234567890' },
  { id: 'wf002', name: 'Maria Rodriguez', phone: '+1234567891' },
  { id: 'wf003', name: 'John Smith', phone: '+1234567892' }
];

// Available fields (from dashboard context)
const availableFields = ['North Field', 'South Field', 'East Field', 'West Field'];

/**
 * Tasks Management Page Component
 * 
 * Allows head farmers to:
 * - Create new tasks and assign to worker farmers
 * - Track task progress and completion status
 * - Monitor SMS notifications and responses
 * - View task history and analytics
 */
export default function TasksManagement() {
  const { t } = useTranslation();
  
  // Check authentication on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      window.location.href = '/login';
      return;
    }
  }, []);

  // State for managing tasks
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task001',
      title: 'Irrigation System Check',
      description: 'Check all sprinkler heads in North Field for proper water pressure and coverage',
      field: 'North Field',
      assignedTo: 'wf001',
      assignedFarmerName: 'Ahmed Hassan',
      assignedFarmerPhone: '+1234567890',
      priority: 'high',
      status: 'completed',
      dueDate: '2025-10-03',
      createdDate: '2025-10-02',
      completedDate: '2025-10-03',
      smsStatus: 'responded',
      responseMessage: 'done ✓',
      estimatedTime: '2'
    },
    {
      id: 'task002',
      title: 'Pest Inspection',
      description: 'Visual inspection of tomato plants for early signs of pest damage or disease',
      field: 'South Field',
      assignedTo: 'wf002',
      assignedFarmerName: 'Maria Rodriguez',
      assignedFarmerPhone: '+1234567891',
      priority: 'medium',
      status: 'in-progress',
      dueDate: '2025-10-04',
      createdDate: '2025-10-02',
      smsStatus: 'delivered',
      estimatedTime: '1.5'
    }
  ]);

  // State for create task form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    field: '',
    assignedTo: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    estimatedTime: ''
  });

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');

  /**
   * Handle form input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle task creation
   */
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskForm.title || !taskForm.field || !taskForm.assignedTo || !taskForm.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    const assignedFarmer = workerFarmers.find(f => f.id === taskForm.assignedTo);
    if (!assignedFarmer) return;

    const newTask: Task = {
      id: `task${Date.now()}`,
      title: taskForm.title,
      description: taskForm.description,
      field: taskForm.field,
      assignedTo: taskForm.assignedTo,
      assignedFarmerName: assignedFarmer.name,
      assignedFarmerPhone: assignedFarmer.phone,
      priority: taskForm.priority,
      status: 'pending',
      dueDate: taskForm.dueDate,
      createdDate: new Date().toISOString().split('T')[0],
      smsStatus: 'sent', // Simulate SMS sent
      estimatedTime: taskForm.estimatedTime
    };

    setTasks(prev => [newTask, ...prev]);
    
    // Reset form and close modal
    setTaskForm({
      title: '',
      description: '',
      field: '',
      assignedTo: '',
      priority: 'medium',
      dueDate: '',
      estimatedTime: ''
    });
    setShowCreateForm(false);

    // Simulate SMS notification
    alert(`SMS sent to ${assignedFarmer.name} (${assignedFarmer.phone}): "New task assigned: ${newTask.title} in ${newTask.field}. Due: ${newTask.dueDate}. Reply 'done' when completed."`);
  };

  /**
   * Simulate task completion response from farmer
   */
  const handleSimulateResponse = (taskId: string, response: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: 'completed' as const,
            completedDate: new Date().toISOString().split('T')[0],
            smsStatus: 'responded' as const,
            responseMessage: response
          }
        : task
    ));
  };

  /**
   * Get filtered tasks based on status
   */
  const filteredTasks = statusFilter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === statusFilter);

  /**
   * Get priority color classes
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  /**
   * Get status color classes
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
                  <CheckCircle size={28} className="text-green-600" />
                  {t('tasks.title')}
                </h1>
                <p className="text-gray-600">{t('tasks.subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Plus size={20} />
                {t('tasks.createTask')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Task overview stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-xl font-bold text-gray-900">{tasks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'in-progress').length}
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
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status filter */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('in-progress')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'in-progress'
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Create Task Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-xl font-bold mb-4">Create New Task</h2>
              
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={taskForm.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Irrigation System Check"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={taskForm.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Detailed task instructions..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field *
                    </label>
                    <select
                      name="field"
                      value={taskForm.field}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Field</option>
                      {availableFields.map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign to Worker *
                    </label>
                    <select
                      name="assignedTo"
                      value={taskForm.assignedTo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Worker</option>
                      {workerFarmers.map(farmer => (
                        <option key={farmer.id} value={farmer.id}>
                          {farmer.name} ({farmer.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={taskForm.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={taskForm.dueDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Time (hours)
                    </label>
                    <input
                      type="number"
                      name="estimatedTime"
                      value={taskForm.estimatedTime}
                      onChange={handleInputChange}
                      step="0.5"
                      min="0.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="2.5"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Create Task & Send SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tasks list */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {statusFilter === 'all' ? 'All Tasks' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Tasks`}
            </h2>
          </div>
          
          <div className="p-6">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">No tasks found</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Your First Task
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            {task.field}
                          </div>
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            {task.assignedFarmerName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            Due: {task.dueDate}
                          </div>
                          {task.estimatedTime && (
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              {task.estimatedTime}h
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* SMS Status and Response */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <MessageSquare size={14} className="text-blue-600" />
                            <span className="text-sm text-gray-600">
                              SMS: <span className="font-medium">{task.smsStatus}</span>
                            </span>
                          </div>
                          
                          {task.responseMessage && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-green-600 font-medium">
                                Response: "{task.responseMessage}"
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Simulate response for pending/in-progress tasks */}
                        {(task.status === 'pending' || task.status === 'in-progress') && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSimulateResponse(task.id, 'done ✓')}
                              className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                            >
                              Simulate "done" response
                            </button>
                            <button
                              onClick={() => handleSimulateResponse(task.id, '+')}
                              className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                            >
                              Simulate "+" response
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
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
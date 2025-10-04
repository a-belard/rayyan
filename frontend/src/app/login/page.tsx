// Enable client-side functionality for form handling
'use client';

// Import necessary React hooks and components
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../components/LanguageSelector';

/**
 * Login page component for FarmWise platform
 * Provides secure authentication for existing farmers
 * Features: Email/password form, navigation links, responsive design
 */
export default function Login() {
  const { t } = useTranslation();
  
  // State management for login form data
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const router = useRouter();

  // Handle input field changes and update form state
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission and authentication
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sample credentials for demo
    const sampleCredentials = {
      email: 'farmer@farmwise.com',
      password: 'farm123'
    };
    
    // For demo purposes, accept any email/password combination
    if (formData.email && formData.password) {
      // Clear any existing storage first
      localStorage.clear();
      
      // Store login state in localStorage for demo purposes
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', formData.email);
      
      // Debug log to confirm redirect
      console.log('Login successful, redirecting to farm dashboard...');
      
      // Redirect to main farm dashboard (not field data dashboard)
      router.push('/farm-dashboard');
    } else {
      alert('Please enter both email and password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        
        {/* Back to Home Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('navigation.backToDashboard')}
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-green-800 mb-2">{t('auth.login.title')}</div>
            <p className="text-gray-600">{t('auth.login.description')}</p>
          </div>

          {/* Sample Credentials Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Demo Credentials:</h4>
            <div className="text-sm text-blue-700">
              <p><strong>{t('auth.login.form.email')}:</strong> farmer@farmwise.com</p>
              <p><strong>{t('auth.login.form.password')}:</strong> farm123</p>
              <p className="mt-1 text-xs">{t('auth.login.form.demoNote')}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('auth.login.form.email')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder={t('auth.login.form.emailPlaceholder')}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('auth.login.form.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder={t('auth.login.form.passwordPlaceholder')}
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                href="/forgot-password" 
                className="text-sm text-green-600 hover:text-green-700 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors transform hover:scale-105 shadow-lg"
            >
              {t('auth.login.form.submit')}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link 
                href="/register" 
                className="text-green-600 hover:text-green-700 font-semibold transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6 text-sm text-gray-500">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-green-600 hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
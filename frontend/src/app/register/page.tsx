// Enable client-side functionality for complex form handling
'use client'

// Import necessary React hooks and components
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '@/components/LanguageSelector'

/**
 * Registration page component for FarmWise platform
 * Simplified user registration form for basic account creation
 * Features: Personal information and account security setup
 */
export default function RegisterPage() {
  const { t } = useTranslation();
  
  // Simplified form state management - basic user registration
  const [formData, setFormData] = useState({
    // User identification and authentication
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  // Handle input changes for various form field types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    // Handle checkbox inputs differently from text inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }



  // Form submission with validation and backend integration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side password validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    
    // TODO: Connect to FastAPI backend for user registration
    console.log('Registration data:', formData)
    alert('Registration submitted! (Backend integration pending)')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
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
          {t('navigation.backToHome')}
        </Link>

        {/* Header section with platform branding */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-green-800 mb-6">
            {t('auth.register.title')}
          </h1>
          <p className="text-xl text-gray-700 max-w-xl mx-auto">
            {t('auth.register.description')}
          </p>
        </div>

        {/* Registration form - Single column design */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl p-8">
          
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">{t('auth.register.form.personalInfo')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.register.form.fullName')} *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder={t('auth.register.form.fullNamePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.register.form.email')} *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder={t('auth.register.form.emailPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.register.form.phone')} *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder={t('auth.register.form.phonePlaceholder')}
                />
              </div>
            </div>
          </div>





          {/* Password Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">{t('auth.register.form.accountSecurity')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.register.form.password')} *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder={t('auth.register.form.passwordPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.register.form.confirmPassword')} *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder={t('auth.register.form.confirmPasswordPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={!formData.fullName || !formData.email || !formData.password}
              className="w-full bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
            >
              {t('auth.register.form.submit')}
            </button>
            
            <p className="text-sm text-gray-600 mt-6">
              {t('auth.register.form.agreement')}
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
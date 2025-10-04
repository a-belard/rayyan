'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', rtl: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
];

interface LanguageSelectorProps {
  className?: string;
}

export default function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherLanguage, setOtherLanguage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Update document direction based on language
    const currentLang = languages.find(lang => lang.code === i18n.language);
    if (currentLang?.rtl) {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = i18n.language;
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
    setIsOpen(false);
    setShowOtherInput(false);
  };

  const handleOtherLanguage = () => {
    setShowOtherInput(true);
    setIsOpen(false);
  };

  const handleOtherLanguageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otherLanguage.trim()) {
      // For demo purposes, we'll just show an alert
      // In a real app, you'd handle this by adding the language to your i18n config
      alert(`Language "${otherLanguage}" has been noted. We'll work on adding support for it!`);
      setOtherLanguage('');
      setShowOtherInput(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/90 hover:bg-white border border-gray-200 rounded-lg transition-colors text-sm"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-gray-700">{currentLanguage.nativeName}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                {t('languages.selectLanguage')}
              </div>
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {language.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {language.nativeName}
                    </span>
                  </div>
                  {currentLanguage.code === language.code && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </button>
              ))}
              
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleOtherLanguage}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors text-sm text-gray-700"
                >
                  <Globe className="w-4 h-4 mr-2 text-gray-500" />
                  {t('languages.other')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showOtherInput && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-30" 
            onClick={() => setShowOtherInput(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-40 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              {t('languages.specifyLanguage')}
            </h3>
            <form onSubmit={handleOtherLanguageSubmit}>
              <input
                type="text"
                value={otherLanguage}
                onChange={(e) => setOtherLanguage(e.target.value)}
                placeholder="Enter your preferred language"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                >
                  {t('common.confirm')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOtherInput(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
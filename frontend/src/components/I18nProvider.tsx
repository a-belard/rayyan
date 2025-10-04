'use client';

import { useEffect } from 'react';
import '../lib/i18n'; // Initialize i18n

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Any client-side i18n setup can go here
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      // The language will be set automatically by i18next language detector
    }
  }, []);

  return <>{children}</>;
}
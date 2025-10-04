'use client';

import Link from "next/link";
import { Droplets, Sprout, BarChart3, User, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../components/LanguageSelector";

export default function Home() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
      <nav className="flex justify-between items-center p-6 bg-white/80 backdrop-blur-sm border-b border-green-100">
        <div className="text-2xl font-bold text-green-800">
          {t('navigation.farmwise')}
        </div>
        <div className="flex gap-4 items-center">
          <LanguageSelector />
          <Link 
            href="/login" 
            className="flex items-center gap-2 text-green-700 hover:text-green-900 font-medium transition-colors"
          >
            <User size={20} />
            {t('navigation.login')}
          </Link>
          <Link 
            href="/register" 
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            {t('navigation.getStarted')}
          </Link>
        </div>
      </nav>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-green-900 mb-8">
            {t('homepage.title.main')}
            <span className="text-blue-700 block">{t('homepage.title.subtitle')}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            AI-driven agricultural advisory platform that helps farmers optimize irrigation,
            plan fertilization effectively, and maximize crop yields with real-time insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/register"
              className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
            >
              {t('homepage.cta.primary')}
            </Link>
            <button className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-50 transition-all">
              {t('homepage.cta.secondary')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <Droplets className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">{t('homepage.features.irrigation.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('homepage.features.irrigation.description')}
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <Sprout className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Fertilization</h3>
              <p className="text-gray-600 leading-relaxed">
                Plan nutrient schedules and optimize fertilizer application for healthier, higher-yield crops.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <BarChart3 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">{t('homepage.features.dataAnalytics.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('homepage.features.dataAnalytics.description')}
              </p>
            </div>

            {/* Field Monitoring entry */}
            <Link href="/field-monitoring" className="block">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex justify-center mb-4">
                  <Eye className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Field Monitoring</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track crop stages, age in months and days, and field health at a glance.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-green-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t('homepage.callToAction.title')}
          </h2>
          <p className="text-xl mb-10 opacity-90">
            {t('homepage.callToAction.description')}
          </p>
          
          <Link 
            href="/register"
            className="bg-white text-green-800 px-10 py-4 rounded-xl text-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg inline-block"
          >
            {t('homepage.callToAction.button')}
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="text-2xl font-bold mb-4">{t('navigation.farmwise')}</div>
          <p className="text-gray-400 mb-6">
            {t('homepage.footer.description')}
          </p>
          <div className="mt-6 pt-6 border-t border-gray-800 text-gray-500 text-sm">
            {t('homepage.footer.copyright')}
          </div>
        </div>
      </footer>
    </div>
  );
}

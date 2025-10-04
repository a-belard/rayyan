// Enable client-side functionality for form handling
"use client";

// Import necessary React hooks and components
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Lock, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../components/LanguageSelector";
import { authApi, usersApi } from "@/lib/api";

/**
 * Login page component for FarmWise platform
 * Provides secure authentication for existing farmers
 * Features: Email/password form, navigation links, responsive design
 */
export default function Login() {
  const { t } = useTranslation();

  // State management for login form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Handle input field changes and update form state
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null); // Clear error on input change
  };

  // Handle form submission and authentication
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Login via backend API
      const loginResponse = await authApi.login(
        formData.email,
        formData.password
      );

      // Get user profile
      const user = await usersApi.getMe();

      // Store user info in localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.full_name || user.email);

      // Redirect to farm dashboard
      router.push("/farm-dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setIsLoading(false);
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
          {t("navigation.backToDashboard")}
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-green-800 mb-2">
              {t("auth.login.title")}
            </div>
            <p className="text-gray-600">{t("auth.login.description")}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {t("auth.login.form.email")}
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
                  placeholder={t("auth.login.form.emailPlaceholder")}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {t("auth.login.form.password")}
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
                  placeholder={t("auth.login.form.passwordPlaceholder")}
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
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Logging in..." : t("auth.login.form.submit")}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{" "}
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
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-green-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-green-600 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * Protected Route Wrapper
 * Checks if user is authenticated before rendering children
 * Redirects to login page if not authenticated
 */
export default function ProtectedRoute({
  children,
  requireAuth = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthToken();
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      if (requireAuth && (!token || !isLoggedIn)) {
        // User is not authenticated, redirect to login
        router.push("/login");
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [requireAuth, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized && requireAuth) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

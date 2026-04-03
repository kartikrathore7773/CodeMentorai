"use client";
import { useEffect, useState } from "react";
import { apiGet } from "./api";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    // Check if token exists in localStorage first
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiGet("/api/auth/me");
      if (!res.ok) {
        setUser(null);
      } else {
        const j = await res.json();
        setUser(j.user || null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const clearUser = () => {
    setUser(null);
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();

    // Listen for auth changes
    const handleAuthChange = (event: CustomEvent) => {
      // If it's a logout event, immediately clear user
      if (event.detail?.type === "logout") {
        clearUser();
      } else {
        // For login or other auth changes, refetch user data
        fetchUser();
      }
    };

    window.addEventListener("auth-change", handleAuthChange as EventListener);
    return () => {
      window.removeEventListener(
        "auth-change",
        handleAuthChange as EventListener,
      );
    };
  }, []);

  return { user, loading };
}

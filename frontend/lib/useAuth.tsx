"use client";
import { useEffect, useState } from "react";
import api from "./api";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    // Check if token exists in localStorage first
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      console.log("useAuth: No token in localStorage");
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      console.log("useAuth: Fetching user data from API");
      const res = await api.get("/auth/me");
      console.log("useAuth: API response", res.data);

      if (res.data.success && res.data.user) {
        console.log("useAuth: User authenticated", res.data.user);
        setUser(res.data.user);
      } else {
        console.log("useAuth: Auth failed or no user data");
        setUser(null);
      }
    } catch (err) {
      console.log("useAuth: API call failed", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const clearUser = () => {
    console.log("useAuth: Clearing user data");
    setUser(null);
    setLoading(false);
  };

  useEffect(() => {
    console.log("useAuth: Initializing, fetching user data");
    fetchUser();

    // Listen for auth changes
    const handleAuthChange = (event: CustomEvent) => {
      console.log("useAuth: Auth change event received", event.detail);
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

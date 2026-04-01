"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/useAuth";

export default function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div>Loading...</div>;
  if (!user) {
    if (typeof window !== "undefined") router.push("/auth/login");
    return null;
  }

  return <>{children}</>;
}

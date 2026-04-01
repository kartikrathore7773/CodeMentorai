"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiGet } from "../../../../lib/api";

export default function VerifyPage() {
  const params = useParams() as { token?: string };
  const token = params?.token || "";
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await apiGet(`/api/auth/verify-email/${token}`);
        const j = await res.json();
        if (res.ok) {
          setMessage(j.message || "Email verified successfully");
          // give user a clear action instead of immediate redirect
          // auto-redirect after short grace for convenience
          setTimeout(() => router.push("/auth/login"), 2500);
        } else {
          setMessage(j.message || "Invalid or expired token");
        }
      } catch (err: any) {
        setMessage(err.message || "Verification failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, router]);

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Verify Email</h1>
      {loading ? (
        <div>Verifying...</div>
      ) : (
        <div>
          <p className="mb-4">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/auth/login")}
              className="btn-cta"
            >
              Go to Login
            </button>
            <button
              onClick={() => router.push("/auth/resend")}
              className="btn-secondary"
            >
              Resend Verification
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

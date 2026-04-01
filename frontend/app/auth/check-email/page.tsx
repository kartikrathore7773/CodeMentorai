"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CheckEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post("/auth/check-email", { email });
      setMessage(
        res.data.message || "Verification email sent. Check your inbox.",
      );
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || "Failed to send verification email",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Check your email</h1>
      <p className="mb-6">
        Enter your email address below to receive a verification link.
      </p>

      <form onSubmit={sendVerification} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="w-full p-2 border rounded"
            placeholder="Enter your email"
          />
        </div>
        <button disabled={loading} type="submit" className="w-full btn-cta">
          {loading ? "Sending..." : "Send Verification Email"}
        </button>
      </form>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          {message}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/auth/login")}
          className="btn-secondary flex-1"
        >
          Go to Login
        </button>
        <button
          onClick={() => router.push("/auth/resend")}
          className="btn-secondary flex-1"
        >
          Resend Page
        </button>
      </div>
    </div>
  );
}
// Note: keep a single default export (CheckEmailPage) to avoid Next.js build error

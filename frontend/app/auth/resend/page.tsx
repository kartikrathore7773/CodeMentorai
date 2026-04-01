"use client";
import React, { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ResendPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post("/auth/resend-verification", { email });
      setMessage(
        res.data.message || "Verification email sent. Check your inbox.",
      );
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || "Failed to resend verification",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Resend Verification</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="w-full"
          />
        </div>
        <div>
          <button disabled={loading} type="submit" className="btn-cta">
            {loading ? "Sending..." : "Resend Email"}
          </button>
        </div>
        {message && <div className="mt-2">{message}</div>}
      </form>

      <div className="mt-4">
        <button
          onClick={() => router.push("/auth/login")}
          className="btn-secondary"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

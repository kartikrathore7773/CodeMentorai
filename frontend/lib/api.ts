export async function apiFetch(path: string, opts: RequestInit = {}) {
  const baseUrlRaw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const base = baseUrlRaw.replace(/\/$/, "");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) || {}),
  };

  // Add token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const merged: RequestInit = {
    ...opts,
    credentials: "include",
    headers,
  };

  const res = await fetch(base + path, merged);
  return res;
}

export async function apiGet(path: string) {
  return apiFetch(path, { method: "GET" });
}

export async function apiPost(path: string, body: any) {
  return apiFetch(path, { method: "POST", body: JSON.stringify(body) });
}
import axios from "axios";
// import toast from "react-hot-toast";

const baseUrlRaw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const api = axios.create({
  baseURL: baseUrlRaw.replace(/\/$/, "") + "/api",
  withCredentials: true, // ⭐ COOKIE SEND KARNE KE LIYE
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

/* ---------------- REQUEST INTERCEPTOR ---------------- */
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// ✅ Interceptor: NO redirect, only logging
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("401 from API:", err.config?.url, err.response?.data);
    }
    return Promise.reject(err);
  },
);
export default api;

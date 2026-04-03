"use client";

import { Button, TextInput } from "flowbite-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import api from "@/lib/api";
import AbstractBackground from "@/components/AbstractBackground";
import PasswordStrength from "@/components/PasswordStrength";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  useEffect(() => setMounted(true), []);

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/api/auth/me");
        if (res.data.success) {
          const role = res.data.user.role;
          if (role === "admin") {
            router.push("/admin");
          } else {
            router.push("/");
          }
        }
      } catch (err) {
        // Not authenticated, stay on signup page
      }
    };
    checkAuth();
  }, [router]);
  const validateForm = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};

    if (!form.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const res = await api.post("/auth/signup", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      if (res.data.success) {
        toast.success("Account created 🎉 Check your email to verify");
        router.push("/auth/check-email");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Signup failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-[#0b0d17]">
      <AbstractBackground />

      {/* THEME TOGGLE */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="absolute top-4 right-4 z-20 text-xs sm:text-sm px-3 py-1 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur"
      >
        {mounted ? (theme === "dark" ? "🌞 Light" : "🌙 Dark") : null}
      </button>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm sm:max-w-md"
        >
          <div className="rounded-3xl bg-white/90 dark:bg-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
            {/* HEADER */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-1">
              CodeMentor AI<span className="text-indigo-500">.</span>
            </h1>
            <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-300 mb-6">
              Build • Learn • Ship faster
            </p>

            {/* GOOGLE LOGIN (only when client id present) */}
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && mounted ? (
              <div className="w-full">
                <GoogleLogin
                  onSuccess={async (res) => {
                    try {
                      const response = await api.post("/auth/google", {
                        token: res.credential,
                      });
                      toast.success("Signed in with Google 🚀");
                      const role = response.data.user?.role;
                      if (role === "admin") {
                        router.push("/admin");
                      } else {
                        router.push("/");
                      }
                    } catch (err: any) {
                      toast.error("Google signup failed");
                    }
                  }}
                  onError={() => toast.error("Google signup failed")}
                  width="100%"
                />
              </div>
            ) : null}

            {/* DIVIDER */}
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300 dark:bg-white/20" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-300 dark:bg-white/20" />
            </div>

            {/* FORM */}
            <div className="space-y-4">
              <div>
                <TextInput
                  placeholder="Full Name"
                  sizing="lg"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  color={errors.name ? "failure" : undefined}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <TextInput
                  type="email"
                  placeholder="Email address"
                  sizing="lg"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  color={errors.email ? "failure" : undefined}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <TextInput
                  type="password"
                  placeholder="Password"
                  sizing="lg"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  color={errors.password ? "failure" : undefined}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
                <PasswordStrength password={form.password} />
              </div>
            </div>

            {/* BUTTON */}
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                onClick={submit}
                disabled={isLoading}
                className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </motion.div>

            {/* FOOTER */}
            <p className="mt-5 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-300">
              Already part of CodeMentor AI?{" "}
              <a
                href="/auth/login"
                className="text-indigo-500 font-medium hover:underline"
              >
                Login
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

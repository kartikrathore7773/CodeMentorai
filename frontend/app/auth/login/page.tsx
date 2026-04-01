"use client";

import { Button, TextInput, Checkbox, Label } from "flowbite-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import AbstractBackground from "@/components/AbstractBackground";
import { GoogleLogin } from "@react-oauth/google";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [showVerifyMessage, setShowVerifyMessage] = useState(false);

  useEffect(() => setMounted(true), []);

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data.success) {
          const role = res.data.user.role;
          if (role === "admin") {
            router.push("/admin");
          } else {
            router.push("/");
          }
        }
      } catch (err) {
        // Not authenticated, stay on login page
      }
    };
    checkAuth();
  }, [router]);

  const submit = async () => {
    if (!form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const res = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      if (res.data.success) {
        const { user, token } = res.data;

        // ✅ TOKEN + ROLE SAVE
        localStorage.setItem("token", token);
        localStorage.setItem("role", user.role);

        // Dispatch custom event to notify other components of login
        window.dispatchEvent(new CustomEvent("auth-change"));

        toast.success("Welcome back to CodeMentor AI 🚀");

        if (user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Login failed";

      if (message === "Please verify your email first") {
        setShowVerifyMessage(true);
        toast.error("Please verify your email before logging in");
      } else {
        toast.error(message);
        setShowVerifyMessage(false);
      }

      // Clear password on error
      setForm((prev) => ({ ...prev, password: "" }));
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
        className="absolute top-4 right-4 z-20 text-xs sm:text-sm px-3 py-1 rounded-full 
        bg-black/10 dark:bg-white/10 backdrop-blur-md"
      >
        {mounted ? (theme === "dark" ? "🌞 Light" : "🌙 Dark") : null}
      </button>

      {/* CONTENT */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          whileHover={{ scale: 1.01 }}
          className="w-full max-w-sm sm:max-w-md"
        >
          {/* GLASS CARD */}
          <div
            className="rounded-3xl bg-white/90 dark:bg-white/10 backdrop-blur-xl 
            p-6 sm:p-8 shadow-[0_0_80px_rgba(99,102,241,0.25)] 
            border border-white/20"
          >
            {/* BRAND */}
            <div className="text-center mb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-black dark:text-white">
                CodeMentor AI<span className="text-indigo-500">.</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                Welcome back. Let’s continue building.
              </p>
            </div>

            {/* GOOGLE LOGIN (only when client id present) */}
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && mounted ? (
              <div className="mb-4">
                <GoogleLogin
                  onSuccess={async (res) => {
                    try {
                      const response = await api.post("/auth/google", {
                        token: res.credential,
                      });

                      // Save token and role
                      localStorage.setItem("token", response.data.token);
                      localStorage.setItem("role", response.data.user.role);

                      // Dispatch custom event to notify other components of login
                      window.dispatchEvent(new CustomEvent("auth-change"));

                      toast.success("Logged in with Google 🚀");
                      const role = response.data.user?.role;
                      if (role === "admin") {
                        router.push("/admin");
                      } else {
                        router.push("/");
                      }
                    } catch (err: any) {
                      toast.error("Google login failed");
                    }
                  }}
                  onError={() => toast.error("Google login failed")}
                  width="100%"
                />
              </div>
            ) : null}

            {/* DIVIDER */}
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300 dark:bg-white/20" />
              <span className="text-xs text-gray-500 dark:text-gray-300">
                OR
              </span>
              <div className="flex-1 h-px bg-gray-300 dark:bg-white/20" />
            </div>

            {/* FORM */}
            <div className="space-y-4">
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
              </div>
            </div>

            {/* REMEMBER + FORGOT */}
            <div className="mt-4 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={form.remember}
                  onChange={(e) =>
                    setForm({ ...form, remember: e.target.checked })
                  }
                />
                <Label className="text-gray-600 dark:text-gray-300">
                  Remember me
                </Label>
              </div>

              <a
                href="/auth/forgot-password"
                className="text-indigo-500 hover:underline font-medium"
              >
                Forgot password?
              </a>
            </div>

            {/* CTA */}
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                onClick={submit}
                disabled={isLoading}
                size="lg"
                className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Login to CodeMentor AI"}
              </Button>
            </motion.div>

            {/* EMAIL VERIFICATION MESSAGE */}
            {showVerifyMessage && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                  Please verify your email before logging in.
                </p>
                <div className="mt-2 text-center">
                  <a
                    href="/auth/resend"
                    className="text-indigo-500 hover:underline font-medium text-sm"
                  >
                    Resend verification email
                  </a>
                </div>
              </div>
            )}

            {/* FOOTER */}
            <p className="mt-5 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-300">
              New to CodeMentor AI?{" "}
              <a
                href="/auth/signup"
                className="text-indigo-500 font-medium hover:underline"
              >
                Create an account
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

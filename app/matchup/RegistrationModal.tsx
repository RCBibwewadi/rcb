"use client";

import { useState } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { GENDER_OPTIONS } from "@/lib/matchup/constants";

interface RegistrationModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onLoginSuccess: () => void;
}

export default function RegistrationModal({
  onClose,
  onSuccess,
  onLoginSuccess,
}: RegistrationModalProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      if (isLogin) {
        const res = await fetch("/api/matchup/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Login failed");
        }

        onLoginSuccess();
      } else {
        const name = formData.get("name") as string;
        const gender = formData.get("gender") as string;
        const rid = formData.get("rid") as string;

        const res = await fetch("/api/matchup/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, gender, rid, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Registration failed");
        }

        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-md w-full p-6 relative luxury-shadow max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-mauve-wine-light hover:text-mauve-wine"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-mauve-wine mb-6 text-center">
          {isLogin ? "Welcome Back" : "Join MatchUp"}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-mauve-wine mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-tan focus:border-transparent text-mauve-wine"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-mauve-wine mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  required
                  className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-tan focus:border-transparent text-mauve-wine"
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-mauve-wine mb-2">
                  RID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="rid"
                  required
                  minLength={3}
                  className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-tan focus:border-transparent text-mauve-wine"
                  placeholder="Enter your Rotaract ID"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-mauve-wine mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-tan focus:border-transparent text-mauve-wine"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-mauve-wine mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength={6}
                className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-tan focus:border-transparent text-mauve-wine pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mauve-wine-light hover:text-mauve-wine"
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
            {!isLogin && (
              <p className="text-xs text-mauve-wine-light mt-1">Minimum 6 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full luxury-gradient text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              "Login"
            ) : (
              "Register"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-rose-tan hover:text-rose-tan-dark font-medium"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>

        {!isLogin && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              All fields are mandatory. You will be notified via email after admin approval.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

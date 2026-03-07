"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  defaultMode?: "login" | "register";
}

export default function AuthModal({ onClose, onSuccess, defaultMode = "register" }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(defaultMode === "login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      if (isLogin) {
        const response = await fetch("/api/game/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Login failed");
        }

        onSuccess();
      } else {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const phone_number = formData.get("phone_number") as string;
        const rid = formData.get("rid") as string;

        // Step 1: Send credentials via FormCarry FIRST
        try {
          const emailResponse = await fetch("https://formcarry.com/s/IhnU-gco2y4", {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: name,
              email: email,
              username: username,
              password: password,
              phone_number: phone_number,
              rid: rid,
              message: `New Registration for Fandom Quest!\n\nName: ${name}\nEmail: ${email}\nUsername: ${username}\nPassword: ${password}\nPhone: ${phone_number}\nRID: ${rid}\n\nPlease save these credentials for game day login.`
            }),
          });

          if (!emailResponse.ok) {
            const errorData = await emailResponse.json().catch(() => ({}));
            console.error("Email send failed:", errorData);
            throw new Error("Failed to send credentials email");
          }

          const emailResult = await emailResponse.json();
          console.log("Email sent successfully:", emailResult);
        } catch (emailError) {
          console.error("Email send error:", emailError);
          throw new Error("Failed to send credentials email.");
        }

        // Step 2: Only register in database if email was sent successfully
        const response = await fetch("/api/game/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, name, email, phone_number, rid, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Registration failed");
        }

        alert(
          "Registration successful! You can now login."
        );
        setIsLogin(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative luxury-shadow my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-mauve-wine-light hover:text-mauve-wine"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold text-mauve-wine mb-6 text-center">
          {isLogin ? "Welcome Back!" : "Join the Quest"}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              {/* Row 1: Name and RID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-mauve-wine font-medium mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    minLength={2}
                    maxLength={100}
                    className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-mauve-wine font-medium mb-2">
                    RID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="rid"
                    required
                    minLength={3}
                    className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent"
                    placeholder="Enter your RID"
                  />
                  <p className="text-xs text-mauve-wine-light mt-1">
                    Rotaract ID
                  </p>
                </div>
              </div>

              {/* Row 2: Username and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-mauve-wine font-medium mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    minLength={3}
                    maxLength={50}
                    className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent"
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label className="block text-mauve-wine font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Row 3: Phone Number and Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-mauve-wine font-medium mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    required
                    pattern="[0-9]{10,15}"
                    className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                  <p className="text-xs text-mauve-wine-light mt-1">
                    10-15 digits only
                  </p>
                </div>

                <div>
                  <label className="block text-mauve-wine font-medium mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <p className="text-xs text-mauve-wine-light mt-1">
                    Minimum 6 characters
                  </p>
                </div>
              </div>
            </>
          )}

          {isLogin && (
            <>
              <div>
                <label className="block text-mauve-wine font-medium mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  minLength={3}
                  maxLength={50}
                  className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-mauve-wine font-medium mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-tan hover:bg-rose-tan-dark text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
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
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>

        {!isLogin && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> All fields are mandatory. Your credentials
              will be sent to your email. Save your username and password for
              game day login.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

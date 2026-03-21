"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ToggleLeft, ToggleRight, Users, UserCheck, UserX } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export default function ToggleSection() {
  const { showToast } = useToast();
  const [matchingEnabled, setMatchingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    matched: 0,
  });

  const fetchSettings = async () => {
    try {
      const [settingsRes, usersRes] = await Promise.all([
        fetch("/api/admin/matchup/settings"),
        fetch("/api/admin/matchup/users"),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setMatchingEnabled(data.settings.matching_enabled ?? false);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        const users = data.users || [];
        setStats({
          total: users.length,
          approved: users.filter((u: { status: string }) => u.status === "approved").length,
          pending: users.filter((u: { status: string }) => u.status === "pending").length,
          matched: users.filter((u: { is_matched: boolean }) => u.is_matched).length,
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = async () => {
    try {
      const res = await fetch("/api/admin/matchup/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setting_key: "matching_enabled",
          setting_value: !matchingEnabled,
        }),
      });

      if (res.ok) {
        setMatchingEnabled(!matchingEnabled);
        showToast(
          matchingEnabled ? "Matching disabled successfully" : "Matching enabled successfully",
          "success"
        );
      } else {
        showToast("Failed to update settings", "error");
      }
    } catch (error) {
      console.error("Toggle matching error:", error);
      showToast("Failed to toggle matching", "error");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-rose-tan-light/20 rounded-xl"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-rose-tan-light/20 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-effect rounded-xl p-6 luxury-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-mauve-wine">Matching Status</h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  matchingEnabled
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {matchingEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <p className="text-sm text-mauve-wine-light mb-4">
              {matchingEnabled
                ? "Users can access the Partners tab and swipe on potential matches"
                : "Partners tab is hidden for all users"}
            </p>

            <button
              type="button"
              onClick={handleToggle}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                matchingEnabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                  matchingEnabled ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {matchingEnabled ? (
              <ToggleRight className="w-12 h-12 text-green-500" />
            ) : (
              <ToggleLeft className="w-12 h-12 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-4 luxury-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mauve-wine">{stats.total}</p>
              <p className="text-xs text-mauve-wine-light">Total Users</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-xl p-4 luxury-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mauve-wine">{stats.approved}</p>
              <p className="text-xs text-mauve-wine-light">Approved</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-xl p-4 luxury-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <UserX className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mauve-wine">{stats.pending}</p>
              <p className="text-xs text-mauve-wine-light">Pending</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-xl p-4 luxury-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
              <span className="text-lg">💕</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-mauve-wine">{stats.matched}</p>
              <p className="text-xs text-mauve-wine-light">Matched</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, RefreshCw, Mail, User, Users } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { MatchUpUser } from "@/lib/types";

interface RequestsSectionProps {
  onRefresh?: () => void;
}

export default function RequestsSection({ onRefresh }: RequestsSectionProps) {
  const { showToast } = useToast();
  const [users, setUsers] = useState<MatchUpUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/matchup/users?status=pending");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch pending users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserAction = async (userId: string, action: "approve" | "decline") => {
    setProcessing(userId);
    try {
      const res = await fetch("/api/admin/matchup/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, action }),
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
        showToast(`User ${action}d successfully`, "success");
        onRefresh?.();
      } else {
        showToast(data.error || "Failed to process request", "error");
      }
    } catch (error) {
      console.error("User action error:", error);
      showToast("Failed to process request", "error");
    } finally {
      setProcessing(null);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white rounded-xl p-6 h-32 luxury-shadow">
            <div className="flex gap-4">
              <div className="h-4 bg-rose-tan-light/30 rounded w-24"></div>
              <div className="h-4 bg-rose-tan-light/30 rounded w-32"></div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 bg-rose-tan-light/30 rounded w-40"></div>
              <div className="h-3 bg-rose-tan-light/30 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-mauve-wine flex items-center gap-2">
          <Users className="w-5 h-5" />
          Pending Requests ({users.length})
        </h3>
        <button
          onClick={handleRefresh}
          className="text-rose-tan hover:text-rose-tan-dark p-2 hover:bg-rose-tan-light/20 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl luxury-shadow">
          <div className="text-mauve-wine-light">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No pending requests</p>
            <p className="text-sm mt-1">All registration requests have been processed</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl luxury-shadow overflow-hidden"
            >
              <div className="bg-gradient-to-r from-rose-tan to-rose-tan-dark p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-sm text-white/80 capitalize">{user.gender}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-mauve-wine-light" />
                  <span className="text-mauve-wine truncate">{user.email}</span>
                </div>
                
                <div className="text-sm">
                  <span className="text-mauve-wine-light">RID:</span>{" "}
                  <span className="text-mauve-wine font-medium">{user.rid}</span>
                </div>

                <div className="pt-2 border-t border-rose-tan-light/30">
                  <div className="text-xs text-mauve-wine-light mb-2">
                    Registered: {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleUserAction(user.id, "approve")}
                    disabled={processing === user.id}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                    title="Approve and send email with credentials"
                  >
                    {processing === user.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Approve
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleUserAction(user.id, "decline")}
                    disabled={processing === user.id}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                    title="Decline (no email sent)"
                  >
                    {processing === user.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Decline
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader2, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

interface MatchPreview {
  user1_id: string;
  user2_id: string;
  user1_name: string;
  user2_name: string;
  score: number;
}

interface ReconciliationResult {
  preview?: boolean;
  total_males: number;
  total_females: number;
  potential_matches: number;
  final_matches: MatchPreview[];
  unmatched_males: number;
  unmatched_females: number;
  success?: boolean;
  message?: string;
  matches_created?: number;
}

export default function ReconciliationSection() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = async () => {
    setLoading(true);
    setResult(null);
    setShowPreview(false);

    try {
      const res = await fetch("/api/admin/matchup/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: false }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        setShowPreview(true);
      } else {
        showToast(data.error || "Failed to generate preview", "error");
      }
    } catch (error) {
      console.error("Preview error:", error);
      showToast("Failed to generate preview", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!result || !confirm("Are you sure you want to create these matches? This action cannot be undone.")) {
      return;
    }

    setConfirming(true);

    try {
      const res = await fetch("/api/admin/matchup/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message || "Reconciliation completed successfully", "success");
        setResult(data);
        setShowPreview(false);
      } else {
        showToast(data.error || "Failed to complete reconciliation", "error");
      }
    } catch (error) {
      console.error("Confirm error:", error);
      showToast("Failed to complete reconciliation", "error");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-xl p-6 luxury-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-mauve-wine">Match by Preferences</h3>
            <p className="text-sm text-mauve-wine-light mt-1">
              Automatically pair unmatched users based on preference compatibility
            </p>
          </div>
          <button
            onClick={handlePreview}
            disabled={loading || confirming}
            className="flex items-center gap-2 px-4 py-2 bg-rose-tan text-white rounded-lg hover:bg-rose-tan-dark transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4" />
                Match by Preferences
              </>
            )}
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Important Notes:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Only approved and unmatched users will be considered</li>
                <li>Users are paired by highest preference match score</li>
                <li>If odd number of users, one will remain unmatched</li>
                <li>Users without preferences will be skipped</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPreview && result && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="glass-effect rounded-xl p-6 luxury-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-mauve-wine">Preview Results</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      setResult(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={confirming || result.final_matches.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {confirming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Confirm Matches ({result.final_matches.length})
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{result.total_males}</p>
                  <p className="text-sm text-blue-600">Males</p>
                </div>
                <div className="bg-pink-50 rounded-lg p-4 text-center">
                  <Users className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-pink-600">{result.total_females}</p>
                  <p className="text-sm text-pink-600">Females</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <Heart className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{result.final_matches.length}</p>
                  <p className="text-sm text-purple-600">Potential Pairs</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">
                    {result.unmatched_males + result.unmatched_females}
                  </p>
                  <p className="text-sm text-orange-600">Unmatched</p>
                </div>
              </div>

              {result.final_matches.length > 0 ? (
                <div>
                  <h4 className="text-md font-semibold text-mauve-wine mb-3">
                    Matched Pairs (sorted by score)
                  </h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {result.final_matches.map((match, index) => (
                      <div
                        key={`${match.user1_id}-${match.user2_id}`}
                        className="flex items-center justify-between bg-white rounded-lg p-3 border border-rose-tan-light"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-mauve-wine-light w-6">
                            #{index + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-mauve-wine">{match.user1_name}</span>
                            <span className="text-rose-tan">♥</span>
                            <span className="font-medium text-mauve-wine">{match.user2_name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            {Math.round(match.score)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-mauve-wine-light">
                  No matches could be created. Users may not have preferences set.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {result && !showPreview && result.success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-xl p-6 luxury-shadow bg-green-50"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">{result.message}</p>
                <p className="text-sm text-green-600">
                  {result.matches_created} matches created successfully
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

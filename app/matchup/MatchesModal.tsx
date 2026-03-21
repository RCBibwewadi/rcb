"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Check, UserX, Loader2, Clock } from "lucide-react";
import { MatchUpMatch } from "@/lib/types";

interface EnrichedMatch extends MatchUpMatch {
  user_status?: string;
  partner_status?: string;
}

interface MatchesModalProps {
  matches: EnrichedMatch[];
  onClose: () => void;
  onAction: (accepted: boolean, confirmed?: boolean) => void;
}

export default function MatchesModal({ matches, onClose, onAction }: MatchesModalProps) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleAction = async (matchId: string, action: "accept" | "reject") => {
    setProcessing(matchId);
    setError("");

    try {
      const res = await fetch("/api/matchup/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: matchId, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process action");
      }

      onAction(action === "accept", data.both_accepted === true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setProcessing(null);
    }
  };

  const getStatusBadge = (match: EnrichedMatch) => {
    const userStatus = match.user_status;
    const partnerStatus = match.partner_status;

    if (userStatus === "accepted" && partnerStatus === "accepted") {
      return (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
          Confirmed!
        </span>
      );
    }

    if (userStatus === "accepted" && partnerStatus === "pending") {
      return (
        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Waiting for response
        </span>
      );
    }

    if (userStatus === "pending" && partnerStatus === "accepted") {
      return (
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
          They accepted!
        </span>
      );
    }

    return null;
  };

  const isMatchWaitingForUser = (match: EnrichedMatch) => {
    return match.user_status === "pending" && match.partner_status === "accepted";
  };

  const hasUserAlreadyAccepted = (match: EnrichedMatch) => {
    return match.user_status === "accepted";
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
        className="bg-white rounded-2xl max-w-lg w-full p-6 relative luxury-shadow max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-mauve-wine-light hover:text-mauve-wine"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-mauve-wine mb-2">Your Matches</h2>
        <p className="text-mauve-wine-light mb-6">
          You have {matches.length} pending match{matches.length > 1 ? "es" : ""}.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <AnimatePresence>
            {matches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="glass-effect rounded-xl p-4 luxury-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-luxury-cream flex items-center justify-center overflow-hidden">
                    {match.partner?.profile?.photo1_url ? (
                      <img
                        src={match.partner.profile.photo1_url}
                        alt={match.partner.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Heart className="w-8 h-8 text-rose-tan" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-mauve-wine">
                        {match.partner?.profile?.username || match.partner?.name || "Unknown"}
                      </h3>
                      {getStatusBadge(match)}
                    </div>
                    {match.match_score && (
                      <p className="text-sm text-mauve-wine-light">
                        {Math.round(match.match_score)}% match
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  {!hasUserAlreadyAccepted(match) && (
                    <>
                      <button
                        onClick={() => handleAction(match.id, "accept")}
                        disabled={processing === match.id}
                        className={`flex-1 font-semibold py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 ${
                          isMatchWaitingForUser(match)
                            ? "luxury-gradient text-white animate-pulse"
                            : "luxury-gradient text-white"
                        }`}
                      >
                        {processing === match.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Accept
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleAction(match.id, "reject")}
                        disabled={processing === match.id}
                        className="flex-1 bg-gray-100 text-mauve-wine font-semibold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        <UserX className="w-4 h-4" />
                        Decline
                      </button>
                    </>
                  )}
                  {hasUserAlreadyAccepted(match) && match.partner_status === "pending" && (
                    <div className="flex-1 text-center py-2 text-mauve-wine-light text-sm">
                      <Clock className="w-4 h-4 inline mr-2 animate-pulse" />
                      Waiting for their response...
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> A match is only confirmed when BOTH users accept. If either declines, the match is cancelled.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

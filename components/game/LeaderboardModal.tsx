"use client";

import { useState, useEffect } from "react";
import { X, Trophy, Clock, Target } from "lucide-react";
import { LeaderboardEntry } from "@/lib/types";

interface LeaderboardModalProps {
  seriesId: string;
  onClose: () => void;
}

export default function LeaderboardModal({
  seriesId,
  onClose,
}: LeaderboardModalProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [seriesId]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/game/leaderboard/series/${seriesId}`);
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    return "text-mauve-wine";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-mauve-wine flex items-center gap-2">
              <Trophy className="w-6 h-6 text-rose-tan" />
              Leaderboard
            </h2>
            <button
              onClick={onClose}
              className="text-mauve-wine-light hover:text-mauve-wine"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-rose-tan"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-mauve-wine-light">
                No attempts yet. Be the first!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={`${entry.username}-${entry.completed_at}`}
                  className={`p-4 rounded-lg border-2 ${
                    entry.rank <= 3
                      ? "border-rose-tan bg-rose-tan/5"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`text-2xl font-bold ${getRankColor(
                          entry.rank
                        )}`}
                      >
                        #{entry.rank}
                      </div>
                      <div>
                        <p className="font-semibold text-mauve-wine">
                          {entry.username}
                        </p>
                        <div className="flex gap-4 text-sm text-mauve-wine-light mt-1">
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {entry.score}/11
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(entry.time_taken)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {entry.rank <= 3 && (
                      <Trophy
                        className={`w-8 h-8 ${getRankColor(entry.rank)}`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

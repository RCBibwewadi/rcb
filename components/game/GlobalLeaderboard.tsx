"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Award, Clock, Target } from "lucide-react";
import { GlobalLeaderboardEntry } from "@/lib/types";

export default function GlobalLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<GlobalLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/game/leaderboard/global");
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Failed to fetch global leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-400 to-yellow-600";
    if (rank === 2) return "from-gray-300 to-gray-500";
    if (rank === 3) return "from-amber-500 to-amber-700";
    return "from-rose-tan to-rose-tan-dark";
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-mauve-wine/5 to-rose-tan/5">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-mauve-wine mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-rose-tan" />
            Global Champions
          </h2>
          <p className="text-mauve-wine-light text-lg">
            Top performers across all series
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-rose-tan"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-mauve-wine-light">
              No attempts yet. Be the first champion!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {leaderboard.slice(0, 10).map((entry, index) => (
              <motion.div
                key={entry.username}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl p-6 luxury-shadow ${
                  entry.rank <= 3 ? "ring-2 ring-rose-tan" : ""
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRankColor(
                        entry.rank
                      )} flex items-center justify-center text-white font-bold text-xl`}
                    >
                      {entry.rank}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-mauve-wine">
                        {entry.username}
                      </h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-mauve-wine-light">
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {entry.total_series_attempted} Series
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {entry.total_questions_correct} Correct
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Avg: {Math.floor(entry.avg_time_per_quiz / 60)}:
                          {(entry.avg_time_per_quiz % 60)
                            .toFixed(0)
                            .padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  </div>
                  {entry.rank <= 3 && (
                    <Trophy
                      className={`w-10 h-10 ${
                        entry.rank === 1
                          ? "text-yellow-500"
                          : entry.rank === 2
                          ? "text-gray-400"
                          : "text-amber-600"
                      }`}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

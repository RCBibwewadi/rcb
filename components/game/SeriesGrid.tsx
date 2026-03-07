"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Trophy } from "lucide-react";
import { SeriesCard } from "@/lib/types";

interface SeriesGridProps {
  series: SeriesCard[];
  onSeriesClick: (series: SeriesCard) => void;
  onViewLeaderboard: (seriesId: string) => void;
  completedSeriesIds?: string[];
}

export default function SeriesGrid({
  series,
  onSeriesClick,
  onViewLeaderboard,
  completedSeriesIds = [],
}: SeriesGridProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-luxury-cream">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl font-bold text-mauve-wine text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Choose Your Fandom
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {series.map((item, index) => {
            const isCompleted = completedSeriesIds.includes(item.id);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className={`bg-white rounded-xl overflow-hidden luxury-shadow hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                  isCompleted ? 'opacity-75' : ''
                }`}>
                  <div
                    className={`relative h-64 overflow-hidden ${
                      isCompleted ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    onClick={() => !isCompleted && onSeriesClick(item)}
                  >
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className={`object-cover transition-transform duration-300 ${
                        isCompleted ? 'grayscale' : 'group-hover:scale-110'
                      }`}
                    />
                    
                    {isCompleted ? (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <div className="text-center">
                          <div className="bg-green-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-white font-bold text-lg">Completed</span>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="text-white font-semibold text-lg">
                          Start Quiz
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-xl font-bold text-mauve-wine mb-2 text-center">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-mauve-wine-light text-center mb-3">
                        {item.description}
                      </p>
                    )}

                    <button
                      onClick={() => onViewLeaderboard(item.id)}
                      className="w-full bg-rose-tan/10 hover:bg-rose-tan hover:text-white text-rose-tan-dark px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Trophy className="w-4 h-4" />
                      Leaderboard
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {series.length === 0 && (
          <div className="text-center py-12">
            <p className="text-mauve-wine-light text-lg">
              No series available at the moment. Check back soon!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

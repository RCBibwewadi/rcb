"use client";

import { motion } from "framer-motion";
import { ArrowRight, Gamepad2 } from "lucide-react";
import Link from "next/link";

export default function GameBanner() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-luxury-cream">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto"
      >
        <Link href="/game">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-mauve-wine via-rose-tan to-luxury-gold p-1 cursor-pointer group">
            <div className="bg-white rounded-xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-tan/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-mauve-wine/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                    <Gamepad2 className="w-8 h-8 text-rose-tan" />
                    <h2 className="text-3xl md:text-4xl font-bold text-mauve-wine">
                      Fandom Quest is Live!
                    </h2>
                  </div>
                  <p className="text-lg text-mauve-wine-light mb-4">
                    Test your knowledge of movies and series. Compete with fans
                    worldwide and climb the leaderboards!
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-mauve-wine">
                    <span className="bg-rose-tan/10 px-4 py-2 rounded-full">
                      🎬 Multiple Series
                    </span>
                    <span className="bg-rose-tan/10 px-4 py-2 rounded-full">
                      🏆 Leaderboards
                    </span>
                    <span className="bg-rose-tan/10 px-4 py-2 rounded-full">
                      ⏱️ Timed Challenges
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-rose-tan to-mauve-wine text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 group-hover:scale-105 transition-transform shadow-lg">
                    Play Now
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </section>
  );
}

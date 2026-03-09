"use client";

import { motion } from "framer-motion";

export default function GameHero() {
  return (
    <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-mauve-wine via-rose-tan to-luxury-gold overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            🎬 Gamemania 🎮
          </h1>
          <div className="max-w-3xl mx-auto">
            <motion.p
              className="text-xl md:text-2xl text-white/90 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Welcome to the Ultimate Fandom Quest!
            </motion.p>
            <motion.p
              className="text-lg md:text-xl text-white/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Rotaract Club of Bibwewadi presents an exciting online challenge
              for all movie and series lovers. Test your knowledge, compete with
              fellow fans, and climb the leaderboards!
            </motion.p>
          </div>

          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-4 text-white/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="font-semibold">11 Questions</span> per quiz
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="font-semibold">3 Minutes</span> to complete
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="font-semibold">Multiple Series</span> to explore
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

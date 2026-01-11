"use client";
import { ParticlesBackground } from "./ui/ParticlesBackground";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="relative py-20 bg-black overflow-hidden">
      {/* ✅ Centered background particles */}
      <ParticlesBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-luxury-gold mb-4">
            Who We Are
          </h2>
          <div className="w-24 h-1 luxury-gradient mx-auto mb-8"></div>
        </motion.div>

        {/* About Content */}

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-semibold text-rose-tan mb-6">
              About Rotaract Club of Bibwewadi
            </h3>
            <p className="text-white mb-6 leading-relaxed text-lg">
              Rotaract is a youth organization of Rotary International for young
              and aspiring leaders (typically 18-30).
            </p>
            <p className="text-white mb-6 leading-relaxed text-lg">
              <span className="font-bold">
                The Rotaract Club of Bibwewadi Pune
              </span>{" "}
              is committed to making a difference in our local community.
            </p>
            <p className="text-white leading-relaxed text-lg">
              At its core, our club is a close-knit family where professionalism
              meets purpose.
            </p>
          </motion.div>

          {/* Cards Side */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                title: "Professional Development",
                text: "Building careers and skills",
                color: "from-rose-tan to-rose-tan-dark",
              },
              {
                title: "Community Service",
                text: "Serving our local community",
                color: "from-mauve-wine to-mauve-wine-dark ",
              },
              {
                title: "International Service",
                text: "Global impact initiatives",
                color: "from-luxury-gold to-rose-tan p-6 ",
              },
              {
                title: "Club Service",
                text: "Strengthening our club",
                color: "from-rose-tan-light to-mauve-wine-light",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.7, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-gradient-to-br ${card.color} p-6 rounded-xl text-white text-center luxury-shadow transition-all duration-100 hover:shadow-2xl`}
              >
                <h4 className="font-semibold mb-2">{card.title}</h4>
                <p className="text-sm opacity-90">{card.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";
import { ParticlesBackground } from "./ui/ParticlesBackground";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const values = [
  {
    title: "Social Service",
    desc: "Designing and executing initiatives that address real community needs, from education and health to environment and civic awareness.",
    icon: "🌱",
  },
  {
    title: "Network Building",
    desc: "Creating a strong, supportive circle of like-minded individuals, mentors, and partners who grow together personally and professionally.",
    icon: "🤝",
  },
  {
    title: "Leadership Development",
    desc: "Providing platforms to lead projects, speak with confidence, manage teams, and turn ideas into action.",
    icon: "🚀",
  },
  {
    title: "Community Engagement",
    desc: "Collaborating with institutions, NGOs, and citizens to multiply impact and foster sustainable change.",
    icon: "💪",
  },
];

export default function About() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
            About Us
          </h2>
          <p className="text-xl text-rose-tan-light font-medium mb-4">
            Rotaract Club of Bibwewadi Pune
          </p>
          <div className="w-24 h-1 luxury-gradient mx-auto mb-8"></div>
        </motion.div>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <p className="text-white text-lg md:text-xl leading-relaxed">
            The Rotaract Club of Bibwewadi Pune is a vibrant social organization driven by young leaders who believe in creating impact through service, fellowship, and professional growth. Rooted in the values and global spirit of Rotary International, we work at the grassroots level to uplift communities while building lifelong networks and leadership skills among our members.
          </p>
        </motion.div>

        {/* What We Stand For - Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl md:text-3xl font-semibold text-rose-tan text-center mb-8">
            What We Stand For
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-gradient-to-br from-mauve-wine to-mauve-wine-dark p-6 rounded-xl text-white luxury-shadow hover:shadow-2xl transition-all duration-300"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-semibold text-luxury-gold mb-2">{item.title}</h4>
                <p className="text-sm text-white/80 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Who We Are - Accordion Style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl md:text-3xl font-semibold text-rose-tan text-center mb-8">
            Who We Are
          </h3>
          <div className="max-w-3xl mx-auto space-y-3">
            {[
              {
                q: "Our People",
                a: "We are students, professionals, entrepreneurs, and changemakers, united by the desire to serve and the courage to lead. Every project we undertake reflects our belief that small, consistent actions can spark big transformations.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-mauve-wine/50 to-rose-tan-dark/30 rounded-xl overflow-hidden border border-white/10"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="text-lg font-semibold text-luxury-gold">{item.q}</span>
                  <motion.span
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-luxury-gold text-2xl"
                  >
                    ▼
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-4 text-white/90 leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Our Vision */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-2xl md:text-3xl font-semibold text-rose-tan mb-6">
            Our Vision
          </h3>
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-luxury-gold/20 via-rose-tan/20 to-mauve-wine/20 rounded-2xl p-8 border border-luxury-gold/30">
            <p className="text-xl md:text-2xl text-white leading-relaxed font-medium">
              To be a dynamic force for positive change in society while nurturing responsible leaders of tomorrow — individuals who serve with empathy, act with integrity, and inspire others to do the same.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-white text-lg mb-4">
            Whether you're looking to contribute to meaningful causes, expand your network, or develop skills that last a lifetime, the Rotaract Club of Bibwewadi welcomes you to be part of a journey where service meets leadership and passion meets purpose.
          </p>
          <p className="text-2xl font-bold text-luxury-gold">
            Together, we don't just participate in change — we create it. ✨
          </p>
        </motion.div>
      </div>
    </section>
  );
}

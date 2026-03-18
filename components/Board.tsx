/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Linkedin, Instagram, Mail } from "lucide-react";
import { useToast } from "./ui/ToastProvider";
import { motion, Variants } from "framer-motion";

interface BoardMember {
  id: number;
  name: string;
  position: string;
  description: string;
  image_url: string;
  initial: string;
  sequence: number;
  linkedIn?: string;
  instagram?: string;
  email?: string;
}

enum ToastType {
  Error = "error",
  Success = "success",
}

/* ================== Animations ================== */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 80 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function BoardMembers() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bod");

      if (!res.ok) throw new Error("Failed to fetch board members");

      const data: BoardMember[] = await res.json();
      setBoardMembers(data);
    } catch (err: any) {
      showToast(err.message || "Something went wrong", ToastType.Error);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const skeletonArray = [1, 2, 3];

  return (
    <motion.section
      id="board"
      className="py-20 luxury-gradient"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Board of Directors
          </h2>
          <p className="text-white max-w-2xl mx-auto">
            Meet the passionate leaders driving our mission forward
          </p>
        </div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-8"
        >
          {/* Skeleton Loader */}
          {loading || boardMembers.length === 0
            ? skeletonArray.map((_, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="rounded-xl overflow-hidden bg-mauve-wine border border-mauve-wine animate-pulse"
                >
                  <div className="aspect-square bg-white/10" />

                  <div className="p-5 text-center space-y-2">
                    <div className="h-4 bg-white/20 rounded w-3/4 mx-auto" />
                    <div className="h-3 bg-white/20 rounded w-1/2 mx-auto" />
                  </div>
                </motion.div>
              ))
            : boardMembers.map((member) => (
                <motion.div
                  key={member.id}
                  variants={fadeUp}
                  className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer bg-mauve-wine border border-mauve-wine"
                  onMouseEnter={() => setHovered(member.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Image */}
                  <div className="aspect-square z-10">
                    {member.image_url ? (
                      <img
                        src={member.image_url}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        alt={member.name}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white bg-gradient-to-br">
                        {member.initial}
                      </div>
                    )}
                  </div>

                  {/* Hover Overlay */}
                  <div
                    className={`absolute inset-0 z-20 bg-gradient-to-t from-mauve-wine-dark/90 via-mauve-wine/80 to-transparent text-white p-6 flex flex-col justify-end transition-all duration-300 ${
                      hovered === member.id
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-auto"
                    }`}
                  >
                    <h3 className="text-xl font-bold text-luxury-gold">
                      {member.name}
                    </h3>
                    <p className="text-rose-tan-light text-sm mb-3">
                      {member.position}
                    </p>
                    <p className="text-sm opacity-90 mb-4">
                      {member.description}
                    </p>

                    <div className="flex gap-3">
                      <button
                        className="w-9 h-9 bg-white/10 hover:bg-luxury-gold rounded-full flex items-center justify-center transition"
                        onClick={() =>
                          member.linkedIn &&
                          window.open(member.linkedIn, "_blank")
                        }
                      >
                        <Linkedin className="w-4 h-4" />
                      </button>

                      <button
                        className="w-9 h-9 bg-white/10 hover:bg-luxury-gold rounded-full flex items-center justify-center transition"
                        onClick={() =>
                          member.instagram &&
                          window.open(member.instagram, "_blank")
                        }
                      >
                        <Instagram className="w-4 h-4" />
                      </button>

                      <button
                        className="w-9 h-9 bg-white/10 hover:bg-luxury-gold rounded-full flex items-center justify-center transition"
                        onClick={() =>
                          member.email &&
                          window.open(`mailto:${member.email}`)
                        }
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Default Info */}
                  <div
                    className={`p-5 text-center transition-all duration-300 ${
                      hovered === member.id ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <h3 className="font-bold text-white">{member.name}</h3>
                    <p className="text-sm text-white">{member.position}</p>
                  </div>
                </motion.div>
              ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
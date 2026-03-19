"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Linkedin, Instagram, Mail } from "lucide-react";
import { useToast } from "./ui/ToastProvider";

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.message || "Something went wrong", ToastType.Error);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <section id="board" className="py-20 luxury-gradient">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Board of Directors
          </h2>

          <p className="text-white max-w-2xl mx-auto">
            Meet the passionate leaders driving our mission forward
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {boardMembers.map((member) => (
            <div
              key={member.id}
              className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer bg-mauve-wine border border-mauve-wine"
              onMouseEnter={() => setHovered(member.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Image / Placeholder */}
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
                <p className="text-sm opacity-90 mb-4">{member.description}</p>

                <div className="flex gap-3">
                  <button
                    className="w-9 h-9 bg-white/10 hover:bg-luxury-gold rounded-full flex items-center justify-center pointer-events-auto transition"
                    onClick={() =>
                      member.linkedIn && window.open(member.linkedIn, "_blank")
                    }
                  >
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button
                    className="w-9 h-9 bg-white/10 hover:bg-luxury-gold rounded-full flex items-center justify-center pointer-events-auto transition"
                    onClick={() =>
                      member.instagram &&
                      window.open(member.instagram, "_blank")
                    }
                  >
                    <Instagram className="w-4 h-4 " />
                  </button>
                  <button
                    className="w-9 h-9 bg-white/10 hover:bg-luxury-gold rounded-full flex items-center justify-center pointer-events-auto transition"
                    onClick={() =>
                      member.email && window.open(`mailto:${member.email}`)
                    }
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Default text (when NOT hovered) */}
              <div
                className={`p-5 text-center transition-all duration-300 ${
                  hovered === member.id ? "opacity-0" : "opacity-100"
                }`}
              >
                <h3 className="font-bold text-white">{member.name}</h3>
                <p className="text-sm text-white">{member.position}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

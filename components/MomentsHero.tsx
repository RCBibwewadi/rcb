"use client";

import Link from "next/link";
import { ParticlesBackground } from "./ui/ParticlesBackground";

export default function MomentsHero() {
  return (
    <div className="relative min-h-[400px] bg-black from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <ParticlesBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="space-y-6 max-w-2xl">
          <Link href="/">
            <button className="inline-flex items-center px-4 py-2 rounded-full luxury-gradient text-white border border-mauve-wine text-sm font-medium  cursor-pointer">
              ✨ Home
            </button>
          </Link>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-pretty leading-tight">
            Memorable{" "}
            <span className=" bg-clip-text text-mauve-wine">Moments</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 text-pretty max-w-xl">
            Celebrate the stories, laughter, and achievements that define our
            community. Every frame captures a moment of growth, connection, and
            impact.
          </p>
        </div>
      </div>
    </div>
  );
}

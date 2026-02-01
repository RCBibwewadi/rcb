// components/Hero.tsx
"use client";
import React, { useEffect, useState } from "react";

interface HeroData {
  background_image: string;
  title: string;
  subtitle: string;
  description: string;
  cta_text: string;
}

export default function Hero() {
  const [hero, setHero] = useState<HeroData>({
    background_image: "",
    title: "",
    subtitle: "",
    description: "",
    cta_text: "",
  });

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch("/api/hero");
        const data = await res.json();
        if (res.ok) setHero(data);
      } catch (err) {
        console.error("Failed to fetch hero:", err);
      }
    };

    fetchHero();
  }, []);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch("/api/hero");
        const data = await res.json();
        if (res.ok) {
          setHero({
            background_image: data.background_image || "",
            title: data.title || "",
            subtitle: data.subtitle || "",
            description: data.description || "",
            cta_text: data.cta_text || "",
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHero();
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem("hero");

    if (cached) {
      setHero(JSON.parse(cached));
    }

    const fetchHero = async () => {
      const res = await fetch("/api/hero");
      const data = await res.json();

      if (res.ok) {
        setHero(data);
        localStorage.setItem("hero", JSON.stringify(data));
      }
    };

    fetchHero();
  }, []);

  return (
    <section
      id="home"
      className="pt-16 min-h-screen flex items-center relative overflow-hidden"
    >
      {/* Background Layers */}
      <div className="absolute inset-0 luxury-gradient opacity-20"></div>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${hero.background_image}')` }}
      >
        <div className="absolute inset-0 bg-mauve-wine-dark opacity-60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-luxury-cream mb-8 font-medium">
            {hero.subtitle}
          </p>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            {hero.description}
          </p>
          {hero.cta_text && (
            <a
              href="/quick"
              className="inline-block luxury-gradient hover:opacity-90 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 luxury-shadow"
            >
              {hero.cta_text}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

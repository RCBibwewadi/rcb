"use client";
import { removeImage, setupImageUploader } from "@/lib/adminutils";
import Image from "next/image";
import React, { useState, useEffect } from "react";

interface HeroData {
  backgroundImage: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
}

export default function HeroEditor() {
  const [hero, setHero] = useState<HeroData>({
    backgroundImage: "",
    title: "",
    subtitle: "",
    description: "",
    ctaText: "",
  });

  // Text input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setHero({ ...hero, [e.target.id]: e.target.value });
  };

  // Remove image
  const removeImageUploader = () => {
    removeImage("hero-bg-uploader", (msg) => alert(msg));
    setHero({ ...hero, backgroundImage: "" });
  };

  // Save hero
  const saveHeroContent = () => {
    console.log("Hero data saved:", hero);
    alert("Changes saved!");
  };

  useEffect(() => {
    // Setup image uploader using utility
    setupImageUploader("hero-bg-uploader", (msg, type) => alert(msg));
  }, []);

  return (
    <div className="glass-effect rounded-xl p-6 luxury-shadow fade-in">
      <h3 className="text-2xl font-bold text-mauve-wine mb-6">Hero Section</h3>
      <div className="space-y-6">
        {/* Background Image */}
        <div>
          <label className="block text-sm font-medium text-mauve-wine-dark mb-2">Background Image</label>
          <div className="image-uploader-container">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="url"
                  id="backgroundImage"
                  value={hero.backgroundImage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                  placeholder="Enter image URL or upload below"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <input type="file" accept="image/*" id="hero-bg-uploader" className="hidden" />
                <button
                  type="button"
                  onClick={() => document.getElementById("hero-bg-uploader")?.click()}
                  className="bg-rose-tan text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-tan-dark transition-colors text-sm"
                >
                  Upload Image
                </button>
                {hero.backgroundImage && (
                  <button
                    type="button"
                    onClick={removeImageUploader}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors text-sm"
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
            <div className="mt-3">
              {hero.backgroundImage && (
                <Image src={hero.backgroundImage} alt="Preview" className="h-20 w-20 object-cover rounded-lg border" />
              )}
            </div>
          </div>
        </div>

        {/* Other inputs */}
        {["title", "subtitle", "description", "ctaText"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-mauve-wine-dark mb-2">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            {field === "description" ? (
              <textarea
                id={field}
                rows={4}
                value={hero.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent"
              />
            ) : (
              <input
                type="text"
                id={field}
                value={hero[field as keyof HeroData]}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent"
              />
            )}
          </div>
        ))}

        <button
          onClick={saveHeroContent}
          className="luxury-gradient text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

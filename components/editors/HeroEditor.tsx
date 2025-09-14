"use client";
import React, { useEffect, useState } from "react";

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

  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setHero({ ...hero, [e.target.id]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFile(e.target.files[0]);
  };

  const uploadImage = async (): Promise<string> => {
    if (!file) return hero.backgroundImage;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/hero/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to upload image");
    return data.url;
  };

  const saveHero = async () => {
    try {
      const imageUrl = await uploadImage();

      const res = await fetch("/api/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...hero, backgroundImage: imageUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save hero");

      alert("Hero updated successfully!");
    }catch (err) {
  if (err instanceof Error) {
    alert("Error: " + err.message);
  } else {
    alert("Error: " + String(err));
  }
}
  };

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch("/api/hero");
        const data = await res.json();
        if (res.ok) {
          setHero({
            backgroundImage: data.background_image || "",
            title: data.title || "",
            subtitle: data.subtitle || "",
            description: data.description || "",
            ctaText: data.cta_text || "",
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHero();
  }, []);

  return (
    <div className="glass-effect rounded-xl p-6 luxury-shadow fade-in">
      <h3 className="text-2xl font-bold text-mauve-wine mb-6">Hero Section</h3>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Background Image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {hero.backgroundImage && !file && (
          <div className="mt-3">
            <img src={hero.backgroundImage} alt="Preview" width={120} height={80} className="rounded-lg" />
          </div>
        )}
        {file && (
          <div className="mt-3">
            <p>Selected: {file.name}</p>
          </div>
        )}
      </div>

      {/* Other Fields */}
      {["title", "subtitle", "description", "ctaText"].map((field) => (
        <div key={field} className="mb-4">
          <label className="block mb-1 font-medium">{field}</label>
          {field === "description" ? (
            <textarea
              id={field}
              value={hero[field as keyof HeroData]}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border rounded focus:ring-2"
            />
          ) : (
            <input
              type="text"
              id={field}
              value={hero[field as keyof HeroData]}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:ring-2"
            />
          )}
        </div>
      ))}

      <button onClick={saveHero} className="bg-rose-tan text-white px-6 py-3 rounded-lg">
        Save Hero
      </button>
    </div>
  );
}

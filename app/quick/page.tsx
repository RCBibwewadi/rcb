"use client";

import React, { useEffect, useState, useRef, JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MomentsHero from "@/components/MomentsHero";
import MomentsFilter from "@/components/MomentsFilters";

interface QuickItem {
  id: string | number;
  section: string;
  title?: string;
  description?: string;
  media_type: "image" | "video";
  media_url: string;
  thumbnail_url: string;
  sequence: number;
}

export default function QuickPage() {
  const [items, setItems] = useState<QuickItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("dances");

  async function fetchItems() {
    try {
      const res = await fetch("/api/quick", { cache: "force-cache" });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed fetching quick items", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  const renderItem = (item: QuickItem, index: number) => (
    <div
      key={item.id}
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.08}s both`,
      }}
      className="min-w-75 bg-white rounded-2xl shadow-md overflow-hidden snap-start cursor-pointer"
    > 
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
     
      <div className="relative w-full aspect-video overflow-hidden">
        {item.media_type === "image" && (
          <>
            <img
              src={item.thumbnail_url}
              alt={item.title || ""}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <button
              onClick={() =>
                setPreviewImage(item.media_url || item.thumbnail_url)
              }
              className="absolute bottom-2 right-2 px-3 py-1 rounded bg-black/60 text-white text-sm hover:bg-black/80"
            >
              Preview
            </button>
          </>
        )}

        {item.media_type === "video" && (
          <video controls className="absolute w-full h-full bg-black/70 text-white text-xs">
            <source src={item.media_url} />
          </video>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-lg">{item.title}</h3>
        <p className="text-gray-600 text-sm mt-1">{item.description}</p>
      </div>
    </div>
    </div>
  );
  const filteredItems = items
    .filter((item) => item.section === activeCategory)
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  return (
    <>
      <div className="min-h-screen glass-effect luxury-shadow">
        <MomentsHero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <MomentsFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {/* CONTENT GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => renderItem(item, index))
            ) : (
              <p className="text-center col-span-full text-gray-600">
                No content available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4">
          <div className="relative bg-white max-w-5xl w-full rounded-2xl shadow-xl overflow-hidden">
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain bg-black"
            />

            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white px-4 py-2 rounded-full text-sm"
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

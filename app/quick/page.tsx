"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

  const sections = [
    { key: "dances", label: "Dances" },
    { key: "fun", label: "Fun Moments" },
    { key: "talent", label: "Talent" },
    { key: "articles", label: "Articles" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }
  return (
    <>
      <div className="min-h-screen bg-rose-tan-light">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center justify-center h-16 gap-2">
            <Link href="/">
              <Image src={"/logo.jpg"} alt={"Logo"} height={40} width={40} />
            </Link>

            <h1 className="text-4xl font-bold text-mauve-wine">
              Rotaract Moments
            </h1>
          </div>

          {sections.map((section) => {
            const filtered = items
              .filter((i) => i.section === section.key)
              .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

            if (!filtered.length) return null;

            return (
              <div key={section.key} className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  {section.label}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filtered.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl shadow-md overflow-hidden border"
                    >
                      <div className="relative w-full aspect-video bg-gray-200">
                        {item.media_type === "image" && (
                          <>
                            <img
                              src={item.thumbnail_url}
                              alt={item.title || ""}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() =>
                                setPreviewImage(
                                  item.media_url || item.thumbnail_url
                                )
                              }
                              className="absolute bottom-2 right-2 px-3 py-1 rounded bg-black/60 text-white text-sm hover:bg-black/80"
                            >
                              Preview
                            </button>
                          </>
                        )}

                        {item.media_type === "video" && (
                          <video
                            controls
                            preload="metadata"
                            className="w-full h-full object-cover"
                          >
                            <source src={item.media_url} />
                          </video>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {item.title}
                        </h3>

                        <p className="text-gray-600 text-sm mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {previewImage && (
        <div className="fixed inset-0 bg-black/70 z-50 flex">
          <div className="relative bg-white max-w-5xl w-full mx-auto my-6 rounded shadow overflow-y-auto max-h-[90vh]">
            <img src={previewImage} alt="Full view" className="w-full h-auto" />

            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 bg-black text-white px-3 py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

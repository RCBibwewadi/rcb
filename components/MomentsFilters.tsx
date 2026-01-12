"use client";

interface MomentsFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

import { Film, Laugh, Sparkles, FileText } from "lucide-react";

const categories = [
  { id: "dances", label: "Dances", icon: Film },
  { id: "fun", label: "Fun Moments", icon: Laugh },
  { id: "talent", label: "Talent", icon: Sparkles },
  { id: "articles", label: "Articles", icon: FileText },
];
  


export default function MomentsFilter({
  activeCategory,
  onCategoryChange,
}: MomentsFilterProps) {
  return (
    <div className="mb-12">
      <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeCategory === category.id
                ? "luxury-gradient text-white font-semibold shadow-lg drop-shadow-luxury-gold scale-105"
                : "bg-white hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <span className="flex items-center">
              <category.icon size={14} className="text-current" />
            </span>
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}

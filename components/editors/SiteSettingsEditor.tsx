"use client";
import React, { useState } from "react";

interface SiteConfig {
  siteName: string;
  tagline: string;
  clubLogo: string;
  adminPassword: string;
}

interface SiteSettingsEditorProps {
  initialData: SiteConfig;
  onSave: (config: SiteConfig) => void;
}

const SiteSettingsEditor: React.FC<SiteSettingsEditorProps> = ({ initialData, onSave }) => {
  const [config, setConfig] = useState<SiteConfig>(initialData || {
    siteName: "",
    tagline: "",
    clubLogo: "",
    adminPassword: ""
  });

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setConfig({ ...config, clubLogo: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="glass-effect rounded-xl p-6 luxury-shadow fade-in">
      <h3 className="text-2xl font-bold text-mauve-wine mb-6">Site Settings</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-mauve-wine-dark mb-2">Site Name</label>
          <input
            type="text"
            value={config.siteName}
            onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
            className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-mauve-wine-dark mb-2">Tagline</label>
          <input
            type="text"
            value={config.tagline}
            onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
            className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-mauve-wine-dark mb-2">Club Logo</label>
          <p className="text-sm text-mauve-wine-light mb-3">
            Upload your club logo that will appear in the navigation bar
          </p>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="url"
                value={config.clubLogo}
                placeholder="Enter image URL"
                onChange={(e) => setConfig({ ...config, clubLogo: e.target.value })}
                className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="club-logo-upload"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                }}
              />
              <button
                type="button"
                onClick={() => document.getElementById("club-logo-upload")?.click()}
                className="bg-rose-tan text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-tan-dark transition-colors text-sm"
              >
                Upload Image
              </button>
              {config.clubLogo && (
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, clubLogo: "" })}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors text-sm"
                >
                  Remove Image
                </button>
              )}
            </div>
          </div>
          {config.clubLogo && (
            <div className="mt-3">
              <img
                src={config.clubLogo}
                alt="Club Logo"
                className="h-20 w-20 object-cover rounded-lg border"
              />
            </div>
          )}
        </div>

        <button
          onClick={() => onSave(config)}
          className="luxury-gradient text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SiteSettingsEditor;

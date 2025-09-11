"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import Link from "next/link";
import HeroEditor from "@/components/editors/HeroEditor";
import AboutEditor from "@/components/editors/AboutEditor";
import { ContentData } from "@/lib/types";
import BoardEditor from "@/components/editors/BoardEditor";
import ProjectsEditor from "@/components/editors/ProjectsEditor";
import SiteSettingsEditor from "@/components/editors/SiteSettingsEditor";
import ContactEditor from "@/components/editors/ContactEditor";
import EventsEditor from "@/components/editors/EventsEditor";

const initialContent: ContentData = {
  hero: {
    backgroundImage: "",
    title: "",
    subtitle: "",
    description: "",
    ctaText: "",
  },
  about: {
    title: "",
    mainTitle: "",
    description1: "",
    description2: "",
    description3: "",
  },
  boardMembers: [],
  projects: [],
  events: [],
  contact: {},
  siteConfig: { siteName: "", tagline: "", clubLogo: "" },
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [section, setSection] = useState<string>("welcome");
  const [contentData, setContentData] = useState<ContentData>(initialContent);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Invalid password. Please try again.");
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPassword("");
    setSection("welcome");
  };

  const handleSave = (section: string, data: any) => {
    setContentData({ ...contentData, [section]: data });
    console.log("✅ Saved locally:", { section, data });
  };

  return (
    <div className="font-inter bg-luxury-cream min-h-screen">
      {!authenticated ? (
        // 🔒 Password Modal
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-effect rounded-xl p-8 max-w-md w-full mx-4 luxury-shadow">
            <div className="text-center mb-6">
              <div className="w-16 h-16 luxury-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-mauve-wine mb-2">
                Admin Access
              </h2>
              <p className="text-mauve-wine-light">
                Enter password to access content management
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="w-full luxury-gradient text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:opacity-90"
              >
                Access Dashboard
              </button>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
            </form>
            <div className="mt-4 text-center">
              <Link
                href="/"
                className="text-mauve-wine-light hover:text-rose-tan transition-colors text-sm"
              >
                ← Back to Website
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // ✅ Admin Dashboard
        <div id="admin-dashboard">
          {/* Header */}
          <header className="glass-effect border-b border-rose-tan-light luxury-shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 luxury-gradient rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">R</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-mauve-wine">
                      Admin Dashboard
                    </h1>
                    <p className="text-xs text-mauve-wine-light">
                      Content Management System
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => alert("🚀 Push changes to website")}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 luxury-shadow hover:scale-105 flex items-center space-x-2"
                  >
                    <span>Push to Website</span>
                  </button>
                  <a
                    href="/"
                    target="_blank"
                    className="text-mauve-wine hover:text-rose-tan transition-colors font-medium"
                  >
                    Preview Site
                  </a>
                  <button
                    onClick={handleLogout}
                    className="text-mauve-wine hover:text-rose-tan transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="flex">
            {/* Sidebar */}
            <nav className="w-64 bg-white border-r border-rose-tan-light luxury-shadow min-h-screen">
              <div className="p-4">
                <ul className="space-y-2">
                  {[
                    "hero",
                    "about",
                    "board",
                    "projects",
                    "events",
                    "contact",
                    "siteConfig",
                  ].map((sec) => (
                    <li key={sec}>
                      <button
                        onClick={() => setSection(sec)}
                        className={`nav-btn w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                          section === sec
                            ? "bg-luxury-cream text-mauve-wine"
                            : "text-mauve-wine hover:bg-luxury-cream"
                        }`}
                      >
                        {sec === "hero"
                          ? "Hero Section"
                          : sec === "about"
                          ? "About Section"
                          : sec === "board"
                          ? "Board Members"
                          : sec === "projects"
                          ? "Projects"
                          : sec === "events"
                          ? "Events"
                          : sec === "contact"
                          ? "Contact Info"
                          : "Site Settings"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 p-6">
              <div id="content-area" className="max-w-4xl">
                {section === "welcome" && (
                  <div id="welcome-section" className="fade-in">
                    <div className="glass-effect rounded-xl p-8 luxury-shadow">
                      <h2 className="text-3xl font-bold text-mauve-wine mb-4">
                        Welcome to Admin Dashboard
                      </h2>
                      <p className="text-mauve-wine-light mb-6">
                        Manage your Rotaract Club website content easily. Select
                        a section from the sidebar to get started.
                      </p>
                    </div>
                  </div>
                )}

                {section === "hero" && (
                  <HeroEditor
                    initialData={contentData.hero}
                    onSave={(d) => handleSave("hero", d)}
                  />
                )}

                {section === "about" && (
                  <AboutEditor
                    initialData={contentData.about}
                    onSave={(d) => handleSave("about", d)}
                  />
                )}
                 {/* ✅ New Sections */}
    {section === "board" && (
      <BoardEditor
        initialData={contentData.boardMembers}
        onSave={(d) => handleSave("boardMembers", d)}
      />
    )}

    {section === "projects" && (
      <ProjectsEditor
        initialData={contentData.projects}
        onSave={(d) => handleSave("projects", d)}
      />
    )}

     {section === "events" && (
      <EventsEditor
        initialData={contentData.events}
        onSave={(d) => handleSave("events", d)}
      />
    )}

    {section === "contact" && (
      <ContactEditor
        initialData={contentData.contact}
        onSave={(d) => handleSave("contact", d)}
      />
    )}

    {section === "siteConfig" && (
      <SiteSettingsEditor
        initialData={contentData.siteConfig}
        onSave={(d) => handleSave("siteConfig", d)}
      />
    )}

               </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

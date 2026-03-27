"use client";

import { useState } from "react";
import { RefreshCw, Settings, Users, Heart, Sliders, ToggleLeft } from "lucide-react";
import ToggleSection from "./ToggleSection";
import RequestsSection from "./RequestsSection";
import PreferencesSection from "./PreferencesSection";
import ReconciliationSection from "./ReconciliationSection";
import MatchesSection from "./MatchesSection";

type TabType = "requests" | "toggle" | "preferences" | "reconciliation" | "matches";

interface Tab {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { id: "requests", label: "Requests", icon: Users },
  { id: "toggle", label: "Toggle", icon: ToggleLeft },
  { id: "preferences", label: "Preferences", icon: Sliders },
  // { id: "reconciliation", label: "Reconciliation", icon: RefreshCw },
  // { id: "matches", label: "Matches", icon: Heart },
];

export default function MatchUp() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>("requests");

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "requests":
        return <RequestsSection key={`requests-${refreshKey}`} onRefresh={handleRefresh} />;
      case "toggle":
        return <ToggleSection key={`toggle-${refreshKey}`} />;
      case "preferences":
        return <PreferencesSection key={`preferences-${refreshKey}`} />;
      // case "reconciliation":
      //   return <ReconciliationSection key={`reconciliation-${refreshKey}`} />;
      // case "matches":
      //   return <MatchesSection key={`matches-${refreshKey}`} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-xl p-6 luxury-shadow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-mauve-wine">MatchUp Management</h2>
            <p className="text-mauve-wine-light text-sm mt-1">
              Manage MatchUp settings and user requests
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-rose-tan text-white rounded-lg hover:bg-rose-tan-dark transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-rose-tan-light pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-rose-tan text-white"
                    : "bg-white text-mauve-wine hover:bg-rose-tan-light/30 border border-rose-tan-light"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

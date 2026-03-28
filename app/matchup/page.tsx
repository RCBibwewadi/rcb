"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, User, Heart, Bell, Menu, X, Sparkles } from "lucide-react";
import RegistrationModal from "./RegistrationModal";
import ProfileTab from "./ProfileTab";
import PartnersTab from "./PartnersTab";
import ActivityTab from "./ActivityTab";
import MatchesModal from "./MatchesModal";
import NotificationDropdown from "./NotificationDropdown";
import {
  MatchUpSession,
  MatchUpNotification,
  MatchUpMatch,
  MatchUpUser,
  MatchUpProfile
} from "@/lib/types";

export default function MatchUpPage() {
  const [session, setSession] = useState<MatchUpSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "partners" | "activity">("profile");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<MatchUpNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMatchesModal, setShowMatchesModal] = useState(false);
  const [pendingMatches, setPendingMatches] = useState<MatchUpMatch[]>([]);
  const [matchingEnabled, setMatchingEnabled] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/matchup/session");
      if (res.ok) {
        const data = await res.json();
        setSession(data);
      }
    } catch (error) {
      console.error("Session fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/matchup/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error("Notifications fetch error:", error);
    }
  }, [session?.user]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/matchup/settings");
      if (res.ok) {
        const data = await res.json();
        setMatchingEnabled(data.matching_enabled ?? false);
      }
    } catch (error) {
      console.error("Settings fetch error:", error);
    }
  }, []);

  const fetchPendingMatches = useCallback(async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/matchup/matches");
      if (res.ok) {
        const data = await res.json();
        setPendingMatches(data.pending_matches || []);
      }
    } catch (error) {
      console.error("Matches fetch error:", error);
    }
  }, [session?.user]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      fetchSettings();
      fetchPendingMatches();
    }
  }, [session?.user, fetchNotifications, fetchSettings, fetchPendingMatches]);

  const handleLogout = async () => {
    await fetch("/api/matchup/logout", { method: "POST" });
    setSession(null);
    setActiveTab("profile");
  };

  const handleRegistrationSuccess = () => {
    setShowRegistration(false);
  };

  const handleLoginSuccess = () => {
    setShowRegistration(false);
    fetchSession();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 luxury-gradient rounded-full"></div>
          <div className="h-4 w-32 bg-rose-tan-light/30 rounded"></div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-luxury-cream">
        <nav className="fixed top-0 left-0 right-0 z-50 glass-effect luxury-shadow">
          <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
            <h1 className="text-xl font-bold text-mauve-wine">Figure It Out</h1>
            <Link
              href="/"
              className="flex items-center gap-2 text-mauve-wine hover:text-rose-tan transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Go to Home</span>
            </Link>
          </div>
        </nav>

        <div className="pt-24 pb-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-mauve-wine mb-6">
              Figure It Out
            </h2>
            <div className="max-w-xl mx-auto text-center mb-8">
              <p className="text-lg text-mauve-wine-light mb-4 leading-relaxed">
                Not everything needs a plan.
              </p>

              <p className="text-lg text-mauve-wine-light mb-4 leading-relaxed">
                Sometimes, you just have to figure it out.
              </p>

              <p className="text-lg text-mauve-wine-light mb-6 leading-relaxed">
                Step in, explore a few people, and go with what feels right.
                <br />
                No pressure, no labels — just instincts, choices, and a little curiosity.
              </p>

              <p className="text-lg text-mauve-wine font-semibold italic">
                You might be surprised where it leads.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRegistration(true)}
              className="luxury-gradient text-white font-semibold px-8 py-4 rounded-xl luxury-shadow text-lg"
            >
              Step In
            </motion.button>
            <p className="mt-6 text-sm text-mauve-wine-light">
              Already registered? Wait for admin approval to access your account.
            </p>
          </motion.div>
        </div>

        <AnimatePresence>
          {showRegistration && (
            <RegistrationModal
              onClose={() => setShowRegistration(false)}
              onSuccess={handleRegistrationSuccess}
              onLoginSuccess={handleLoginSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (session.user.status === "pending") {
    return (
      <div className="min-h-screen bg-luxury-cream flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-effect rounded-2xl p-8 max-w-md w-full text-center luxury-shadow"
        >
          <div className="w-16 h-16 luxury-gradient rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-mauve-wine mb-4">
            Awaiting Approval
          </h2>
          <p className="text-mauve-wine-light mb-6">
            Your registration is pending admin approval. You will be notified via email once approved.
          </p>
          <button
            onClick={handleLogout}
            className="text-rose-tan hover:text-rose-tan-dark font-medium"
          >
            Logout
          </button>
        </motion.div>
      </div>
    );
  }

  if (session.user.status === "declined") {
    return (
      <div className="min-h-screen bg-luxury-cream flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-effect rounded-2xl p-8 max-w-md w-full text-center luxury-shadow"
        >
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-mauve-wine mb-4">
            Registration Declined
          </h2>
          <p className="text-mauve-wine-light mb-6">
            Unfortunately, your registration has been declined. Please contact the administrator for more information.
          </p>
          <button
            onClick={handleLogout}
            className="text-rose-tan hover:text-rose-tan-dark font-medium"
          >
            Logout
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-cream">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect luxury-shadow">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-mauve-wine">Figure It Out</h1>
          <div className="flex items-center gap-4">
            <div className="relative pt-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-mauve-wine hover:text-rose-tan transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <NotificationDropdown
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                    onMarkRead={fetchNotifications}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 font-medium transition-colors ${activeTab === "profile"
                    ? "text-rose-tan"
                    : "text-mauve-wine hover:text-rose-tan"
                  }`}
              >
                <User className="w-5 h-5" />
                Profile
              </button>

              {matchingEnabled && !session.user.is_matched && (
                <button
                  onClick={() => setActiveTab("partners")}
                  className={`flex items-center gap-2 font-medium transition-colors ${activeTab === "partners"
                      ? "text-rose-tan"
                      : "text-mauve-wine hover:text-rose-tan"
                    }`}
                >
                  <Heart className="w-5 h-5" />
                  Partners
                </button>
              )}

              {session.user.is_matched && (
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`flex items-center gap-2 font-medium transition-colors ${activeTab === "activity"
                      ? "text-rose-tan"
                      : "text-mauve-wine hover:text-rose-tan"
                    }`}
                >
                  <Sparkles className="w-5 h-5" />
                  Activity
                </button>
              )}

              {pendingMatches.length > 0 && (
                <button
                  onClick={() => setShowMatchesModal(true)}
                  className="relative luxury-gradient text-white px-4 py-2 rounded-lg font-medium"
                >
                  <Heart className="w-4 h-4 inline mr-2" />
                  {pendingMatches.length} Match{pendingMatches.length > 1 ? "es" : ""}
                </button>
              )}

              <button
                onClick={handleLogout}
                className="text-mauve-wine-light hover:text-rose-tan text-sm"
              >
                Logout
              </button>
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-mauve-wine"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-rose-tan-light/30"
            >
              <div className="p-4 space-y-3">
                <button
                  onClick={() => {
                    setActiveTab("profile");
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === "profile"
                      ? "bg-rose-tan/10 text-rose-tan"
                      : "text-mauve-wine"
                    }`}
                >
                  <User className="w-5 h-5 inline mr-2" />
                  Profile
                </button>

                {matchingEnabled && !session.user.is_matched && (
                  <button
                    onClick={() => {
                      setActiveTab("partners");
                      setShowMobileMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === "partners"
                        ? "bg-rose-tan/10 text-rose-tan"
                        : "text-mauve-wine"
                      }`}
                  >
                    <Heart className="w-5 h-5 inline mr-2" />
                    Partners
                  </button>
                )}

                {session.user.is_matched && (
                  <button
                    onClick={() => {
                      setActiveTab("activity");
                      setShowMobileMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === "activity"
                        ? "bg-rose-tan/10 text-rose-tan"
                        : "text-mauve-wine"
                      }`}
                  >
                    <Sparkles className="w-5 h-5 inline mr-2" />
                    Activity
                  </button>
                )}

                {pendingMatches.length > 0 && (
                  <button
                    onClick={() => {
                      setShowMatchesModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg luxury-gradient text-white"
                  >
                    <Heart className="w-5 h-5 inline mr-2" />
                    {pendingMatches.length} Match{pendingMatches.length > 1 ? "es" : ""}
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded-lg text-mauve-wine-light"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <ProfileTab
                  user={session.user}
                  profile={session.profile}
                  onUpdate={fetchSession}
                />
              </motion.div>
            )}
            {activeTab === "partners" && (
              <motion.div
                key="partners"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <PartnersTab
                  userId={session.user.id}
                  userGender={session.user.gender}
                  isMatched={session.user.is_matched}
                  onMatch={() => {
                    fetchPendingMatches();
                    fetchSession();
                  }}
                />
              </motion.div>
            )}
            {activeTab === "activity" && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ActivityTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showMatchesModal && (
          <MatchesModal
            matches={pendingMatches}
            onClose={() => setShowMatchesModal(false)}
            onAction={(accepted, confirmed) => {
              fetchPendingMatches();
              fetchSession();
              if (accepted && confirmed) {
                setShowMatchesModal(false);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

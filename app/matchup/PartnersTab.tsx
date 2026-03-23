"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Heart, X, Loader2, RefreshCw, User } from "lucide-react";
import { PartnerWithScore } from "@/lib/types";
import { formatMatchScore, getAgeFromDOB } from "@/lib/matchup/utils";

interface PartnersTabProps {
  userId: string;
  userGender: string;
  isMatched: boolean;
  onMatch: () => void;
}

export default function PartnersTab({ userId, userGender, isMatched, onMatch }: PartnersTabProps) {
  const [partners, setPartners] = useState<PartnerWithScore[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [error, setError] = useState("");
  const [matchPopup, setMatchPopup] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-20, 0, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/matchup/partners");
      const data = await res.json();

      if (!res.ok) {
        if (data.max_pending_reached) {
          setError("You have reached the maximum pending matches. Please accept or reject one in your matches.");
        } else if (data.is_matched) {
          setError("You are already matched with someone.");
        } else if (!data.matching_enabled) {
          setError("Matching is currently disabled by admin.");
        } else {
          throw new Error(data.error || "Failed to fetch partners");
        }
        setPartners([]);
      } else {
        setPartners(data.partners || []);
        setCurrentIndex(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isMatched) {
      fetchPartners();
    }
  }, [fetchPartners, isMatched]);

  const handleSwipe = async (direction: "left" | "right") => {
    if (swiping || partners.length === 0 || currentIndex >= partners.length) return;

    const currentPartner = partners[currentIndex];
    setSwiping(true);

    try {
      const res = await fetch("/api/matchup/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          swiped_id: currentPartner.user.id,
          direction,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to swipe");
      }

      if (data.is_match) {
        setMatchPopup(true);
        setTimeout(() => {
          setMatchPopup(false);
          onMatch();
        }, 2500);
      }

      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setSwiping(false);
      }, 300);
    } catch (err) {
      console.error("Swipe error:", err);
      setSwiping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-rose-tan mx-auto mb-4" />
          <p className="text-mauve-wine-light">Finding potential matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-effect rounded-2xl p-8 text-center luxury-shadow">
        <p className="text-mauve-wine mb-4">{error}</p>
        <button
          onClick={fetchPartners}
          className="luxury-gradient text-white px-6 py-2 rounded-lg font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (partners.length === 0 || currentIndex >= partners.length) {
    return (
      <div className="glass-effect rounded-2xl p-8 text-center luxury-shadow">
        <User className="w-16 h-16 text-mauve-wine-light mx-auto mb-4" />
        <h3 className="text-xl font-bold text-mauve-wine mb-2">No More Profiles</h3>
        <p className="text-mauve-wine-light mb-4">
          You have viewed all available profiles. Check back later for new matches!
        </p>
        <button
          onClick={fetchPartners}
          className="luxury-gradient text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    );
  }

  const currentPartner = partners[currentIndex];

  return (
    <div className="relative">
      <AnimatePresence>
        {matchPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div className="glass-effect rounded-2xl p-8 text-center luxury-shadow max-w-sm mx-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 bg-gradient-to-r from-rose-tan to-rose-tan-dark rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Heart className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-mauve-wine mb-2">It's a Match!</h3>
              <p className="text-mauve-wine-light">
                You have a new pending match! Check your matches to respond.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-effect rounded-2xl p-6 luxury-shadow mb-4">
        <p className="text-sm text-mauve-wine-light text-center">
          {currentIndex + 1} of {partners.length} profiles
        </p>
      </div>

      <div className="relative h-[600px] sm:h-[650px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPartner.user.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) {
                handleSwipe("right");
              } else if (info.offset.x < -100) {
                handleSwipe("left");
              }
            }}
            className="absolute inset-0 glass-effect rounded-2xl luxury-shadow overflow-y-auto cursor-grab active:cursor-grabbing"
          >
            <div className="flex flex-col">
              {currentPartner.profile?.photo1_url ? (
                <img
                  src={currentPartner.profile.photo1_url}
                  alt={currentPartner.user.name}
                  className="w-full max-h-[65vh] object-contain bg-black rounded-t-2xl"
                />
              ) : (
                <div className="w-full h-72 sm:h-80 bg-luxury-cream rounded-t-2xl flex items-center justify-center">
                  <User className="w-20 h-20 text-rose-tan-light" />
                </div>
              )}

              <div className="p-4 text-center border-b border-rose-tan-light/20">
                <h2 className="text-xl font-bold text-mauve-wine">
                  {currentPartner.profile?.username || currentPartner.user.name}
                </h2>
                <div className="flex items-center justify-center gap-3 mt-2 text-sm text-mauve-wine-light">
                  {currentPartner.profile?.zodiac_sign && (
                    <span>{currentPartner.profile.zodiac_sign}</span>
                  )}
                  {currentPartner.profile?.zodiac_sign && currentPartner.profile?.dob && (
                    <span className="text-rose-tan-light">•</span>
                  )}
                  {currentPartner.profile?.dob && (
                    <span>{getAgeFromDOB(currentPartner.profile.dob)} years old</span>
                  )}
                </div>
                <div className="mt-3">
                  <span className="luxury-gradient text-white px-3 py-1 rounded-full text-sm font-medium">
                    {formatMatchScore(currentPartner.match_score)} Match
                  </span>
                </div>
              </div>

              {currentPartner.profile?.photo2_url && (
                <img
                  src={currentPartner.profile.photo2_url}
                  alt={`${currentPartner.user.name} photo 2`}
                  className="w-full max-h-[40vh] object-contain bg-black"

                />
              )}

              {currentPartner.profile?.prompt1 && (
                <div className="p-4 border-b border-rose-tan-light/20">
                  <p className="text-xs text-mauve-wine-light mb-1">About</p>
                  <p className="text-mauve-wine text-sm">{currentPartner.profile.prompt1}</p>
                </div>
              )}

              {currentPartner.profile?.prompt2 && (
                <div className="p-4 border-b border-rose-tan-light/20">
                  <p className="text-xs text-mauve-wine-light mb-1">More about me</p>
                  <p className="text-mauve-wine text-sm">{currentPartner.profile.prompt2}</p>
                </div>
              )}

              {currentPartner.profile?.photo3_url && (
                <img
                  src={currentPartner.profile.photo3_url}
                  alt={`${currentPartner.user.name} photo 3`}
                  className="w-full max-h-[40vh] object-contain bg-black"

                />
              )}

              {currentPartner.profile?.prompt3 && (
                <div className="p-4 border-b border-rose-tan-light/20">
                  <p className="text-xs text-mauve-wine-light mb-1">Fun fact</p>
                  <p className="text-mauve-wine text-sm">{currentPartner.profile.prompt3}</p>
                </div>
              )}

              <div className="h-8"></div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4">
          <motion.div
            animate={{ opacity: x.get() < -50 ? 1 : 0 }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold"
          >
            NOPE
          </motion.div>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4">
          <motion.div
            animate={{ opacity: x.get() > 50 ? 1 : 0 }}
            className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold"
          >
            LIKE
          </motion.div>
        </div>
      </div>

      <div className="flex justify-center gap-8 mt-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe("left")}
          disabled={swiping}
          className="w-16 h-16 rounded-full bg-white border-2 border-red-400 text-red-400 flex items-center justify-center luxury-shadow disabled:opacity-50"
        >
          <X className="w-8 h-8" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe("right")}
          disabled={swiping}
          className="w-16 h-16 rounded-full luxury-gradient text-white flex items-center justify-center luxury-shadow disabled:opacity-50"
        >
          <Heart className="w-8 h-8" />
        </motion.button>
      </div>
    </div>
  );
}

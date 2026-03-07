"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GameHero from "@/components/game/GameHero";
import SeriesGrid from "@/components/game/SeriesGrid";
import QuizModal from "@/components/game/QuizModal";
import LeaderboardModal from "@/components/game/LeaderboardModal";
import GlobalLeaderboard from "@/components/game/GlobalLeaderboard";
import AuthModal from "@/components/game/AuthModal";
import { SeriesCard } from "@/lib/types";

export default function GamePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [series, setSeries] = useState<SeriesCard[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<SeriesCard | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardSeriesId, setLeaderboardSeriesId] = useState<string | null>(null);
  const [gameVisible, setGameVisible] = useState<boolean | null>(null);
  const [showAlreadyRegisteredBanner, setShowAlreadyRegisteredBanner] = useState(false);
  const [completedSeriesIds, setCompletedSeriesIds] = useState<string[]>([]);
  const [errorBanner, setErrorBanner] = useState<string>("");

  useEffect(() => {
    const initializePage = async () => {
      await Promise.all([
        checkGameVisibility(),
        checkAuth(),
        fetchSeries()
      ]);
    };
    initializePage();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCompletedSeries();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/game/verify");
      if (response.ok) {
        setIsAuthenticated(true);
        setIsRegistered(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkGameVisibility = async () => {
    try {
      const response = await fetch("/api/game/settings");
      const data = await response.json();
      setGameVisible(data.isVisible);
    } catch (error) {
      console.error("Failed to check game visibility:", error);
      setGameVisible(false);
    }
  };

  const fetchSeries = async () => {
    try {
      const response = await fetch("/api/game/series");
      const data = await response.json();
      setSeries(data.series || []);
    } catch (error) {
      console.error("Failed to fetch series:", error);
    }
  };

  const fetchCompletedSeries = async () => {
    try {
      const response = await fetch("/api/game/completed");
      const data = await response.json();
      setCompletedSeriesIds(data.completedSeriesIds || []);
    } catch (error) {
      console.error("Failed to fetch completed series:", error);
    }
  };

  const handleSeriesClick = (seriesCard: SeriesCard) => {
    if (!isAuthenticated) {
      setErrorBanner("Please login to play the quiz!");
      setTimeout(() => setErrorBanner(""), 5000);
      return;
    }
    
    // Check if already completed
    if (completedSeriesIds.includes(seriesCard.id)) {
      setErrorBanner("You have already completed this quiz! You can only attempt each series once.");
      setTimeout(() => setErrorBanner(""), 5000);
      return;
    }
    
    setSelectedSeries(seriesCard);
    setShowQuizModal(true);
  };

  const handleViewLeaderboard = (seriesId: string) => {
    setLeaderboardSeriesId(seriesId);
    setShowLeaderboard(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setIsRegistered(true);
    setShowAuthModal(false);
    fetchCompletedSeries(); // Fetch completed series after login
  };

  const handleRegisterClick = () => {
    if (isRegistered) {
      setShowAlreadyRegisteredBanner(true);
      setTimeout(() => setShowAlreadyRegisteredBanner(false), 5000); // Hide after 5 seconds
      return;
    }
    setAuthMode("register");
    setShowAuthModal(true);
  };

  const handleLoginClick = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  // Show loading only initially
  if (isLoading || gameVisible === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-rose-tan mx-auto mb-4"></div>
          <p className="text-mauve-wine">Loading...</p>
        </div>
      </div>
    );
  }

  // Game not visible
  if (!gameVisible) {
    return (
      <div className="min-h-screen bg-luxury-cream">
        <Navbar />
        
        {/* Already Registered Banner */}
        {showAlreadyRegisteredBanner && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-lg luxury-shadow-lg flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold text-lg">Already Registered!</p>
                <p className="text-sm">You can play on game day. Please login to continue.</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-4xl font-bold text-mauve-wine mb-4">
              Game Coming Soon!
            </h1>
            <p className="text-mauve-wine-light mb-6">
              Fandom Quest will be available soon! Register now so you&apos;re ready to jump in as soon as it goes live.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRegisterClick}
                className="bg-gradient-to-br from-rose-tan to-mauve-wine text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold"
              >
                Register Now
              </button>
              <button
                onClick={() => router.push("/")}
                className="border-2 border-mauve-wine text-mauve-wine hover:bg-mauve-wine hover:text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
        <Footer />
        
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleAuthSuccess}
            defaultMode={authMode}
          />
        )}
      </div>
    );
  }

  // Game is visible
  return (
    <div className="min-h-screen bg-luxury-cream">
      <Navbar />
      <GameHero />
      
      {/* Error Banner */}
      {errorBanner && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down max-w-md">
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg luxury-shadow-lg flex items-center gap-3">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm flex-1">{errorBanner}</p>
          </div>
        </div>
      )}
      
      {/* Already Registered Banner */}
      {showAlreadyRegisteredBanner && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down max-w-md">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-lg luxury-shadow-lg flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold text-lg">Already Registered!</p>
              <p className="text-sm">You can play on game day. Please login to continue.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Registration/Login Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-mauve-wine/5 to-rose-tan/5">
        <div className="max-w-4xl mx-auto text-center">
          {!isAuthenticated ? (
            <div className="bg-white rounded-xl p-6 luxury-shadow">
              <h3 className="text-2xl font-bold text-mauve-wine mb-3">
                {isRegistered ? "Welcome Back!" : "Ready to Play?"}
              </h3>
              <p className="text-mauve-wine-light mb-6">
                {isRegistered 
                  ? "Login to start playing the quiz and compete on leaderboards!"
                  : "Register now to participate in the Fandom Quest!"}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleLoginClick}
                  className="bg-mauve-wine hover:bg-mauve-wine-dark text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                >
                  Login to Play
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="border-2 border-mauve-wine text-mauve-wine hover:bg-mauve-wine hover:text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                >
                  Go to Home
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 luxury-shadow">
              <h3 className="text-2xl font-bold text-mauve-wine mb-3">
                Welcome! You&apos;re Ready to Play 🎮
              </h3>
              <p className="text-mauve-wine-light mb-6">
                Choose a series below to start your quiz challenge!
              </p>
              <button
                onClick={() => router.push("/")}
                className="border-2 border-mauve-wine text-mauve-wine hover:bg-mauve-wine hover:text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Go to Home
              </button>
            </div>
          )}
        </div>
      </section>
        {isRegistered &&
        <>
      <SeriesGrid
        series={series}
        onSeriesClick={handleSeriesClick}
        onViewLeaderboard={handleViewLeaderboard}
        completedSeriesIds={completedSeriesIds}
      />
      <GlobalLeaderboard />
      </>
      }
      <Footer />

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          defaultMode={authMode}
        />
      )}

      {showQuizModal && selectedSeries && (
        <QuizModal
          series={selectedSeries}
          onClose={() => {
            setShowQuizModal(false);
            setSelectedSeries(null);
          }}
          onQuizComplete={fetchCompletedSeries}
        />
      )}

      {showLeaderboard && leaderboardSeriesId && (
        <LeaderboardModal
          seriesId={leaderboardSeriesId}
          onClose={() => {
            setShowLeaderboard(false);
            setLeaderboardSeriesId(null);
          }}
        />
      )}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Lock,
  Calendar,
  Tag,
  Upload,
  CheckCircle,
  ChevronRight,
  LogOut,
  Award,
  Users,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type View =
  | "landing"
  | "register"
  | "pending"
  | "login"
  | "profile"
  | "vote"
  | "categorize"
  | "anonymous"
  | "done";

interface VotingUser {
  id: string;
  name: string;
  display_name?: string;
  email: string;
  rid: string;
  dob: string;
  photo_url?: string;
  has_voted: boolean;
  has_categorized: boolean;
  has_messaged: boolean;
}

interface Nominee {
  id: string;
  category_id: string;
  name: string;
  photo_url?: string;
}

interface VotingCategory {
  id: string;
  name: string;
  description?: string;
  nominees: Nominee[];
}

interface LabelCategory {
  id: string;
  name: string;
}

interface UserCard {
  id: string;
  name: string;
  display_name?: string;
  photo_url?: string;
}

export default function VotingPage() {
  const [view, setView] = useState<View>("landing");
  const [user, setUser] = useState<VotingUser | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regDisplayName, setRegDisplayName] = useState("");
  const [regRid, setRegRid] = useState("");
  const [regDob, setRegDob] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Profile photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Voting state
  const [categories, setCategories] = useState<VotingCategory[]>([]);
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});

  // Categorization state
  const [labelCategories, setLabelCategories] = useState<LabelCategory[]>([]);
  const [usersToLabel, setUsersToLabel] = useState<UserCard[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<Record<string, string>>({});

  // Anonymous message state
  const [anonMessage, setAnonMessage] = useState("");

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch("/api/voting/session");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        routeAfterLogin(data);
      }
    } finally {
      setCheckingSession(false);
    }
  }

  function routeAfterLogin(data: any) {
    if (!data.has_completed_profile) {
      setView("profile");
    } else if (!data.has_voted) {
      setView("vote");
      loadVotingData();
    } else if (!data.has_categorized) {
      setView("categorize");
      loadCategorizationData();
    } else if (!data.has_messaged) {
      setView("anonymous");
    } else {
      setView("done");
    }
  }

  async function loadVotingData() {
    const res = await fetch("/api/voting/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories || []);
    }
  }

  async function loadCategorizationData() {
    const [labelsRes, usersRes] = await Promise.all([
      fetch("/api/voting/labels"),
      fetch("/api/voting/users"),
    ]);
    if (labelsRes.ok) {
      const d = await labelsRes.json();
      setLabelCategories(d.labels || []);
    }
    if (usersRes.ok) {
      const d = await usersRes.json();
      setUsersToLabel(d.users || []);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/voting/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          display_name: regDisplayName,
          rid: regRid,
          dob: regDob,
          email: regEmail,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      setView("pending");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/voting/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      setUser(data.user);
      // Re-check session to get complete state
      const sessionRes = await fetch("/api/voting/session");
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        routeAfterLogin(sessionData);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePhotoUpload() {
    if (!photoFile) {
      // Skip photo, go to vote
      setView("vote");
      loadVotingData();
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", photoFile);
      const res = await fetch("/api/voting/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      setUser((prev) => prev ? { ...prev, photo_url: data.url } : prev);
      setView("vote");
      loadVotingData();
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitVotes() {
    const activeCategories = categories.filter((c) => c.nominees.length > 0);
    if (Object.keys(selectedVotes).length < activeCategories.length) {
      setError("Please vote in all categories before submitting");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const votes = Object.entries(selectedVotes).map(([category_id, nominee_id]) => ({
        category_id,
        nominee_id,
      }));
      const res = await fetch("/api/voting/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit votes");
        return;
      }
      setUser((prev) => prev ? { ...prev, has_voted: true } : prev);
      setView("categorize");
      loadCategorizationData();
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitLabels() {
    if (Object.keys(selectedLabels).length < usersToLabel.length) {
      setError("Please assign a label to all users before submitting");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const labels = Object.entries(selectedLabels).map(([labeled_user_id, label_category_id]) => ({
        labeled_user_id,
        label_category_id,
      }));
      const res = await fetch("/api/voting/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labels }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit categorization");
        return;
      }
      setUser((prev) => prev ? { ...prev, has_categorized: true } : prev);
      setView("anonymous");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnonymous() {
    if (!anonMessage.trim()) {
      setError("Please write a message before submitting");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/voting/anonymous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: anonMessage }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit message");
        return;
      }
      setUser((prev) => prev ? { ...prev, has_messaged: true } : prev);
      setView("done");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/voting/logout", { method: "POST" });
    setUser(null);
    setView("landing");
    setError("");
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-tan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-cream">
      {/* Header */}
      <header className="glass-effect border-b border-rose-tan-light luxury-shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 luxury-gradient rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-mauve-wine font-semibold">Rotaract</span>
          </Link>
          <div className="flex items-center space-x-4">
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-mauve-wine-light hover:text-rose-tan transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
            {!user && view !== "landing" && (
              <button
                onClick={() => { setView("landing"); setError(""); }}
                className="flex items-center space-x-1 text-mauve-wine-light hover:text-rose-tan transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* ─── LANDING ─── */}
        {view === "landing" && (
          <div className="text-center">
            <div className="w-20 h-20 luxury-gradient rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-mauve-wine mb-3">Awards & Voting</h1>
            <p className="text-mauve-wine-light mb-10 text-lg">
              Cast your votes, label your peers, and leave an anonymous message.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => { setView("register"); setError(""); }}
                className="luxury-gradient text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-all"
              >
                Register
              </button>
              <button
                onClick={() => { setView("login"); setError(""); }}
                className="border-2 border-rose-tan text-mauve-wine font-semibold px-8 py-3 rounded-lg hover:bg-rose-tan hover:text-white transition-all"
              >
                Login
              </button>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 text-center">
              {[
                { icon: Award, label: "Vote", desc: "Vote in award categories" },
                { icon: Users, label: "Label", desc: "Categorize 3 peers" },
                { icon: MessageSquare, label: "Message", desc: "Leave an anonymous note" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="glass-effect rounded-xl p-4 luxury-shadow">
                  <Icon className="w-7 h-7 text-rose-tan mx-auto mb-2" />
                  <div className="font-semibold text-mauve-wine text-sm">{label}</div>
                  <div className="text-mauve-wine-light text-xs mt-1">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── REGISTER ─── */}
        {view === "register" && (
          <div className="glass-effect rounded-2xl p-8 luxury-shadow">
            <h2 className="text-2xl font-bold text-mauve-wine mb-6">Create Account</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <InputField
                icon={<User className="w-4 h-4" />}
                placeholder="Full Name"
                value={regName}
                onChange={setRegName}
                required
              />
              <InputField
                icon={<Tag className="w-4 h-4" />}
                placeholder="Display Name (optional)"
                value={regDisplayName}
                onChange={setRegDisplayName}
              />
              <InputField
                icon={<User className="w-4 h-4" />}
                placeholder="RID (Unique Identifier)"
                value={regRid}
                onChange={setRegRid}
                required
              />
              <InputField
                icon={<Calendar className="w-4 h-4" />}
                placeholder="Date of Birth"
                value={regDob}
                onChange={setRegDob}
                type="date"
                required
              />
              <InputField
                icon={<Mail className="w-4 h-4" />}
                placeholder="Email Address"
                value={regEmail}
                onChange={setRegEmail}
                type="email"
                required
              />
              <InputField
                icon={<Lock className="w-4 h-4" />}
                placeholder="Password (min 6 chars)"
                value={regPassword}
                onChange={setRegPassword}
                type="password"
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full luxury-gradient text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
            <p className="text-center text-sm text-mauve-wine-light mt-4">
              Already have an account?{" "}
              <button
                onClick={() => { setView("login"); setError(""); }}
                className="text-rose-tan hover:underline font-medium"
              >
                Login
              </button>
            </p>
          </div>
        )}

        {/* ─── PENDING ─── */}
        {view === "pending" && (
          <div className="text-center glass-effect rounded-2xl p-10 luxury-shadow">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-mauve-wine mb-3">Registration Submitted</h2>
            <p className="text-mauve-wine-light mb-6">
              Your account is pending admin approval. You will be notified once approved.
            </p>
            <button
              onClick={() => { setView("login"); setError(""); }}
              className="luxury-gradient text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-all"
            >
              Go to Login
            </button>
          </div>
        )}

        {/* ─── LOGIN ─── */}
        {view === "login" && (
          <div className="glass-effect rounded-2xl p-8 luxury-shadow">
            <h2 className="text-2xl font-bold text-mauve-wine mb-6">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <InputField
                icon={<Mail className="w-4 h-4" />}
                placeholder="Email Address"
                value={loginEmail}
                onChange={setLoginEmail}
                type="email"
                required
              />
              <InputField
                icon={<Lock className="w-4 h-4" />}
                placeholder="Password"
                value={loginPassword}
                onChange={setLoginPassword}
                type="password"
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full luxury-gradient text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            <p className="text-center text-sm text-mauve-wine-light mt-4">
              No account?{" "}
              <button
                onClick={() => { setView("register"); setError(""); }}
                className="text-rose-tan hover:underline font-medium"
              >
                Register
              </button>
            </p>
          </div>
        )}

        {/* ─── PROFILE SETUP ─── */}
        {view === "profile" && (
          <div className="glass-effect rounded-2xl p-8 luxury-shadow">
            <StepIndicator current={0} />
            <h2 className="text-2xl font-bold text-mauve-wine mb-2">Profile Setup</h2>
            <p className="text-mauve-wine-light mb-6 text-sm">
              Upload a profile photo so others can recognize you. You can skip this step.
            </p>
            <div className="flex flex-col items-center gap-4 mb-6">
              <div
                className="w-28 h-28 rounded-full border-2 border-dashed border-rose-tan-light flex items-center justify-center bg-white cursor-pointer overflow-hidden"
                onClick={() => photoInputRef.current?.click()}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-8 h-8 text-rose-tan-light" />
                )}
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setPhotoFile(f);
                    setPhotoPreview(URL.createObjectURL(f));
                  }
                }}
              />
              <button
                onClick={() => photoInputRef.current?.click()}
                className="text-rose-tan text-sm hover:underline flex items-center gap-1"
              >
                <Upload className="w-4 h-4" />
                {photoFile ? "Change Photo" : "Select Photo"}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={handlePhotoUpload}
                disabled={loading}
                className="flex-1 luxury-gradient text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Uploading..." : photoFile ? (
                  <><Upload className="w-4 h-4" /> Upload & Continue</>
                ) : (
                  <><ChevronRight className="w-4 h-4" /> Skip & Continue</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ─── VOTE ─── */}
        {view === "vote" && (
          <div>
            <StepIndicator current={1} />
            <h2 className="text-2xl font-bold text-mauve-wine mb-2">Cast Your Votes</h2>
            <p className="text-mauve-wine-light mb-6 text-sm">
              Select one nominee per category. All categories must be voted on.
            </p>
            {categories.length === 0 ? (
              <div className="glass-effect rounded-2xl p-8 text-center text-mauve-wine-light luxury-shadow">
                No voting categories available yet.
              </div>
            ) : (
              <div className="space-y-6">
                {categories.map((cat) => (
                  <div key={cat.id} className="glass-effect rounded-2xl p-6 luxury-shadow">
                    <h3 className="text-lg font-semibold text-mauve-wine mb-1">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-mauve-wine-light text-sm mb-4">{cat.description}</p>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {cat.nominees.map((nominee) => {
                        const selected = selectedVotes[cat.id] === nominee.id;
                        return (
                          <button
                            key={nominee.id}
                            onClick={() =>
                              setSelectedVotes((prev) => ({ ...prev, [cat.id]: nominee.id }))
                            }
                            className={`rounded-xl p-3 border-2 text-left transition-all ${
                              selected
                                ? "border-rose-tan bg-rose-tan/10"
                                : "border-rose-tan-light bg-white hover:border-rose-tan"
                            }`}
                          >
                            {nominee.photo_url ? (
                              <img
                                src={nominee.photo_url}
                                alt={nominee.name}
                                className="w-12 h-12 rounded-full object-cover mb-2 mx-auto"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-rose-tan/20 flex items-center justify-center mb-2 mx-auto">
                                <User className="w-5 h-5 text-rose-tan" />
                              </div>
                            )}
                            <div className="text-center text-sm font-medium text-mauve-wine">
                              {nominee.name}
                            </div>
                            {selected && (
                              <div className="flex justify-center mt-1">
                                <CheckCircle className="w-4 h-4 text-rose-tan" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  onClick={handleSubmitVotes}
                  disabled={loading || Object.keys(selectedVotes).length < categories.filter(c => c.nominees.length > 0).length}
                  className="w-full luxury-gradient text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Submitting..." : <><span>Submit Votes</span><ChevronRight className="w-4 h-4" /></>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── CATEGORIZE ─── */}
        {view === "categorize" && (
          <div>
            <StepIndicator current={2} />
            <h2 className="text-2xl font-bold text-mauve-wine mb-2">Label Your Peers</h2>
            <p className="text-mauve-wine-light mb-6 text-sm">
              Assign one label to each of the three members below.
            </p>
            {usersToLabel.length === 0 ? (
              <div className="glass-effect rounded-2xl p-8 text-center luxury-shadow">
                <p className="text-mauve-wine-light mb-4">
                  Not enough users to categorize. Skipping this step.
                </p>
                <button
                  onClick={async () => {
                    // Auto-complete categorization step
                    const res = await fetch("/api/voting/categorize", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ labels: [] }),
                    });
                    if (res.ok || res.status === 400) {
                      setView("anonymous");
                    }
                  }}
                  className="luxury-gradient text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-all"
                >
                  Continue
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {usersToLabel.map((u) => (
                  <div key={u.id} className="glass-effect rounded-2xl p-5 luxury-shadow">
                    <div className="flex items-center gap-4 mb-4">
                      {u.photo_url ? (
                        <img
                          src={u.photo_url}
                          alt={u.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full luxury-gradient flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-mauve-wine">
                          {u.display_name || u.name}
                        </div>
                        {u.display_name && (
                          <div className="text-mauve-wine-light text-xs">{u.name}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {labelCategories.map((label) => {
                        const selected = selectedLabels[u.id] === label.id;
                        return (
                          <button
                            key={label.id}
                            onClick={() =>
                              setSelectedLabels((prev) => ({ ...prev, [u.id]: label.id }))
                            }
                            className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                              selected
                                ? "border-rose-tan bg-rose-tan text-white"
                                : "border-rose-tan-light text-mauve-wine hover:border-rose-tan"
                            }`}
                          >
                            {label.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  onClick={handleSubmitLabels}
                  disabled={loading || Object.keys(selectedLabels).length < usersToLabel.length}
                  className="w-full luxury-gradient text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Submitting..." : <><span>Submit Labels</span><ChevronRight className="w-4 h-4" /></>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── ANONYMOUS MESSAGE ─── */}
        {view === "anonymous" && (
          <div className="glass-effect rounded-2xl p-8 luxury-shadow">
            <StepIndicator current={3} />
            <h2 className="text-2xl font-bold text-mauve-wine mb-2">Anonymous Message</h2>
            <p className="text-mauve-wine-light mb-6 text-sm">
              Leave a message anonymously. Your identity will not be revealed.
            </p>
            <textarea
              value={anonMessage}
              onChange={(e) => setAnonMessage(e.target.value)}
              placeholder="Write your message here..."
              maxLength={500}
              rows={5}
              className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-tan bg-white text-mauve-wine resize-none"
            />
            <div className="text-right text-xs text-mauve-wine-light mt-1 mb-4">
              {anonMessage.length}/500
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              onClick={handleSubmitAnonymous}
              disabled={loading || !anonMessage.trim()}
              className="w-full luxury-gradient text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Submitting..." : <><MessageSquare className="w-4 h-4" /><span>Submit Message</span></>}
            </button>
          </div>
        )}

        {/* ─── DONE ─── */}
        {view === "done" && (
          <div className="text-center glass-effect rounded-2xl p-10 luxury-shadow">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-mauve-wine mb-3">All Done!</h2>
            <p className="text-mauve-wine-light mb-8 text-lg">
              Thank you for participating, {user?.display_name || user?.name}.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon: Award, label: "Votes Cast" },
                { icon: Users, label: "Peers Labeled" },
                { icon: MessageSquare, label: "Message Sent" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="bg-green-50 rounded-xl p-4">
                  <Icon className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <div className="text-xs text-green-700 font-medium">{label}</div>
                </div>
              ))}
            </div>
            <Link
              href="/"
              className="inline-block luxury-gradient text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-all"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InputField({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-tan">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full pl-10 pr-4 py-3 border border-rose-tan-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-tan bg-white text-mauve-wine placeholder-mauve-wine-light transition-all"
      />
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  const steps = [
    { icon: Upload, label: "Profile" },
    { icon: Award, label: "Vote" },
    { icon: Users, label: "Label" },
    { icon: MessageSquare, label: "Message" },
  ];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                done
                  ? "bg-rose-tan border-rose-tan"
                  : active
                  ? "border-rose-tan bg-rose-tan/10"
                  : "border-rose-tan-light bg-white"
              }`}
            >
              {done ? (
                <CheckCircle className="w-4 h-4 text-white" />
              ) : (
                <Icon className={`w-4 h-4 ${active ? "text-rose-tan" : "text-rose-tan-light"}`} />
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 ${i < current ? "bg-rose-tan" : "bg-rose-tan-light"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

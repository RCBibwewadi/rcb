"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2, Check, Upload } from "lucide-react";
import { 
  MatchUpUser, 
  MatchUpProfile, 
  MatchUpPreferenceQuestion,
  MatchUpPreference 
} from "@/lib/types";
import { DEFAULT_PROMPTS } from "@/lib/matchup/constants";
import { getZodiacSign } from "@/lib/matchup/utils";

interface ProfileTabProps {
  user: MatchUpUser;
  profile?: MatchUpProfile | null;
  onUpdate: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export default function ProfileTab({ user, profile, onUpdate }: ProfileTabProps) {
  const [loading, setLoading] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);

  const fileInputRefs = {
    photo1_url: useRef<HTMLInputElement>(null),
    photo2_url: useRef<HTMLInputElement>(null),
    photo3_url: useRef<HTMLInputElement>(null),
  };

  const [formData, setFormData] = useState({
    username: profile?.username || "",
    dob: profile?.dob || "",
    photo1_url: profile?.photo1_url || "",
    photo2_url: profile?.photo2_url || "",
    photo3_url: profile?.photo3_url || "",
    prompt1: profile?.prompt1 || "",
    prompt2: profile?.prompt2 || "",
    prompt3: profile?.prompt3 || "",
  });

  const [questions, setQuestions] = useState<MatchUpPreferenceQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        dob: profile.dob || "",
        photo1_url: profile.photo1_url || "",
        photo2_url: profile.photo2_url || "",
        photo3_url: profile.photo3_url || "",
        prompt1: profile.prompt1 || "",
        prompt2: profile.prompt2 || "",
        prompt3: profile.prompt3 || "",
      });
    }
  }, [profile]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/matchup/preferences");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        
        const initialAnswers: Record<string, number> = {};
        (data.preferences || []).forEach((p: MatchUpPreference) => {
          initialAnswers[p.question_id] = p.answer_value;
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof fileInputRefs) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 5MB.");
      return;
    }

    setUploadingPhoto(field);
    setError("");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('photoType', field);

      const res = await fetch('/api/matchup/upload', {
        method: 'POST',
        body: uploadFormData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setFormData((prev) => ({ ...prev, [field]: data.url }));
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image. Please try again.");
    } finally {
      setUploadingPhoto(null);
      if (fileInputRefs[field].current) {
        fileInputRefs[field].current.value = "";
      }
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!formData.photo1_url || !formData.photo2_url || !formData.photo3_url) {
      setError("All 3 photos are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/matchup/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile");
      }

      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async () => {
    setSavingPreferences(true);
    setError("");

    try {
      const answersArray = Object.entries(answers).map(([question_id, answer_value]) => ({
        question_id,
        answer_value,
      }));

      const res = await fetch("/api/matchup/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersArray }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save preferences");
      }

      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSavingPreferences(false);
    }
  };

  const zodiacSign = formData.dob ? getZodiacSign(new Date(formData.dob)) : "";

  const photoFields = [
    { field: "photo1_url" as const, label: "Photo 1 (Primary)", required: true },
    { field: "photo2_url" as const, label: "Photo 2 (Secondary)", required: true },
    { field: "photo3_url" as const, label: "Photo 3 (Tertiary)", required: true },
  ];

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2"
        >
          <Check className="w-5 h-5" />
          Saved successfully!
        </motion.div>
      )}

      <form onSubmit={handleProfileSubmit} className="glass-effect rounded-2xl p-6 luxury-shadow">
        <h3 className="text-xl font-bold text-mauve-wine mb-6">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-mauve-wine mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              minLength={2}
              maxLength={50}
              className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-tan focus:border-transparent text-mauve-wine"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-mauve-wine mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-tan focus:border-transparent text-mauve-wine"
            />
            {zodiacSign && (
              <p className="text-sm text-mauve-wine-light mt-1">
                Zodiac Sign: {zodiacSign}
              </p>
            )}
          </div>
        </div>

        <h4 className="text-lg font-semibold text-mauve-wine mt-8 mb-4">
          Photos <span className="text-red-500">*</span> <span className="text-sm font-normal">(All 3 photos required)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {photoFields.map(({ field, label, required }) => (
            <div key={field} className="relative">
              <label className="block text-sm font-medium text-mauve-wine mb-2">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <div 
                className="relative aspect-square border-2 border-dashed border-rose-tan-light rounded-lg overflow-hidden group cursor-pointer hover:border-rose-tan transition-colors"
                onClick={() => fileInputRefs[field].current?.click()}
              >
                {formData[field] ? (
                  <img
                    src={formData[field]}
                    alt={label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-luxury-cream">
                    {uploadingPhoto === field ? (
                      <Loader2 className="w-8 h-8 text-mauve-wine-light animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-mauve-wine-light mb-2" />
                        <span className="text-xs text-mauve-wine-light">Click to upload</span>
                      </>
                    )}
                  </div>
                )}
                {uploadingPhoto === field && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                ref={fileInputRefs[field]}
                className="hidden"
                onChange={(e) => handlePhotoUpload(e, field)}
                disabled={uploadingPhoto !== null}
              />
              {formData[field] && (
                <button
                  type="button"
                  onClick={() => fileInputRefs[field].current?.click()}
                  className="mt-2 w-full text-sm text-rose-tan hover:text-rose-tan-dark transition-colors"
                  disabled={uploadingPhoto !== null}
                >
                  Change Photo
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-mauve-wine-light mt-2">
          Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
        </p>

        <h4 className="text-lg font-semibold text-mauve-wine mt-8 mb-4">Prompts</h4>
        <div className="space-y-4">
          {([1, 2, 3] as const).map((num) => (
            <div key={num}>
              <label className="block text-sm font-medium text-mauve-wine mb-2">
                {DEFAULT_PROMPTS[num - 1]}
              </label>
              <textarea
                value={formData[`prompt${num}` as keyof typeof formData]}
                onChange={(e) =>
                  setFormData({ ...formData, [`prompt${num}`]: e.target.value })
                }
                rows={2}
                maxLength={500}
                className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-tan focus:border-transparent text-mauve-wine resize-none"
                placeholder="Your answer..."
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || uploadingPhoto !== null}
          className="mt-6 w-full luxury-gradient text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Save Profile"
          )}
        </button>
      </form>

      {questions.length > 0 && (
        <div className="glass-effect rounded-2xl p-6 luxury-shadow">
          <h3 className="text-xl font-bold text-mauve-wine mb-6">Preferences</h3>
          <p className="text-sm text-mauve-wine-light mb-6">
            Drag the slider to indicate your preference level (0 = not important, 100 = very important)
          </p>

          <div className="space-y-6">
            {questions.map((question) => (
              <div key={question.id}>
                <label className="block text-sm font-medium text-mauve-wine mb-2">
                  {question.question}
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-mauve-wine-light w-8">0</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={answers[question.id] || 50}
                    onChange={(e) =>
                      setAnswers({ ...answers, [question.id]: Number(e.target.value) })
                    }
                    className="flex-1 h-2 bg-rose-tan-light rounded-lg appearance-none cursor-pointer accent-rose-tan"
                  />
                  <span className="text-xs text-mauve-wine-light w-8">100</span>
                  <span className="text-sm font-medium text-mauve-wine w-12 text-right">
                    {answers[question.id] || 50}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handlePreferencesSubmit}
            disabled={savingPreferences}
            className="mt-6 w-full luxury-gradient text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {savingPreferences ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Save Preferences"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

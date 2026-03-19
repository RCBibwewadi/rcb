"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit, Eye, EyeOff, Save, Upload, X as XIcon } from "lucide-react";
import { SeriesCard, Question } from "@/lib/types";
import { useToast } from "@/components/ui/ToastProvider";
import Image from "next/image";

export default function GameEditor() {
  const { showToast } = useToast();
  const [series, setSeries] = useState<SeriesCard[]>([]);
  const [gameVisible, setGameVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingSeries, setEditingSeries] = useState<SeriesCard | null>(null);
  const [editingQuestions, setEditingQuestions] = useState<Question[]>([]);
  const [showSeriesForm, setShowSeriesForm] = useState(false);
  const [showQuestionsForm, setShowQuestionsForm] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [seriesRes, settingsRes] = await Promise.all([
        fetch("/api/admin/game/series"),
        fetch("/api/game/settings"),
      ]);

      const seriesData = await seriesRes.json();
      const settingsData = await settingsRes.json();

      setSeries(seriesData.series || []);
      setGameVisible(settingsData.isVisible);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showToast("Failed to load game data", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleGameVisibility = async () => {
    try {
      const response = await fetch("/api/admin/game/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !gameVisible }),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      setGameVisible(!gameVisible);
      showToast(
        `Game page is now ${!gameVisible ? "visible" : "hidden"}`,
        "success"
      );
    } catch (error) {
      showToast("Failed to update visibility", "error");
    }
  };

  const handleSaveSeries = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    let imageUrl = formData.get("image_url") as string;

    // If there's a new image file, convert to base64
    if (imageFile) {
      try {
        const base64 = await convertToBase64(imageFile);
        imageUrl = base64;
      } catch (error) {
        showToast("Failed to process image", "error");
        return;
      }
    }

    const seriesData = {
      name: formData.get("name") as string,
      image_url: imageUrl,
      description: formData.get("description") as string,
      display_order: parseInt(formData.get("display_order") as string) || 0,
      is_active: formData.get("is_active") === "true",
    };

    try {
      const url = editingSeries
        ? `/api/admin/game/series/${editingSeries.id}`
        : "/api/admin/game/series";

      const response = await fetch(url, {
        method: editingSeries ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seriesData),
      });

      if (!response.ok) throw new Error("Failed to save series");

      showToast("Series saved successfully", "success");
      setShowSeriesForm(false);
      setEditingSeries(null);
      setImagePreview("");
      setImageFile(null);
      fetchData();
    } catch (error) {
      showToast("Failed to save series", "error");
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file", "error");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB", "error");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditSeries = (item: SeriesCard) => {
    setEditingSeries(item);
    setImagePreview(item.image_url);
    setShowSeriesForm(true);
  };

  const handleDeleteSeries = async (id: string) => {
    if (!confirm("Are you sure? This will delete all questions for this series."))
      return;

    try {
      const response = await fetch(`/api/admin/game/series/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete series");

      showToast("Series deleted successfully", "success");
      fetchData();
    } catch (error) {
      showToast("Failed to delete series", "error");
    }
  };

  const handleEditQuestions = async (seriesId: string) => {
    try {
      const response = await fetch(`/api/admin/game/questions/${seriesId}`);
      const data = await response.json();

      setEditingQuestions(data.questions || []);
      setEditingSeries(series.find((s) => s.id === seriesId) || null);
      setShowQuestionsForm(true);
    } catch (error) {
      showToast("Failed to load questions", "error");
    }
  };

  const handleSaveQuestions = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const questions = [];
    for (let i = 0; i < 11; i++) {
      questions.push({
        question_text: formData.get(`q${i}_text`) as string,
        option_a: formData.get(`q${i}_a`) as string,
        option_b: formData.get(`q${i}_b`) as string,
        option_c: formData.get(`q${i}_c`) as string,
        option_d: formData.get(`q${i}_d`) as string,
        correct_answer: formData.get(`q${i}_correct`) as string,
        question_order: i,
      });
    }

    try {
      const response = await fetch(
        `/api/admin/game/questions/${editingSeries?.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions }),
        }
      );

      if (!response.ok) throw new Error("Failed to save questions");

      showToast("Questions saved successfully", "success");
      setShowQuestionsForm(false);
      setEditingSeries(null);
      setEditingQuestions([]);
    } catch (error) {
      showToast("Failed to save questions", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-rose-tan"></div>
      </div>
    );
  }

  if (showQuestionsForm && editingSeries) {
    return (
      <div className="glass-effect rounded-xl p-6 luxury-shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-mauve-wine">
            Edit Questions: {editingSeries.name}
          </h2>
          <button
            onClick={() => {
              setShowQuestionsForm(false);
              setEditingSeries(null);
              setEditingQuestions([]);
            }}
            className="text-mauve-wine-light hover:text-mauve-wine"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSaveQuestions} className="space-y-6">
          {[...Array(11)].map((_, i) => {
            const existingQ = editingQuestions[i];
            return (
              <div key={i} className="border border-rose-tan-light rounded-lg p-4">
                <h3 className="font-semibold text-mauve-wine mb-3">
                  Question {i + 1}
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    name={`q${i}_text`}
                    defaultValue={existingQ?.question_text || ""}
                    placeholder="Question text"
                    required
                    className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name={`q${i}_a`}
                      defaultValue={existingQ?.option_a || ""}
                      placeholder="Option A"
                      required
                      className="px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                    />
                    <input
                      type="text"
                      name={`q${i}_b`}
                      defaultValue={existingQ?.option_b || ""}
                      placeholder="Option B"
                      required
                      className="px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                    />
                    <input
                      type="text"
                      name={`q${i}_c`}
                      defaultValue={existingQ?.option_c || ""}
                      placeholder="Option C"
                      required
                      className="px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                    />
                    <input
                      type="text"
                      name={`q${i}_d`}
                      defaultValue={existingQ?.option_d || ""}
                      placeholder="Option D"
                      required
                      className="px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                    />
                  </div>
                  <select
                    name={`q${i}_correct`}
                    defaultValue={existingQ?.correct_answer || "A"}
                    required
                    className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                  >
                    <option value="A">Correct Answer: A</option>
                    <option value="B">Correct Answer: B</option>
                    <option value="C">Correct Answer: C</option>
                    <option value="D">Correct Answer: D</option>
                  </select>
                </div>
              </div>
            );
          })}

          <button
            type="submit"
            className="w-full bg-rose-tan hover:bg-rose-tan-dark text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save All Questions
          </button>
        </form>
      </div>
    );
  }

  if (showSeriesForm) {
    return (
      <div className="glass-effect rounded-xl p-6 luxury-shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-mauve-wine">
            {editingSeries ? "Edit Series" : "Add New Series"}
          </h2>
          <button
            onClick={() => {
              setShowSeriesForm(false);
              setEditingSeries(null);
            }}
            className="text-mauve-wine-light hover:text-mauve-wine"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSaveSeries} className="space-y-4">
          <div>
            <label className="block text-mauve-wine font-medium mb-2">
              Series Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={editingSeries?.name || ""}
              required
              className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
            />
          </div>

          <div>
            <label className="block text-mauve-wine font-medium mb-2">
              Series Image
            </label>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-3 relative inline-block">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={200}
                  height={300}
                  className="rounded-lg border-2 border-rose-tan-light object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* File Upload */}
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center gap-2 bg-rose-tan hover:bg-rose-tan-dark text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                {imagePreview ? "Change Image" : "Upload Image"}
              </label>
              
              {/* Hidden input to store image URL for form submission */}
              <input
                type="hidden"
                name="image_url"
                value={imagePreview || editingSeries?.image_url || ""}
              />
            </div>
            <p className="text-xs text-mauve-wine-light mt-2">
              Recommended: 400x600px, Max 5MB, JPG/PNG
            </p>
          </div>

          <div>
            <label className="block text-mauve-wine font-medium mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              defaultValue={editingSeries?.description || ""}
              rows={3}
              className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
            />
          </div>

          <div>
            <label className="block text-mauve-wine font-medium mb-2">
              Display Order
            </label>
            <input
              type="number"
              name="display_order"
              defaultValue={editingSeries?.display_order || 0}
              className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              value="true"
              defaultChecked={editingSeries?.is_active ?? true}
              className="w-4 h-4"
            />
            <label className="text-mauve-wine">Active</label>
          </div>

          <button
            type="submit"
            className="w-full bg-rose-tan hover:bg-rose-tan-dark text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Save Series
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-xl p-6 luxury-shadow">
        <h2 className="text-2xl font-bold text-mauve-wine mb-4">
          Game Management
        </h2>

        <div className="flex items-center justify-between mb-6 p-4 bg-rose-tan/10 rounded-lg">
          <div>
            <h3 className="font-semibold text-mauve-wine">Game Page Visibility</h3>
            <p className="text-sm text-mauve-wine-light">
              Control whether players can access the game page
            </p>
          </div>
          <button
            onClick={toggleGameVisibility}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              gameVisible
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-400 hover:bg-gray-500 text-white"
            }`}
          >
            {gameVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            {gameVisible ? "Visible" : "Hidden"}
          </button>
        </div>

        <button
          onClick={() => setShowSeriesForm(true)}
          className="bg-rose-tan hover:bg-rose-tan-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Series
        </button>
      </div>

      <div className="grid gap-4">
        {series.map((item) => (
          <div
            key={item.id}
            className="glass-effect rounded-xl p-6 luxury-shadow flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-bold text-mauve-wine">{item.name}</h3>
                <p className="text-sm text-mauve-wine-light">
                  {item.description || "No description"}
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    item.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEditSeries(item)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleEditQuestions(item.id)}
                className="px-4 py-2 bg-mauve-wine hover:bg-mauve-wine-dark text-white rounded-lg transition-colors"
              >
                Edit Questions
              </button>
              <button
                onClick={() => handleDeleteSeries(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

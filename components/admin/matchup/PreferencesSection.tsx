"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Check, X, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { MatchUpPreferenceQuestion } from "@/lib/types";

export default function PreferencesSection() {
  const { showToast } = useToast();
  const [questions, setQuestions] = useState<MatchUpPreferenceQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newQuestion, setNewQuestion] = useState({ question: "", weight: 1 });
  const [editQuestion, setEditQuestion] = useState({ question: "", weight: 1 });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/matchup/questions");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      showToast("Failed to fetch questions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAddQuestion = async () => {
    if (!newQuestion.question.trim()) {
      showToast("Question is required", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/matchup/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newQuestion.question.trim(),
          weight: newQuestion.weight,
          is_active: true,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Question added successfully", "success");
        setNewQuestion({ question: "", weight: 1 });
        setAddingNew(false);
        fetchQuestions();
      } else {
        showToast(data.error || "Failed to add question", "error");
      }
    } catch (error) {
      console.error("Add question error:", error);
      showToast("Failed to add question", "error");
    }
  };

  const handleUpdateQuestion = async (id: string) => {
    if (!editQuestion.question.trim()) {
      showToast("Question is required", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/matchup/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          question: editQuestion.question.trim(),
          weight: editQuestion.weight,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Question updated successfully", "success");
        setEditingId(null);
        fetchQuestions();
      } else {
        showToast(data.error || "Failed to update question", "error");
      }
    } catch (error) {
      console.error("Update question error:", error);
      showToast("Failed to update question", "error");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const res = await fetch(`/api/admin/matchup/questions?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Question deleted successfully", "success");
        fetchQuestions();
      } else {
        showToast(data.error || "Failed to delete question", "error");
      }
    } catch (error) {
      console.error("Delete question error:", error);
      showToast("Failed to delete question", "error");
    }
  };

  const handleToggleActive = async (question: MatchUpPreferenceQuestion) => {
    try {
      const res = await fetch("/api/admin/matchup/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: question.id,
          is_active: !question.is_active,
        }),
      });

      if (res.ok) {
        showToast(
          question.is_active ? "Question deactivated" : "Question activated",
          "success"
        );
        fetchQuestions();
      } else {
        showToast("Failed to update question", "error");
      }
    } catch (error) {
      console.error("Toggle active error:", error);
      showToast("Failed to update question", "error");
    }
  };

  const startEdit = (question: MatchUpPreferenceQuestion) => {
    setEditingId(question.id);
    setEditQuestion({ question: question.question, weight: question.weight });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditQuestion({ question: "", weight: 1 });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white rounded-xl p-4 h-16 luxury-shadow" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-mauve-wine">
          Preference Questions ({questions.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={fetchQuestions}
            className="text-rose-tan hover:text-rose-tan-dark p-1"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {!addingNew && (
            <button
              onClick={() => setAddingNew(true)}
              className="flex items-center gap-1 px-3 py-1 bg-rose-tan text-white rounded-lg text-sm hover:bg-rose-tan-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          )}
        </div>
      </div>

      {addingNew && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 luxury-shadow"
        >
          <div className="space-y-3">
            <input
              type="text"
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              placeholder="Enter question text"
              className="w-full px-3 py-2 border border-rose-tan-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-tan focus:border-transparent text-mauve-wine"
              autoFocus
            />
            <div className="flex items-center gap-4">
              <label className="text-sm text-mauve-wine-light">Weight:</label>
              <input
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={newQuestion.weight}
                onChange={(e) => setNewQuestion({ ...newQuestion, weight: parseFloat(e.target.value) || 1 })}
                className="w-24 px-3 py-2 border border-rose-tan-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-tan focus:border-transparent text-mauve-wine"
              />
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={handleAddQuestion}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setAddingNew(false);
                    setNewQuestion({ question: "", weight: 1 });
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-colors flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {questions.length === 0 && !addingNew ? (
        <div className="text-center py-8 text-mauve-wine-light">
          No preference questions. Add one to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((question) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`bg-white rounded-xl p-4 luxury-shadow ${
                !question.is_active ? "opacity-60" : ""
              }`}
            >
              {editingId === question.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editQuestion.question}
                    onChange={(e) => setEditQuestion({ ...editQuestion, question: e.target.value })}
                    className="w-full px-3 py-2 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent text-mauve-wine"
                    autoFocus
                  />
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-mauve-wine-light">Weight:</label>
                    <input
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={editQuestion.weight}
                      onChange={(e) => setEditQuestion({ ...editQuestion, weight: parseFloat(e.target.value) || 1 })}
                      className="w-24 px-3 py-2 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent text-mauve-wine"
                    />
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={() => handleUpdateQuestion(question.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-colors flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-mauve-wine font-medium">{question.question}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-mauve-wine-light">
                        Weight: {question.weight}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          question.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {question.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(question)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        question.is_active
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {question.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => startEdit(question)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

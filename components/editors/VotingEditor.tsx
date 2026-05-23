/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Users,
  Award,
  Tag,
  Plus,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Upload,
  User,
  BarChart2,
  Tags,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from "lucide-react";

type Tab = "users" | "categories" | "labels" | "results" | "label-assignments" | "messages";

interface VotingUser {
  id: string;
  name: string;
  display_name?: string;
  rid: string;
  dob: string;
  email: string;
  photo_url?: string;
  plain_password?: string;
  status: string;
  has_voted: boolean;
  has_categorized: boolean;
  has_messaged: boolean;
  created_at: string;
}

interface VotingNominee {
  id: string;
  category_id: string;
  name: string;
  photo_url?: string;
}

interface VotingCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  nominees: VotingNominee[];
}

interface LabelCategory {
  id: string;
  name: string;
  is_active: boolean;
}

export default function VotingEditor() {
  const [tab, setTab] = useState<Tab>("users");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Users
  const [users, setUsers] = useState<VotingUser[]>([]);
  const [userFilter, setUserFilter] = useState<string>("pending");
  const filteredUsers = userFilter === "" ? users : users.filter((u) => u.status === userFilter);

  // Categories
  const [categories, setCategories] = useState<VotingCategory[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [newNomineeName, setNewNomineeName] = useState<Record<string, string>>({});
  const [uploadingNominee, setUploadingNominee] = useState<string | null>(null);
  const nomineePhotoRef = useRef<HTMLInputElement>(null);
  const [pendingNomineeUpload, setPendingNomineeUpload] = useState<{ catId: string; name: string } | null>(null);

  // Labels
  const [labels, setLabels] = useState<LabelCategory[]>([]);
  const [newLabelName, setNewLabelName] = useState("");

  // Results
  const [results, setResults] = useState<any[]>([]);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  // Label Assignments
  const [labelAssignmentLabels, setLabelAssignmentLabels] = useState<any[]>([]);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);
  const [reassigningUserId, setReassigningUserId] = useState<string | null>(null);

  // Messages
  const [messages, setMessages] = useState<any[]>([]);

  // Voting toggle
  const [votingEnabled, setVotingEnabled] = useState<boolean>(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  // Label notification toggle
  const [labelNotifEnabled, setLabelNotifEnabled] = useState<boolean>(false);
  const [labelNotifLoading, setLabelNotifLoading] = useState(false);

  useEffect(() => {
    loadVotingSettings();
  }, []);

  async function loadVotingSettings() {
    try {
      const res = await fetch("/api/admin/voting/settings");
      if (res.ok) {
        const data = await res.json();
        setVotingEnabled(data.settings?.voting_enabled ?? false);
        setLabelNotifEnabled(data.settings?.label_notification_enabled ?? false);
      }
    } catch {}
  }

  async function handleToggleVoting() {
    setToggleLoading(true);
    try {
      const res = await fetch("/api/admin/voting/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setting_key: "voting_enabled", setting_value: !votingEnabled }),
      });
      if (res.ok) {
        setVotingEnabled(!votingEnabled);
        showMsg(`Voting ${!votingEnabled ? "enabled" : "disabled"}`, "success");
      } else {
        showMsg("Failed to update setting", "error");
      }
    } finally {
      setToggleLoading(false);
    }
  }

  async function handleToggleLabelNotif() {
    setLabelNotifLoading(true);
    try {
      const res = await fetch("/api/admin/voting/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setting_key: "label_notification_enabled", setting_value: !labelNotifEnabled }),
      });
      if (res.ok) {
        setLabelNotifEnabled(!labelNotifEnabled);
        showMsg(`Label notifications ${!labelNotifEnabled ? "enabled" : "disabled"}`, "success");
      } else {
        showMsg("Failed to update setting", "error");
      }
    } finally {
      setLabelNotifLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "users") loadUsers();
    else if (tab === "categories") loadCategories();
    else if (tab === "labels") loadLabels();
    else if (tab === "results") loadResults();
    else if (tab === "label-assignments") loadLabelAssignments();
    else if (tab === "messages") loadMessages();
  }, [tab]);

  function showMsg(text: string, type: "success" | "error") {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/voting/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleUserAction(user_id: string, action: "approve" | "decline") {
    const res = await fetch("/api/admin/voting/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, action }),
    });
    const data = await res.json();
    if (res.ok) {
      showMsg(`User ${action}d successfully`, "success");
      loadUsers();
    } else {
      showMsg(data.error || "Failed", "error");
    }
  }

  // ── Categories ─────────────────────────────────────────────────────────────

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/voting/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    const res = await fetch("/api/admin/voting/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName, description: newCatDesc }),
    });
    const data = await res.json();
    if (res.ok) {
      showMsg("Category added", "success");
      setNewCatName("");
      setNewCatDesc("");
      loadCategories();
    } else {
      showMsg(data.error || "Failed", "error");
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Delete this category and all its nominees?")) return;
    const res = await fetch(`/api/admin/voting/categories?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      showMsg("Category deleted", "success");
      loadCategories();
    } else {
      showMsg("Failed to delete", "error");
    }
  }

  async function handleToggleCategoryActive(cat: VotingCategory) {
    const res = await fetch("/api/admin/voting/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cat.id, is_active: !cat.is_active }),
    });
    if (res.ok) {
      loadCategories();
    }
  }

  async function handleAddNominee(catId: string) {
    const name = newNomineeName[catId]?.trim();
    if (!name) return;
    const res = await fetch("/api/admin/voting/nominees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category_id: catId, name }),
    });
    const data = await res.json();
    if (res.ok) {
      showMsg("Nominee added", "success");
      setNewNomineeName((prev) => ({ ...prev, [catId]: "" }));
      loadCategories();
    } else {
      showMsg(data.error || "Failed", "error");
    }
  }

  async function handleDeleteNominee(id: string) {
    const res = await fetch(`/api/admin/voting/nominees?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      showMsg("Nominee removed", "success");
      loadCategories();
    } else {
      showMsg("Failed to remove", "error");
    }
  }

  async function handleNomineePhotoUpload(file: File, nomineeId: string) {
    setUploadingNominee(nomineeId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", "nominee");
      const uploadRes = await fetch("/api/admin/voting/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        showMsg(uploadData.error || "Upload failed", "error");
        return;
      }
      const updateRes = await fetch("/api/admin/voting/nominees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: nomineeId, photo_url: uploadData.url }),
      });
      if (updateRes.ok) {
        showMsg("Photo updated", "success");
        loadCategories();
      }
    } finally {
      setUploadingNominee(null);
    }
  }

  // ── Labels ─────────────────────────────────────────────────────────────────

  async function loadLabels() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/voting/labels");
      if (res.ok) {
        const data = await res.json();
        setLabels(data.labels || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAddLabel() {
    if (!newLabelName.trim()) return;
    const res = await fetch("/api/admin/voting/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newLabelName }),
    });
    const data = await res.json();
    if (res.ok) {
      showMsg("Label added", "success");
      setNewLabelName("");
      loadLabels();
    } else {
      showMsg(data.error || "Failed", "error");
    }
  }

  async function handleDeleteLabel(id: string) {
    const res = await fetch(`/api/admin/voting/labels?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      showMsg("Label deleted", "success");
      loadLabels();
    } else {
      showMsg("Failed to delete", "error");
    }
  }

  async function handleToggleLabelActive(label: LabelCategory) {
    const res = await fetch("/api/admin/voting/labels", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: label.id, is_active: !label.is_active }),
    });
    if (res.ok) loadLabels();
  }

  // ── Results ────────────────────────────────────────────────────────────────

  async function loadResults() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/voting/results");
      if (res.ok) {
        const data = await res.json();
        setResults(data.categories || []);
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Label Assignments ──────────────────────────────────────────────────────

  async function loadLabelAssignments() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/voting/label-assignments");
      if (res.ok) {
        const data = await res.json();
        setLabelAssignmentLabels(data.labels || []);
        setUserResults(data.user_results || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminAssignLabel(userId: string, labelCategoryId: string) {
    setAssigningUserId(userId);
    try {
      const res = await fetch("/api/admin/voting/label-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, label_category_id: labelCategoryId }),
      });
      if (res.ok) {
        showMsg("Label assigned", "success");
        loadLabelAssignments();
      } else {
        showMsg("Failed to assign label", "error");
      }
    } finally {
      setAssigningUserId(null);
    }
  }

  // ── Messages ───────────────────────────────────────────────────────────────

  async function loadMessages() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/voting/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } finally {
      setLoading(false);
    }
  }

  const statusColor = (s: string) =>
    s === "approved" ? "text-green-600 bg-green-50" :
    s === "declined" ? "text-red-600 bg-red-50" :
    "text-amber-600 bg-amber-50";

  return (
    <div className="space-y-6">
      {/* Toast */}
      {msg && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-white text-sm font-medium shadow-lg ${
            msg.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="glass-effect rounded-xl p-6 luxury-shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-mauve-wine">Voting System</h2>
          <button
            onClick={handleToggleVoting}
            disabled={toggleLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all disabled:opacity-50 ${
              votingEnabled
                ? "border-green-400 bg-green-50 text-green-700 hover:bg-green-100"
                : "border-rose-tan-light bg-white text-mauve-wine-light hover:border-rose-tan hover:text-mauve-wine"
            }`}
          >
            {votingEnabled ? (
              <ToggleRight className="w-5 h-5 text-green-600" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
            {toggleLoading ? "Updating..." : votingEnabled ? "Voting Enabled" : "Voting Disabled"}
          </button>
        </div>

        {/* Voting status banner */}
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
            votingEnabled
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          {votingEnabled ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Voting is open — approved users can log in and complete the voting process.
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Voting is closed — users can register and get approved, but cannot vote yet.
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-luxury-cream rounded-lg p-1">
          {([
            { id: "users", label: "Users", icon: Users },
            { id: "categories", label: "Categories & Nominees", icon: Award },
            { id: "labels", label: "Labels", icon: Tag },
            { id: "results", label: "Vote Results", icon: BarChart2 },
            // { id: "label-assignments", label: "Label Assignments", icon: Tags },
            // { id: "messages", label: "Messages", icon: MessageSquare },
          ] as { id: Tab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                tab === id
                  ? "bg-white luxury-shadow text-mauve-wine"
                  : "text-mauve-wine-light hover:text-mauve-wine"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-rose-tan border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === "users" && !loading && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              {["pending", "approved", "declined", ""].map((f) => {
                const count = f === "" ? users.length : users.filter((u) => u.status === f).length;
                return (
                  <button
                    key={f}
                    onClick={() => setUserFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      userFilter === f
                        ? "bg-mauve-wine text-white border-mauve-wine"
                        : "border-rose-tan-light text-mauve-wine hover:border-rose-tan"
                    }`}
                  >
                    {f === "" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                    {f === "" && (
                      <span className={`inline-flex items-center justify-center w-6 h-6 ml-2 rounded-full text-[10px] font-semibold ${userFilter === f ? "bg-white/20 text-white" : "bg-rose-tan-light text-mauve-wine"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
              <button
                onClick={loadUsers}
                disabled={loading}
                title="Refresh users"
                className="ml-auto p-1.5 rounded-lg border border-rose-tan-light text-mauve-wine-light hover:text-mauve-wine hover:border-rose-tan transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
            {filteredUsers.length === 0 ? (
              <p className="text-mauve-wine-light text-sm">No users found.</p>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="border border-rose-tan-light rounded-xl p-4 bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {u.photo_url ? (
                          <img
                            src={u.photo_url}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full luxury-gradient flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-mauve-wine text-sm">
                            {u.name}
                            {u.display_name && (
                              <span className="ml-1 text-mauve-wine-light font-normal">
                                ({u.display_name})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-mauve-wine-light">{u.email}</div>
                          <div className="text-xs text-mauve-wine-light">
                            RID: {u.rid} &middot; DOB: {u.dob}
                            {u.plain_password && (
                              <span className="ml-2 font-mono bg-gray-100 px-1 rounded">
                                pw: {u.plain_password}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 mt-1">
                            {[
                              { key: "has_voted", label: "Voted" },
                              { key: "has_categorized", label: "Labeled" },
                              { key: "has_messaged", label: "Messaged" },
                            ].map(({ key, label }) => (
                              <span
                                key={key}
                                className={`text-xs px-1.5 py-0.5 rounded ${
                                  (u as any)[key]
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(u.status)}`}
                        >
                          {u.status}
                        </span>
                        {u.status === "pending" && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleUserAction(u.id, "approve")}
                              className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUserAction(u.id, "decline")}
                              className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                              title="Decline"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CATEGORIES TAB ── */}
        {tab === "categories" && !loading && (
          <div className="space-y-4">
            {/* Add category */}
            <div className="border border-rose-tan-light rounded-xl p-4 bg-white">
              <h3 className="font-semibold text-mauve-wine text-sm mb-3">Add Category</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Category name (e.g. Best Leader)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-rose-tan-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-tan bg-white text-mauve-wine"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-rose-tan-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-tan bg-white text-mauve-wine"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={!newCatName.trim()}
                  className="flex items-center gap-2 px-4 py-2 luxury-gradient text-white text-sm rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>
            </div>

            {/* Category list */}
            {categories.map((cat) => (
              <div key={cat.id} className="border border-rose-tan-light rounded-xl bg-white overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                      className="text-mauve-wine-light hover:text-mauve-wine transition-colors"
                    >
                      {expandedCat === cat.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <div className="font-semibold text-mauve-wine text-sm">{cat.name}</div>
                      {cat.description && (
                        <div className="text-xs text-mauve-wine-light">{cat.description}</div>
                      )}
                      <div className="text-xs text-mauve-wine-light mt-0.5">
                        {cat.nominees.length} nominee{cat.nominees.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleCategoryActive(cat)}
                      className={`text-xs px-2 py-1 rounded-full border transition-all ${
                        cat.is_active
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      {cat.is_active ? "Active" : "Inactive"}
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedCat === cat.id && (
                  <div className="border-t border-rose-tan-light p-4 bg-luxury-cream space-y-3">
                    {/* Nominees list */}
                    {cat.nominees.map((nominee) => (
                      <div
                        key={nominee.id}
                        className="flex items-center justify-between bg-white rounded-lg p-3 border border-rose-tan-light"
                      >
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer relative">
                            {nominee.photo_url ? (
                              <img
                                src={nominee.photo_url}
                                alt={nominee.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-rose-tan/20 flex items-center justify-center">
                                {uploadingNominee === nominee.id ? (
                                  <div className="w-4 h-4 border-2 border-rose-tan border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Upload className="w-4 h-4 text-rose-tan" />
                                )}
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleNomineePhotoUpload(f, nominee.id);
                              }}
                            />
                          </label>
                          <span className="text-sm text-mauve-wine font-medium">{nominee.name}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteNominee(nominee.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Add nominee */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nominee name"
                        value={newNomineeName[cat.id] || ""}
                        onChange={(e) =>
                          setNewNomineeName((prev) => ({ ...prev, [cat.id]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === "Enter" && handleAddNominee(cat.id)}
                        className="flex-1 px-3 py-2 text-sm border border-rose-tan-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-tan bg-white text-mauve-wine"
                      />
                      <button
                        onClick={() => handleAddNominee(cat.id)}
                        disabled={!newNomineeName[cat.id]?.trim()}
                        className="px-3 py-2 luxury-gradient text-white text-sm rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── RESULTS TAB ── */}
        {tab === "results" && !loading && (
          <div className="space-y-4">
            <p className="text-sm text-mauve-wine-light">
              Vote counts per nominee, sorted by most votes. Winner shown first.
            </p>
            {results.length === 0 ? (
              <p className="text-mauve-wine-light text-sm">No categories found.</p>
            ) : (
              results.map((cat) => (
                <div key={cat.id} className="border border-rose-tan-light rounded-xl bg-white overflow-hidden">
                  <button
                    onClick={() => setExpandedResult(expandedResult === cat.id ? null : cat.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-luxury-cream transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-mauve-wine text-sm">{cat.name}</div>
                      {cat.description && (
                        <div className="text-xs text-mauve-wine-light">{cat.description}</div>
                      )}
                      <div className="text-xs text-mauve-wine-light mt-0.5">
                        {cat.nominees.length} nominee{cat.nominees.length !== 1 ? "s" : ""} &middot;{" "}
                        {cat.nominees.reduce((sum: number, n: any) => sum + n.vote_count, 0)} votes
                      </div>
                    </div>
                    {expandedResult === cat.id ? (
                      <ChevronUp className="w-4 h-4 text-mauve-wine-light flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-mauve-wine-light flex-shrink-0" />
                    )}
                  </button>

                  {expandedResult === cat.id && (
                    <div className="border-t border-rose-tan-light p-4 bg-luxury-cream space-y-2">
                      {cat.nominees.length === 0 ? (
                        <p className="text-sm text-mauve-wine-light">No nominees.</p>
                      ) : (
                        cat.nominees.map((nominee: any, idx: number) => {
                          const totalVotes = cat.nominees.reduce((s: number, n: any) => s + n.vote_count, 0);
                          const pct = totalVotes > 0 ? Math.round((nominee.vote_count / totalVotes) * 100) : 0;
                          const isWinner = idx === 0 && nominee.vote_count > 0;
                          return (
                            <div
                              key={nominee.id}
                              className={`flex items-center gap-3 bg-white rounded-lg p-3 border ${
                                isWinner ? "border-amber-300" : "border-rose-tan-light"
                              }`}
                            >
                              {nominee.photo_url ? (
                                <img
                                  src={nominee.photo_url}
                                  alt={nominee.name}
                                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-rose-tan/20 flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-rose-tan" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-mauve-wine truncate">{nominee.name}</span>
                                  {isWinner && (
                                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex-shrink-0">
                                      Winner
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1 h-1.5 bg-rose-tan/20 rounded-full overflow-hidden">
                                  <div
                                    className="h-full luxury-gradient rounded-full transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-sm font-semibold text-mauve-wine flex-shrink-0">
                                {nominee.vote_count} <span className="text-xs font-normal text-mauve-wine-light">({pct}%)</span>
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── LABEL ASSIGNMENTS TAB ── */}
        {tab === "label-assignments" && !loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-mauve-wine-light">
                Each user&apos;s label is determined by the highest peer-vote count. Admin can override any assignment.
              </p>
              <button
                onClick={handleToggleLabelNotif}
                disabled={labelNotifLoading}
                title="When enabled, users can see a notification icon showing their assigned label"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all disabled:opacity-50 flex-shrink-0 ml-4 ${
                  labelNotifEnabled
                    ? "border-green-400 bg-green-50 text-green-700 hover:bg-green-100"
                    : "border-rose-tan-light bg-white text-mauve-wine-light hover:border-rose-tan hover:text-mauve-wine"
                }`}
              >
                {labelNotifEnabled ? (
                  <ToggleRight className="w-4 h-4 text-green-600" />
                ) : (
                  <ToggleLeft className="w-4 h-4" />
                )}
                {labelNotifLoading ? "Updating..." : labelNotifEnabled ? "Notify Users: On" : "Notify Users: Off"}
              </button>
            </div>

            {userResults.length === 0 ? (
              <p className="text-mauve-wine-light text-sm">No label data yet.</p>
            ) : (
              <>
                {/* ── Group users by their effective label ── */}
                {labelAssignmentLabels.map((label) => {
                  const members = userResults.filter(
                    (r) => r.effective_label_id === label.id
                  );
                  if (members.length === 0) return null;
                  return (
                    <div key={label.id} className="border border-rose-tan-light rounded-xl bg-white overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-3 bg-luxury-cream border-b border-rose-tan-light">
                        <Tags className="w-4 h-4 text-rose-tan flex-shrink-0" />
                        <span className="font-semibold text-mauve-wine text-sm">{label.name}</span>
                        <span className="ml-auto text-xs text-mauve-wine-light">
                          {members.length} member{members.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="divide-y divide-rose-tan-light/40">
                        {members.map((r) => {
                          const isAdminPick = r.admin_assigned_label_id === label.id;
                          const isReassigning = reassigningUserId === r.user.id;
                          return (
                            <div key={r.user.id} className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {r.user.photo_url ? (
                                  <img
                                    src={r.user.photo_url}
                                    alt={r.user.name}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full luxury-gradient flex items-center justify-center flex-shrink-0">
                                    <User className="w-3.5 h-3.5 text-white" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium text-mauve-wine">
                                    {r.user.name}
                                    {r.user.display_name && (
                                      <span className="ml-1 font-normal text-mauve-wine-light">
                                        ({r.user.display_name})
                                      </span>
                                    )}
                                  </span>
                                  <div className="flex gap-1.5 mt-0.5 flex-wrap">
                                    {r.label_counts.map((lc: any) => (
                                      <span key={lc.label_id} className={`text-xs px-1.5 py-0.5 rounded ${
                                        lc.label_id === label.id
                                          ? "bg-rose-tan/10 text-rose-tan font-semibold"
                                          : "bg-gray-100 text-gray-500"
                                      }`}>
                                        {lc.label_name}: {lc.count}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {isAdminPick && (
                                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                                      Admin pick
                                    </span>
                                  )}
                                  <button
                                    onClick={() => setReassigningUserId(isReassigning ? null : r.user.id)}
                                    className={`text-xs px-2 py-1 rounded-lg border transition-all ${
                                      isReassigning
                                        ? "border-rose-tan bg-rose-tan/10 text-rose-tan"
                                        : "border-rose-tan-light text-mauve-wine-light hover:border-rose-tan hover:text-mauve-wine"
                                    }`}
                                  >
                                    Reassign
                                  </button>
                                </div>
                              </div>
                              {isReassigning && (
                                <div className="flex flex-wrap gap-2 mt-3 ml-11">
                                  {labelAssignmentLabels
                                    .filter((l) => l.id !== label.id)
                                    .map((l) => (
                                      <button
                                        key={l.id}
                                        onClick={() => {
                                          handleAdminAssignLabel(r.user.id, l.id);
                                          setReassigningUserId(null);
                                        }}
                                        disabled={assigningUserId === r.user.id}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 transition-all disabled:opacity-50"
                                      >
                                        {assigningUserId === r.user.id ? "Saving..." : `Move to: ${l.name}`}
                                      </button>
                                    ))}
                                  <button
                                    onClick={() => setReassigningUserId(null)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* ── Needs Admin Assignment (ties + no votes) ── */}
                {(() => {
                  const tiedUsers = userResults.filter(
                    (r) => r.is_tie && !r.admin_assigned_label_id
                  );
                  if (tiedUsers.length === 0) return null;
                  return (
                    <div className="border-2 border-amber-300 rounded-xl bg-white overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border-b border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                        <span className="font-semibold text-amber-800 text-sm">
                          Needs Admin Assignment ({tiedUsers.length})
                        </span>
                        <span className="ml-auto text-xs text-amber-600">
                          These users have tied or no votes — pick their label below
                        </span>
                      </div>
                      <div className="divide-y divide-amber-100">
                        {tiedUsers.map((r) => (
                          <div key={r.user.id} className="px-4 py-4">
                            <div className="flex items-center gap-3 mb-3">
                              {r.user.photo_url ? (
                                <img
                                  src={r.user.photo_url}
                                  alt={r.user.name}
                                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full luxury-gradient flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-white" />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-semibold text-mauve-wine">
                                  {r.user.name}
                                  {r.user.display_name && (
                                    <span className="ml-1 font-normal text-mauve-wine-light">
                                      ({r.user.display_name})
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2 mt-0.5 flex-wrap">
                                  {r.label_counts.length === 0 ? (
                                    <span className="text-xs text-gray-400 italic">No votes received</span>
                                  ) : (
                                    r.label_counts.map((lc: any) => (
                                      <span key={lc.label_id} className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                        {lc.label_name}: {lc.count}
                                      </span>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {labelAssignmentLabels.map((label) => (
                                <button
                                  key={label.id}
                                  onClick={() => handleAdminAssignLabel(r.user.id, label.id)}
                                  disabled={assigningUserId === r.user.id}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-rose-tan-light text-mauve-wine hover:border-rose-tan hover:bg-rose-tan/5 transition-all disabled:opacity-50"
                                >
                                  {assigningUserId === r.user.id ? "Saving..." : `Assign: ${label.name}`}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {/* ── MESSAGES TAB ── */}
        {tab === "messages" && !loading && (
          <div className="space-y-3">
            <p className="text-sm text-mauve-wine-light">
              Anonymous messages submitted by users, newest first.
            </p>
            {messages.length === 0 ? (
              <p className="text-mauve-wine-light text-sm">No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="border border-rose-tan-light rounded-xl p-4 bg-white space-y-2"
                >
                  <p className="text-sm text-mauve-wine leading-relaxed">{msg.message}</p>
                  {/* <div className="flex items-center gap-2 pt-1 border-t border-rose-tan-light/50">
                    {msg.author?.photo_url ? (
                      <img
                        src={msg.author.photo_url}
                        alt={msg.author.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full luxury-gradient flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-xs text-mauve-wine-light">
                      {msg.author
                        ? `${msg.author.name}${msg.author.display_name ? ` (${msg.author.display_name})` : ""}`
                        : "Unknown user"}
                    </span>
                    <span className="text-xs text-mauve-wine-light ml-auto">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div> */}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── LABELS TAB ── */}
        {tab === "labels" && !loading && (
          <div className="space-y-4">
            <p className="text-sm text-mauve-wine-light">
              Define up to 3 active labels. These are shown as options when users categorize peers.
            </p>

            {/* Add label */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Label name (e.g. The Achiever)"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddLabel()}
                className="flex-1 px-3 py-2 text-sm border border-rose-tan-light rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-tan bg-white text-mauve-wine"
              />
              <button
                onClick={handleAddLabel}
                disabled={!newLabelName.trim()}
                className="flex items-center gap-1 px-4 py-2 luxury-gradient text-white text-sm rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {labels.length === 0 ? (
              <p className="text-mauve-wine-light text-sm">No labels defined yet.</p>
            ) : (
              <div className="space-y-2">
                {labels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center justify-between border border-rose-tan-light rounded-xl p-3 bg-white"
                  >
                    <span className="text-sm font-medium text-mauve-wine">{label.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleLabelActive(label)}
                        className={`text-xs px-2 py-1 rounded-full border transition-all ${
                          label.is_active
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {label.is_active ? "Active" : "Inactive"}
                      </button>
                      <button
                        onClick={() => handleDeleteLabel(label.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

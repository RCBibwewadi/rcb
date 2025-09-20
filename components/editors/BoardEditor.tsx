/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "../ui/ToastProvider";
import Image from "next/image";

// ==========================
// 🔹 Supabase Configuration
// ==========================
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ==========================
// 🔹 Constants & Enums
// ==========================
enum StorageBuckets {
  BoardMembers = "board-members",
}

enum ToastType {
  Error = "error",
  Success = "success",
}

enum DefaultValues {
  Gradient = "from-mauve-wine to-rose-tan",
  Initial = "M",
  Label = "LEADER",
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const cardColors = [
  "bg-gradient-to-br from-mauve-wine-dark to-mauve-wine",
  "bg-gradient-to-br from-rose-tan to-rose-tan-dark",
  "bg-gradient-to-br from-luxury-gold to-rose-tan",
  "bg-gradient-to-br from-rose-tan-light to-mauve-wine-light",
  "bg-gradient-to-br from-mauve-wine to-rose-tan",
  "bg-gradient-to-br from-luxury-gold to-mauve-wine-dark",
  "bg-gradient-to-br from-rose-tan-dark to-mauve-wine-light",
  "bg-gradient-to-br from-mauve-wine-light to-luxury-gold",
];

// ==========================
// 🔹 Interfaces
// ==========================
interface BoardMember {
  id: number;
  name: string;
  position: string;
  description: string;
  image: string; // Supabase public URL
  gradient: string;
  initial: string;
  label: string;
  sequence: number;
}

// ==========================
// 🔹 Component
// ==========================
export default function BoardMembersEditor() {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // ==========================
  // 🔹 Fetch Members
  // ==========================
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bod");

      if (!res.ok) throw new Error("Failed to fetch board members");

      const data: BoardMember[] = await res.json();
      setBoardMembers(data);
    } catch (err: any) {
      showToast(err.message || "Something went wrong", ToastType.Error);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // ==========================
  // 🔹 State Update Helpers
  // ==========================
  const updateMemberField = <K extends keyof BoardMember>(
    index: number,
    field: K,
    value: BoardMember[K]
  ) => {
    setBoardMembers((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const removeImage = (index: number) => {
    updateMemberField(index, "image", "");
  };

  // ==========================
  // 🔹 CRUD Handlers
  // ==========================
  const addMember = () => {
    setBoardMembers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        position: "",
        description: "",
        image: "",
        gradient: DefaultValues.Gradient,
        initial: DefaultValues.Initial,
        label: DefaultValues.Label,
        sequence: prev.length + 1,
      },
    ]);
  };

  const deleteMember = (index: number) => {
    setBoardMembers((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const saveMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(boardMembers),
      });

      if (!res.ok) throw new Error("Failed to save board members");

      showToast("✅ Board Members saved!", ToastType.Success);
    } catch (err: any) {
      showToast(
        err.message || "❌ Failed to save board members",
        ToastType.Error
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // 🔹 File Upload Handler
  // ==========================
  const uploadImage = async (index: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Only image files are allowed.", ToastType.Error);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast("File must be smaller than 5MB.", ToastType.Error);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/board", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Upload failed!", ToastType.Error);
      return;
    }

    updateMemberField(index, "image", data.url);
  };


  // ==========================
  // 🔹 Render
  // ==========================
  if (loading && boardMembers.length === 0) {
    return <div className="p-6 text-mauve-wine">Loading board members...</div>;
  }

  return (
    <div className="glass-effect rounded-xl p-6 luxury-shadow fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-mauve-wine">Board Members</h3>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-mauve-wine-light">
            Manage board member cards with custom labels
          </div>
          <button
            onClick={addMember}
            className="bg-rose-tan text-white px-4 py-2 rounded-lg font-semibold hover:bg-rose-tan-dark transition-colors"
          >
            Add Member
          </button>
          <button
            onClick={fetchMembers}
            className="bg-red-500 text-white px-3 py-1 rounded text-xs"
          >
            Force Refresh
          </button>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {boardMembers.map((member, index) => {
          const cardColor = cardColors[index % cardColors.length];

          return (
            <div
              key={member.id}
              className="border border-rose-tan-light rounded-xl p-6 bg-white luxury-shadow"
            >
              {/* Card Preview */}
              <div className="mb-4">
                <div className="text-xs text-mauve-wine-light mb-2">
                  Preview ({member.label || DefaultValues.Label} Card)
                </div>
                <div
                  className={`h-40 ${cardColor} rounded-lg relative overflow-hidden`}
                >
                  {/* Card Label */}
                  <div className="absolute top-2 left-3 text-white text-sm font-bold">
                    {member.label || DefaultValues.Label}
                  </div>

                  {/* Card Bottom Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-90 p-3 text-center">
                    <div className="text-white font-bold text-sm">
                      {member.name || "Name"}
                    </div>
                    <div className="text-rose-tan-light text-xs">
                      {member.position || "Position"},{" "}
                      {member.description || "Description"}
                    </div>
                  </div>

                  {/* Card Image or Initial */}
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      className="object-cover absolute inset-0"
                      height={160}
                      width={120}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {member.name?.charAt(0).toUpperCase() ||
                            DefaultValues.Initial}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Label */}
                <div>
                  <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                    Card Label
                  </label>
                  <input
                    type="text"
                    value={member.label}
                    onChange={(e) =>
                      updateMemberField(index, "label", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                    placeholder="e.g., VISIONARY, STRATEGIC"
                  />
                  <p className="text-xs text-mauve-wine-light mt-1">
                    This appears in the top-left corner of the card
                  </p>
                </div>

                {/* Name & Position */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                      Member Name
                    </label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) =>
                        updateMemberField(index, "name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                      placeholder="e.g., John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                      Position Title
                    </label>
                    <input
                      type="text"
                      value={member.position}
                      onChange={(e) =>
                        updateMemberField(index, "position", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                      placeholder="e.g., President"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={member.description}
                    onChange={(e) =>
                      updateMemberField(index, "description", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                    placeholder="e.g., Leading with Vision"
                  />
                </div>

                {/* Sequence */}
                <div>
                  <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                    Sequence
                  </label>
                  <input
                    type="number"
                    value={member.sequence}
                    onChange={(e) =>
                      updateMemberField(
                        index,
                        "sequence",
                        Number(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                    placeholder="e.g., 1"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                    Professional Photo
                  </label>
                  <p className="text-xs text-mauve-wine-light mb-2">
                    Upload a professional headshot for the{" "}
                    {member.label || DefaultValues.Label} card
                  </p>

                  <div className="flex items-center space-x-4">
                    {/* Styled Upload Button */}
                    <label
                      htmlFor={`uploader-board-${index}`}
                      className="w-full px-3 py-2 border border-rose-tan-light rounded bg-white text-mauve-wine-dark cursor-pointer text-center hover:bg-rose-tan-light hover:text-white transition-colors"
                    >
                      {member.image ? "Change Image" : "Choose File"}
                    </label>

                    <input
                      type="file"
                      id={`uploader-board-${index}`}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files && uploadImage(index, e.target.files[0])
                      }
                    />

                    {member.image && (
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {member.image && (
                    <div className="mt-3">
                      <Image
                        src={member.image}
                        alt="Preview"
                        className="object-cover rounded-lg border"
                        height={80}
                        width={80}
                      />
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                {boardMembers.length > 1 && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => deleteMember(index)}
                      className="text-red-500 hover:text-red-700 font-medium text-sm"
                    >
                      Delete Member
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={saveMembers}
          className="luxury-gradient text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90"
        >
          {loading ? "Saving..." : "Save All Board Members"}
        </button>
      </div>
    </div>
  );
}

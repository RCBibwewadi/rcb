"use client";
import React, { useState } from "react";

interface BoardMember {
  id: number;
  name: string;
  position: string;
  description: string;
  image: string;
  gradient: string;
  initial: string;
  label: string;
}

export default function BoardMembersEditor() {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([
    {
      id: 1,
      name: "President",
      position: "President",
      description: "Leading with Vision",
      image: "",
      gradient: "from-mauve-wine to-mauve-wine-dark",
      initial: "P",
      label: "VISIONARY",
    },
    {
      id: 2,
      name: "Vice President",
      position: "Vice President",
      description: "Supporting Excellence",
      image: "",
      gradient: "from-rose-tan to-rose-tan-dark",
      initial: "VP",
      label: "STRATEGIC",
    },
  ]);

  const handleChange = (index: number, field: keyof BoardMember, value: string) => {
    const updated = [...boardMembers];
    updated[index][field] = value;
    setBoardMembers(updated);
  };

  const handleImageUpload = (index: number, file: File) => {
    if (!file.type.startsWith("image/")) return alert("Only image files allowed.");
    if (file.size > 5 * 1024 * 1024) return alert("File must be < 5MB");

    const reader = new FileReader();
    reader.onload = (e) => {
      handleChange(index, "image", e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addBoardMember = () => {
    setBoardMembers([
      ...boardMembers,
      {
        id: Date.now(),
        name: "",
        position: "",
        description: "",
        image: "",
        gradient: "from-mauve-wine to-rose-tan",
        initial: "M",
        label: "LEADER",
      },
    ]);
  };

  const deleteBoardMember = (index: number) => {
    const updated = [...boardMembers];
    updated.splice(index, 1);
    setBoardMembers(updated);
  };

  const saveBoardMembers = () => {
    console.log("Saved Board Members:", boardMembers);
    alert("Board members saved!");
  };

  return (
    <div className="glass-effect rounded-xl p-6 luxury-shadow fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-mauve-wine">Board Members</h3>
        <button
          onClick={addBoardMember}
          className="bg-rose-tan text-white px-4 py-2 rounded-lg font-semibold hover:bg-rose-tan-dark transition-colors"
        >
          Add Member
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {boardMembers.map((member, index) => (
          <div key={member.id} className="border border-rose-tan-light rounded-xl p-6 bg-white luxury-shadow">
            {/* Preview */}
            <div className="mb-4">
              <div className="text-xs text-mauve-wine-light mb-2">
                Preview ({member.label} Card)
              </div>
              <div className={`h-40 bg-gradient-to-br ${member.gradient} rounded-lg relative overflow-hidden`}>
                <div className="absolute top-2 left-3 text-white text-sm font-bold">
                  {member.label}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-90 p-3 text-center">
                  <div className="text-white font-bold text-sm">{member.name}</div>
                  <div className="text-rose-tan-light text-xs">
                    {member.position}, {member.description}
                  </div>
                </div>
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover absolute inset-0" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {member.name?.charAt(0) || "M"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <input
                type="text"
                value={member.label}
                onChange={(e) => handleChange(index, "label", e.target.value)}
                className="w-full px-3 py-2 border border-rose-tan-light rounded"
                placeholder="Card Label"
              />
              <input
                type="text"
                value={member.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
                className="w-full px-3 py-2 border border-rose-tan-light rounded"
                placeholder="Member Name"
              />
              <input
                type="text"
                value={member.position}
                onChange={(e) => handleChange(index, "position", e.target.value)}
                className="w-full px-3 py-2 border border-rose-tan-light rounded"
                placeholder="Position"
              />
              <input
                type="text"
                value={member.description}
                onChange={(e) => handleChange(index, "description", e.target.value)}
                className="w-full px-3 py-2 border border-rose-tan-light rounded"
                placeholder="Description"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload(index, e.target.files[0])}
              />
              {boardMembers.length > 1 && (
                <button
                  onClick={() => deleteBoardMember(index)}
                  className="text-red-500 hover:text-red-700 text-sm mt-2"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={saveBoardMembers}
          className="luxury-gradient text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90"
        >
          Save All Board Members
        </button>
      </div>
    </div>
  );
}

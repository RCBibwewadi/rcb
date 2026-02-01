/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useToast } from "../ui/ToastProvider";


enum ToastType {
  Error = "error",
  Success = "success",
}

export default function QuickEditor() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const { showToast } = useToast();
  async function fetchItems() {
    const res = await fetch("/api/quick");
    const data = await res.json();

    // Always ensure array
    setItems(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  async function handleSubmit(e: any) {
    try{
      e.preventDefault();
    setLoading(true);

    const form = e.target;
    const file = form.file.files[0] ?? null;

    let media_url = "";
    let thumbnail = "";

    // 1️⃣ If file exists, upload to Supabase
    if (file) {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const uploadRes = await fetch("/api/quick/upload", {
        method: "POST",
        body: uploadData,
      });

      const uploadJson = await uploadRes.json();
      if (uploadJson.error) {
        showToast(uploadJson.error || "Something went wrong", ToastType.Error);
        alert(uploadJson.error)
        setLoading(false);
        return;
      }

      media_url = uploadJson.media_url;
      thumbnail = uploadJson.thumbnail;
    }

    // 2️⃣ Build JSON payload for table
    const payload = {
      section: form.section.value,
      title: form.title.value,
      description: form.description.value,
      media_type: form.media_type.value,
      media_url,
      thumbnail_url: thumbnail || "https://placehold.co/600x400?text=Rotaract",
      sequence: Number(form.sequence.value) || 0,
    };

    // 3️⃣ Send JSON to /api/quick
    const res = await fetch("/api/quick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (result.error) {
      showToast(result.error || "Something went wrong", ToastType.Error);
      alert(result.error)
    };

    form.reset();
    setLoading(false);
    fetchItems();
    } catch(error) {
      showToast("Something went wrong" , ToastType.Error)
    } finally {
      setHasFile(false);
    }
    
  }

  async function handleDelete(id: string) {
    await fetch(`/api/quick`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    fetchItems();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Quick Editor</h1>
      <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
        Category
      </label>
      <form onSubmit={handleSubmit} className="space-y-3 mb-10">
        <select
          name="section"
          className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
        >
          <option value="dances" className="text-gray-800 bg-white">
            Dances
          </option>
          <option value="fun" className="text-gray-800 bg-white">
            Moments
          </option>
          <option value="articles" className="text-gray-800 bg-white">
            Articles
          </option>
          <option value="talent" className="text-gray-800 bg-white">
            Talent
          </option>
        </select>
        <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
          Title
        </label>
        <input
          type="text"
          name="title"
          className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
          placeholder="e.g., Cricket Masti"
        />
        <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
          Description
        </label>
        <input
          type="text"
          name="description"
          className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
          placeholder="e.g., COC fun"
        />
        <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
          Sequence
        </label>
        <input
          type="number"
          name="sequence"
          defaultValue={0}
          className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
        />

        <select
          name="media_type"
          className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
        <div className="flex items-center space-x-4">
          <label
            className={`w-full px-3 py-2 border rounded text-center cursor-pointer transition-colors
        ${
          hasFile
            ? "bg-green-100 border-green-400 text-green-800"
            : "bg-white border-rose-tan-light text-mauve-wine-dark hover:bg-rose-tan-light hover:text-white"
        }`}
          >
            {hasFile ? "File Selected ✔" : "Choose File"}

            <input
              type="file"
              name="file"
              className="hidden"
              onChange={(e) => setHasFile(!!e.target.files?.length)}
            />
          </label>
        </div>

        <button
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? "Uploading..." : "Add Item"}
        </button>
      </form>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="border p-3 rounded flex justify-between"
          >
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-gray-600">
                {item.section} • seq: {item.sequence ?? 0}
              </p>
            </div>

            <button
              onClick={() => handleDelete(item.id)}
              className="text-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

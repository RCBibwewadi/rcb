"use client";
import Image from "next/image";
import React, { useRef, useState } from "react";
// import { createClient } from "@supabase/supabase-js";

// ✅ Use your env vars
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

interface ImageUploaderProps {
  label?: string;
  imageUrl?: string;
  onUpload: (url: string) => void;
}

export default function ImageUploader({ label, imageUrl, onUpload }: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(imageUrl || "");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload to Supabase storage
      const { error } = await supabase.storage.from("images").upload(filePath, file);
      if (error) throw error;

      // Get public URL
      const { data } = supabase.storage.from("images").getPublicUrl(filePath);
      const url = data.publicUrl;

      setPreview(url);
      onUpload(url);
    } catch (err: any) {
      console.error("Upload error:", err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
          {label}
        </label>
      )}
      <div
        className="border border-rose-tan-light rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-rose-tan-light/10 transition"
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <Image src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
        ) : (
          <span className="text-sm text-mauve-wine-light">
            {uploading ? "Uploading..." : "Click to upload"}
          </span>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}

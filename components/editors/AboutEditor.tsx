"use client";
import { useState } from "react";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";

interface AboutData {
  title: string;
  mainTitle: string;
  description1: string;
  description2: string;
  description3: string;
}

export default function AboutEditor({ initialData }: { initialData: AboutData }) {
  const [about, setAbout] = useState<AboutData>(initialData);

  const handleChange = (field: keyof AboutData, value: string) => {
    setAbout({ ...about, [field]: value });
  };

  const saveAbout = () => {
    console.log("Save About:", about);
    // TODO: Save to Supabase
  };

  return (
    <div className="glass-effect rounded-xl p-6 luxury-shadow fade-in">
      <h3 className="text-2xl font-bold text-mauve-wine mb-6">About Section</h3>
      <div className="space-y-6">
        <Input
          label="Section Title"
          value={about.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
        <Input
          label="Main Title"
          value={about.mainTitle}
          onChange={(e) => handleChange("mainTitle", e.target.value)}
        />
        <Textarea
          label="First Paragraph"
          value={about.description1}
          onChange={(e) => handleChange("description1", e.target.value)}
        />
        <Textarea
          label="Second Paragraph"
          value={about.description2}
          onChange={(e) => handleChange("description2", e.target.value)}
        />
        <Textarea
          label="Third Paragraph"
          value={about.description3}
          onChange={(e) => handleChange("description3", e.target.value)}
        />
        <Button onClick={saveAbout}>Save Changes</Button>
      </div>
    </div>
  );
}

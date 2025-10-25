"use client";
import React, { useEffect, useState } from "react";

interface ProjectImage {
  id?: string;
  image_url: string;
}

interface Project {
  id?: string;
  project_title: string;
  project_description: string;
  project_detail_description?: string;
  project_images?: ProjectImage[];
}

const ProjectsEditor: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  console.log(projects);
  // Fetch existing projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects", { cache: "no-store" });
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, []);

  // Add a new blank project
  const addProject = () => {
    setProjects([
      ...projects,
      {
        project_title: "",
        project_description: "",
        project_detail_description: "",
        project_images: [],
      },
    ]);
  };

  // Update string fields safely
  const updateProjectField = (
    index: number,
    field:
      | "project_title"
      | "project_description"
      | "project_detail_description",
    value: string
  ) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  // Update images safely
  const updateProjectImages = (index: number, images: ProjectImage[]) => {
    const updated = [...projects];
    updated[index].project_images = images;
    setProjects(updated);
  };

  // Upload image to Supabase
  const handleImageUpload = async (index: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/projects/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.url) {
        const newImage: ProjectImage = { image_url: data.url };
        updateProjectImages(index, [
          ...(projects[index].project_images || []),
          newImage,
        ]);
      } else {
        alert("Image upload failed.");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Failed to upload image.");
    }
  };

  // Delete an image from project
  const deleteProjectImage = (projectIndex: number, imageIndex: number) => {
    const images = [...(projects[projectIndex].project_images || [])];
    images.splice(imageIndex, 1);
    updateProjectImages(projectIndex, images);
  };

  // Delete a project
  const deleteProject = async (index: number) => {
    const project = projects[index];
    if (project.id) {
      try {
        await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      } catch (err) {
        console.error("Error deleting project:", err);
      }
    }
    const updated = [...projects];
    updated.splice(index, 1);
    setProjects(updated);
  };

  // Save all projects
  const saveProjects = async () => {
    setLoading(true);
    try {
      for (const project of projects) {
        if (project.id) {
          // Update existing project
          await fetch(`/api/projects/${project.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              project_title: project.project_title,
              project_description: project.project_description,
              project_detail_description: project.project_detail_description,
              images: project.project_images?.map((img) => img.image_url),
            }),
          });
        } else {
          // Create new project
          const res = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              project_title: project.project_title,
              project_description: project.project_description,
              project_detail_description: project.project_detail_description,
              images: project.project_images?.map((img) => img.image_url) || [],
            }),
          });
          const data = await res.json();
          project.id = data.project?.id;
        }
      }

      alert("Projects saved successfully!");
    } catch (err) {
      console.error("Error saving projects:", err);
      alert("Error saving projects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6 lg:p-8 luxury-shadow fade-in bg-luxury-cream">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-mauve-wine">
          Manage Community Projects
        </h3>
        <button
          onClick={addProject}
          className="bg-rose-tan text-white px-4 py-2 rounded-lg font-semibold hover:bg-rose-tan-dark transition-colors"
        >
          Add Project
        </button>
      </div>

      <div className="space-y-6">
        {projects.map((project, index) => (
          <div
            key={project.id || index}
            className="bg-white rounded-xl p-5 border border-rose-tan-light luxury-shadow transition-transform duration-300 hover:scale-[1.01]"
          >
            <div className="grid grid-cols-1 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={project.project_title}
                  onChange={(e) =>
                    updateProjectField(index, "project_title", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={project.project_description}
                  onChange={(e) =>
                    updateProjectField(
                      index,
                      "project_description",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  value={project.project_detail_description || ""}
                  onChange={(e) =>
                    updateProjectField(
                      index,
                      "project_detail_description",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                  Project Images
                </label>
                <div className="flex flex-wrap gap-3 mb-2">
                  {(project.project_images || []).map((img, imgIndex) => (
                    <div key={imgIndex} className="relative w-24 h-24">
                      <img
                        src={img.image_url}
                        alt="Project"
                        className="w-full h-full object-cover rounded border"
                      />
                      <button
                        onClick={() => deleteProjectImage(index, imgIndex)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  id={`file-${index}`}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      handleImageUpload(index, e.target.files[0]);
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById(`file-${index}`)?.click()
                  }
                  className="bg-rose-tan text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-tan-dark transition-colors text-sm"
                >
                  Upload Image
                </button>
              </div>
            </div>

            {/* Delete Project */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => deleteProject(index)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Delete Project
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Save All */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={saveProjects}
          disabled={loading}
          className={`luxury-gradient text-white px-6 py-3 rounded-lg font-semibold transition-all ${
            loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
          }`}
        >
          {loading ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
};

export default ProjectsEditor;

"use client";
import Image from "next/image";
import React, { useState } from "react";

interface Project {
  title: string;
  description: string;
  image: string;
}

interface ProjectsEditorProps {
  initialData: Project[];
  onSave: (projects: Project[]) => void;
}

const ProjectsEditor: React.FC<ProjectsEditorProps> = ({ initialData, onSave }) => {
  const [projects, setProjects] = useState<Project[]>(initialData || []);

  // Add a new project
  const addProject = () => {
    setProjects([
      ...projects,
      { title: "", description: "", image: "" },
    ]);
  };

  // Delete a project
  const deleteProject = (index: number) => {
    const updated = [...projects];
    updated.splice(index, 1);
    setProjects(updated);
  };

  // Update a project field
  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  // Save all projects
  const saveProjects = () => {
    onSave(projects);
  };

  // Image upload handler
  const handleImageUpload = (index: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      updateProject(index, "image", e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="glass-effect rounded-xl p-6 luxury-shadow fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-mauve-wine">Projects</h3>
        <button
          onClick={addProject}
          className="bg-rose-tan text-white px-4 py-2 rounded-lg font-semibold hover:bg-rose-tan-dark transition-colors"
        >
          Add Project
        </button>
      </div>

      <div className="space-y-4">
        {projects.map((project, index) => (
          <div
            key={index}
            className="border border-rose-tan-light rounded-lg p-4"
          >
            <div className="grid grid-cols-1 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) =>
                    updateProject(index, "title", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={project.description}
                  onChange={(e) =>
                    updateProject(index, "description", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                />
              </div>

              {/* Image uploader */}
              <div>
                <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                  Project Image
                </label>

                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="url"
                      placeholder="Enter image URL"
                      value={project.image}
                      onChange={(e) =>
                        updateProject(index, "image", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      id={`file-${index}`}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageUpload(index, e.target.files[0]);
                        }
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

                    {project.image && (
                      <button
                        type="button"
                        onClick={() => updateProject(index, "image", "")}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors text-sm"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>

                {project.image && (
                  <div className="mt-3">
                    <Image
                      src={project.image}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Delete project */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => deleteProject(index)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Save all projects */}
      <div className="mt-6">
        <button
          onClick={saveProjects}
          className="luxury-gradient text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
        >
          Save All Changes
        </button>
      </div>
    </div>
  );
};

export default ProjectsEditor;

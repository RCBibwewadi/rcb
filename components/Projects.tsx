"use client";
import { useEffect, useState } from "react";

interface Project {
  id: string;
  project_title: string;
  project_description: string;
  project_detail_description: string;
  project_images?: { image_url: string }[];
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null); // for modal

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects", { cache: "no-store" });
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section id="projects" className="py-20 luxury-gradient relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Making a Difference in Our Community
          </h2>
          <div className="w-24 h-1 bg-luxury-gold mx-auto mb-8"></div>
          <p className="text-white max-w-2xl mx-auto">
            Our impactful projects address real community needs and create
            lasting positive change.
          </p>
        </div>

        {/* Loader */}
        {loading ? (
          <div className="text-center text-mauve-wine-light text-lg">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center text-mauve-wine-light text-lg">
            No projects available.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="bg-white rounded-xl luxury-shadow overflow-hidden hover:scale-105 transition-transform duration-300"
              >
                {/* Image / Gradient Header */}
                {project.project_images?.length ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={project.project_images[0].image_url}
                      alt={project.project_title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={`h-48 ${
                      index % 3 === 0
                        ? "bg-gradient-to-br from-rose-tan to-rose-tan-dark"
                        : index % 3 === 1
                        ? "bg-gradient-to-br from-mauve-wine to-mauve-wine-dark"
                        : "bg-gradient-to-br from-luxury-gold to-rose-tan"
                    }`}
                  ></div>
                )}

                {/* Card Body */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-rose-tan-dark mb-3">
                    {project.project_title}
                  </h3>
                  <p className="text-mauve-wine-light mb-4">
                    {project.project_description}
                  </p>
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="flex items-center text-rose-tan font-medium cursor-pointer hover:text-rose-tan-dark transition-colors"
                  >
                    <span>Learn More</span>
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Modal for Detailed Description */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6 relative animate-fade-in">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-0 right-3 text-gray-500 hover:text-rose-tan transition-colors text-xl font-bold"
            >
              ×
            </button>

            {/* Image */}
            {selectedProject.project_images?.[0]?.image_url && (
              <div className="h-48 w-full mb-4 overflow-hidden rounded-lg">
                <img
                  src={selectedProject.project_images[0].image_url}
                  alt={selectedProject.project_title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <h3 className="text-2xl font-bold text-mauve-wine mb-3">
              {selectedProject.project_title}
            </h3>
            <div className="text-mauve-wine-light text-sm leading-relaxed max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-rose-tan scrollbar-track-gray-100">
              {selectedProject.project_detail_description}
            </div>

            {/* Footer */}
            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2 bg-rose-tan text-white rounded-lg hover:bg-rose-tan-dark transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

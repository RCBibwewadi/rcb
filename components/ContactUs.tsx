"use client";
import { useState } from "react";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 🚀 Add form submission logic (API call, email service, etc.)
    console.log("Form Submitted:", formData);
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
        {/* Left Content */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-mauve-wine mb-6">
            Get in Touch
          </h2>
          <p className="text-mauve-wine-light mb-6">
            Have questions, ideas, or want to collaborate? Reach out to us—we’d
            love to hear from you.
          </p>
          <ul className="space-y-4 text-mauve-wine-light">
            <li>
              📍 <span className="font-medium">Address:</span> Community Center,
              Bibwewadi, Pune
            </li>
            <li>
              📞 <span className="font-medium">Phone:</span> +91-9876543210
            </li>
            <li>
              📧 <span className="font-medium">Email:</span>{" "}
              contact@rotaryclub.org
            </li>
          </ul>
        </div>

        {/* Contact Form */}
        <div className="glass-effect rounded-xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-mauve-wine"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-rose-tan focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-mauve-wine"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-rose-tan focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-mauve-wine"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-rose-tan focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-mauve-wine to-rose-tan text-white font-medium py-3 rounded-md shadow-lg hover:scale-105 transition-transform duration-300"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

"use client";
import { useState } from "react";

export default function EventsSection() {
  const [view, setView] = useState<"list" | "calendar">("list");

  return (
    <section id="events" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-mauve-wine mb-4">
            Upcoming Events & Calendar
          </h2>
          <div className="w-24 h-1 luxury-gradient mx-auto mb-8"></div>
          <p className="text-mauve-wine-light max-w-2xl mx-auto">
            Stay updated with our exciting events and activities. Switch between
            calendar and list view.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-luxury-cream p-1 rounded-lg luxury-shadow">
            <button
              onClick={() => setView("list")}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-300 ${
                view === "list"
                  ? "bg-white text-mauve-wine luxury-shadow"
                  : "text-mauve-wine-light"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-300 ${
                view === "calendar"
                  ? "bg-white text-mauve-wine luxury-shadow"
                  : "text-mauve-wine-light"
              }`}
            >
              Calendar View
            </button>
          </div>
        </div>

        {/* List View */}
        {view === "list" && (
          <div id="list-view" className="max-w-4xl mx-auto space-y-6">
            {/* Example Event 1 */}
            <div className="glass-effect rounded-xl p-6 lg:p-8 hover-scale luxury-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-rose-tan to-rose-tan-dark text-white px-4 py-2 rounded-lg font-semibold text-sm luxury-shadow">
                      15 SEP 2024
                    </div>
                    <div className="ml-4 text-mauve-wine-light">
                      <span className="font-medium">6:00 PM - 8:00 PM</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-mauve-wine mb-3">
                    Leadership Development Workshop
                  </h3>
                  <p className="text-mauve-wine-light mb-4 leading-relaxed">
                    Interactive workshop on developing leadership skills and
                    building effective teams. Perfect for young professionals.
                  </p>
                  <p className="text-sm text-rose-tan font-medium">
                    <span className="font-semibold">Location:</span> Community
                    Center, Bibwewadi
                  </p>
                </div>
              </div>
            </div>

            {/* You can map more events here */}
          </div>
        )}

        {/* Calendar View */}
        {view === "calendar" && (
          <div id="calendar-view" className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Calendar */}
              <div className="lg:col-span-2">
                <div className="glass-effect rounded-xl p-6 luxury-shadow">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <button className="p-2 text-mauve-wine hover:text-rose-tan transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 19l-7-7 7-7"
                        ></path>
                      </svg>
                    </button>
                    <h3 className="text-2xl font-semibold text-mauve-wine">
                      September 2024
                    </h3>
                    <button className="p-2 text-mauve-wine hover:text-rose-tan transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="calendar-grid mb-4">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-center font-semibold text-mauve-wine py-3"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>
                  <div id="calendar-days" className="calendar-grid">
                    {/* Calendar days will be generated dynamically later */}
                  </div>
                </div>
              </div>

              {/* Event Details Panel */}
              <div className="lg:col-span-1">
                <div className="glass-effect rounded-xl p-6 luxury-shadow">
                  <h4 className="text-xl font-semibold text-mauve-wine mb-4">
                    Event Details
                  </h4>
                  <div id="event-details">
                    <p className="text-mauve-wine-light text-center py-8">
                      Click on a date with events to see details
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

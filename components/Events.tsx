"use client";
import { useEffect, useState } from "react";
import { IEvent } from "./editors/EventsEditor";
import CalenderView from "./ui/CalenderView";

export default function EventsSection() {
  const [view, setView] = useState<"list" | "calendar">("calendar");
  const [events, setEvents] = useState<IEvent[]>([]);
  const [listTab, setListTab] = useState<"upcoming" | "previous">("upcoming");
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data);
    };
    fetchEvents();
  }, []);
  const today = new Date();

  // --- Separate & sort ---
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const previousEvents = events
    .filter((e) => new Date(e.date) < today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const activeList = listTab === "upcoming" ? upcomingEvents : previousEvents;

  const visibleEvents = activeList.slice(0, visibleCount);

  return (
    <section id="events" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-luxury-gold mb-4">
            Upcoming Events & Calendar
          </h2>
          <div className="w-24 h-1 luxury-gradient mx-auto mb-8"></div>
          <p className="text-rose-tan-light max-w-2xl mx-auto">
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
          <>
            {/* Tabs inside List View */}
            <div className="flex justify-center mb-8">
              <div className="bg-black border border-rose-tan/30 p-1 rounded-lg">
                <button
                  onClick={() => {
                    setListTab("upcoming");
                    setVisibleCount(6);
                  }}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                    listTab === "upcoming"
                      ? "bg-rose-tan text-black"
                      : "text-rose-tan-light"
                  }`}
                >
                  Upcoming Events
                </button>

                <button
                  onClick={() => {
                    setListTab("previous");
                    setVisibleCount(6);
                  }}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                    listTab === "previous"
                      ? "bg-rose-tan text-black"
                      : "text-rose-tan-light"
                  }`}
                >
                  Previous Events
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {visibleEvents.map((event) => (
                <div
                  key={event.id}
                  className="glass-effect rounded-xl p-6 lg:p-8 hover-scale luxury-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <div className="bg-gradient-to-r from-rose-tan to-rose-tan-dark text-white px-4 py-2 rounded-lg font-semibold text-sm luxury-shadow">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="ml-4 text-mauve-wine-light">
                          <span className="font-medium">{event.time}</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-mauve-wine mb-3">
                        {event.title}
                      </h3>
                      <p className="text-mauve-wine-light mb-4 leading-relaxed">
                        {event.description}
                      </p>
                      <p className="text-sm text-rose-tan font-medium">
                        <span className="font-semibold">Location:</span>{" "}
                        {event.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Show More Button */}
            {visibleCount < activeList.length && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setVisibleCount((c) => c + 6)}
                  className="px-6 py-3 rounded-lg bg-rose-tan text-black font-medium luxury-shadow hover-scale transition-all"
                >
                  Show More
                </button>
              </div>
            )}
          </>
        )}

        {/* Calendar View */}
        {view === "calendar" && (
          <main className="p-8">
            <CalenderView />
          </main>
        )}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface Event {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location?: string;
  description?: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CalendarView() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

    useEffect(() => {
    const fetchEvents = async () => {
        setLoading(true);
        const res = await fetch("/api/events");
        const data = await res.json();
        if(data){
            setEvents(data);
            setLoading(false);
        } else {
            setLoading(false);
        }
    };
    fetchEvents();
  }, []);

  // Calendar math
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarDays: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const selectedEvents = events.filter(
    (event) =>
      event.date ===
      `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
        selectedDate
      ).padStart(2, "0")}`
  );

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };


  return (
    <div id="calendar-view" className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="glass-effect rounded-xl p-6 luxury-shadow">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePrevMonth}
                className="p-2 text-mauve-wine hover:text-rose-tan transition-colors"
              >
                ←
              </button>
              <h3 className="text-2xl font-semibold text-mauve-wine">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-2 text-mauve-wine hover:text-rose-tan transition-colors"
              >
                →
              </button>
            </div>

            {/* Week Days Header */}
            <div className="calendar-grid mb-4">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-mauve-wine py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div id="calendar-days" className="calendar-grid">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={idx}></div>;

                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}-${String(day).padStart(2, "0")}`;
                const hasEvents = events.some((event) => event.date === dateStr);
                return (
                  <div
  key={idx}
  onClick={() => setSelectedDate(day.toString())}
  className={`relative flex items-center justify-center py-6 rounded-lg cursor-pointer 
    border border-black transition-colors duration-300
    ${
      hasEvents
        ? selectedDate === day.toString()
          ? "bg-rose-tan/30 border-mauve-wine" 
          : "bg-rose-tan/70 hover:bg-rose-tan/50" 
        : selectedDate === day.toString()
        ? "bg-rose-tan/20 border-mauve-wine" 
        : "bg-white hover:bg-gray-50" 
    }`}
>
  <span
    className={`font-medium transition-colors duration-300
      ${
        hasEvents
          ? "text-mauve-wine-dark"
          : "text-mauve-wine"
      }`}
  >
    {day}
  </span>
</div>

                );
              })}
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="lg:col-span-1">
          <div className="glass-effect rounded-xl p-6 luxury-shadow">
            <h4 className="text-xl font-semibold text-mauve-wine mb-4">
              Event Details
            </h4>
            <div id="event-details">
              {loading ? (
                <p className="text-mauve-wine-light text-center py-8">Loading...</p>
              ) : !selectedDate ? (
                <p className="text-mauve-wine-light text-center py-8">
                  Click on a date with events to see details
                </p>
              ) : selectedEvents.length === 0 ? (
                <p className="text-mauve-wine-light text-center py-8">
                  No events on this date
                </p>
              ) : (
                <ul className="space-y-4">
                  {selectedEvents.map((event) => (
                    <li
                      key={event.id}
                      className="border rounded-lg p-4 bg-white/70"
                    >
                      <h5 className="font-semibold text-mauve-wine">
                        {event.title}
                      </h5>
                      {event.time && (
                        <p className="text-sm text-gray-600">{event.time}</p>
                      )}
                      {event.location && (
                        <p className="text-sm text-gray-600">
                          📍 {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-2">
                          {event.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

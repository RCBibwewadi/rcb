"use client";
import React, { useState } from "react";

export interface IEvent {
  id?: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

export default function EventsEditor({ initialData }: { initialData: IEvent[] }) {
  const [events, setEvents] = useState<IEvent[]>(initialData || []);
  const [loading, setLoading] = useState(false);

  const addEvent = () => setEvents([...events, { title: "", date: "", time: "", location: "", description: "" }]);
  const deleteEvent = (index: number) => setEvents(events.filter((_, i) => i !== index));
  const updateEvent = (index: number, field: keyof IEvent, value: string) => {
    const updated = [...events];
    updated[index][field] = value;
    setEvents(updated);
  };

  const saveEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(events),
      });
      if (!res.ok) throw new Error("Failed to save");
      alert("Events saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving events");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6 luxury-shadow fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-mauve-wine">Events</h3>
        <button
          onClick={addEvent}
          className="bg-rose-tan text-white px-4 py-2 rounded-lg font-semibold hover:bg-rose-tan-dark transition-colors"
        >
          Add Event
        </button>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="border border-rose-tan-light rounded-lg p-4">
            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={event.title}
                onChange={(e) => updateEvent(index, "title", e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="date"
                value={event.date}
                onChange={(e) => updateEvent(index, "date", e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Time"
                value={event.time}
                onChange={(e) => updateEvent(index, "time", e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Location"
                value={event.location}
                onChange={(e) => updateEvent(index, "location", e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <textarea
              rows={3}
              placeholder="Description"
              value={event.description}
              onChange={(e) => updateEvent(index, "description", e.target.value)}
              className="w-full mt-4 px-3 py-2 border rounded"
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => deleteEvent(index)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Save */}
      <div className="mt-6">
        <button
          onClick={saveEvents}
          disabled={loading}
          className="luxury-gradient text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
        >
          {loading ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}

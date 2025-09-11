"use client";
import React, { useState } from "react";

interface Event {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

interface EventsEditorProps {
  initialData: Event[];
  onSave: (events: Event[]) => void;
}

const EventsEditor: React.FC<EventsEditorProps> = ({ initialData, onSave }) => {
  const [events, setEvents] = useState<Event[]>(initialData || []);

  const addEvent = () => {
    setEvents([...events, { title: "", date: "", time: "", location: "", description: "" }]);
  };

  const deleteEvent = (index: number) => {
    const updated = [...events];
    updated.splice(index, 1);
    setEvents(updated);
  };

  const updateEvent = (index: number, field: keyof Event, value: string) => {
    const updated = [...events];
    updated[index][field] = value;
    setEvents(updated);
  };

  return (
    <div className="glass-effect rounded-xl p-6 luxury-shadow fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-mauve-wine">Events</h3>
        <button
          onClick={addEvent}
          className="bg-rose-tan text-white px-4 py-2 rounded-lg font-semibold hover:bg-rose-tan-dark transition-colors"
        >
          Add Event
        </button>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="border border-rose-tan-light rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={event.title}
                  onChange={(e) => updateEvent(index, "title", e.target.value)}
                  className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={event.date}
                  onChange={(e) => updateEvent(index, "date", e.target.value)}
                  className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                  Time
                </label>
                <input
                  type="text"
                  value={event.time}
                  onChange={(e) => updateEvent(index, "time", e.target.value)}
                  className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={event.location}
                  onChange={(e) => updateEvent(index, "location", e.target.value)}
                  className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={event.description}
                onChange={(e) => updateEvent(index, "description", e.target.value)}
                className="w-full px-3 py-2 border border-rose-tan-light rounded focus:ring-2 focus:ring-rose-tan"
              />
            </div>
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

      <div className="mt-6">
        <button
          onClick={() => onSave(events)}
          className="luxury-gradient text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
        >
          Save All Changes
        </button>
      </div>
    </div>
  );
};

export default EventsEditor;

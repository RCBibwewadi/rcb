"use client";
import React, { useEffect, useState } from "react";
import PopupMessage from "../ui/PopUpMessage";
import { useToast } from "../ui/ToastProvider";

export interface IEvent {
  id?: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

export default function EventsEditor({ initialData }: { initialData: IEvent[] }) {
  const { showToast } = useToast();
  const [events, setEvents] = useState<IEvent[]>(initialData || []);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{ message: string; type: "success" | "error" } | null>(null);


   useEffect(() => {
    const fetchEvents = async () => {
      try{
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      } else {
          showToast("Failed to fetch events", "error");
        }
      } catch {
        showToast("Error fetching events", "error");
      }  
    };
    fetchEvents();
  }, []);

  const addEvent = () => setEvents([...events, { title: "", date: "", time: "", location: "", description: "" }]);
  const updateEvent = (index: number, field: keyof IEvent, value: string) => {
    const updated = [...events];
    updated[index][field] = value;
    setEvents(updated);
  };

  const saveEvents = async (event: IEvent) => {
    setLoading(true);
    try {
      const method = event.id ? "PATCH" : "POST";
      const res = await fetch("/api/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      if (!res.ok) throw new Error("Failed to save event");
      const saved = await res.json();

      // Update local state with returned data (id comes from DB)
      setEvents((prev) =>
        prev.map((ev) => (ev.id === event.id ? saved[0] : ev))
      );
      showToast(event.id ? "Event updated!" : "Event created!", "success");
    } catch (err) {
       showToast("Error saving event", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const deleteEvent = async (id?: string, index?: number) => {
    if (!id) {
      setEvents(events.filter((_, i) => i !== index));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete event");

      setEvents(events.filter((ev) => ev.id !== id));
      showToast("Event deleted", "success");
    } catch (err) {
      console.error(err);
      showToast("Error deleting event", "error");
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
          <div
            key={event.id || index}
            className="border border-rose-tan-light rounded-lg p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={event.title}
                onChange={(e) =>
                  updateEvent(index, "title", e.target.value)
                }
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="date"
                value={event.date}
                onChange={(e) =>
                  updateEvent(index, "date", e.target.value)
                }
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Time"
                value={event.time}
                onChange={(e) =>
                  updateEvent(index, "time", e.target.value)
                }
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Location"
                value={event.location}
                onChange={(e) =>
                  updateEvent(index, "location", e.target.value)
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <textarea
              rows={3}
              placeholder="Description"
              value={event.description}
              onChange={(e) =>
                updateEvent(index, "description", e.target.value)
              }
              className="w-full mt-4 px-3 py-2 border rounded"
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => saveEvents(event)}
                disabled={loading}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                {event.id ? "Update" : "Save"}
              </button>
              <button
                onClick={() => deleteEvent(event.id, index)}
                disabled={loading}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

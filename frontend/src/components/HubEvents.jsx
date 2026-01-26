import { useEffect, useState } from "react";
import api from "../api/axios";
import EventCreateModal from "./EventCreateModal";

export default function HubEvents({ hubId, hub, user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/events/?hub=${hubId}`);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hubId) fetchEvents();
  }, [hubId]);

  const attend = async (eventId) => {
    await api.post(`/events/${eventId}/attend/`);
    fetchEvents();
  };

  const unattend = async (eventId) => {
    await api.post(`/events/${eventId}/unattend/`);
    fetchEvents();
  };

  const isAdmin = user && hub && user.username === hub.admin;

  if (loading) return <p>Loading events…</p>;

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Events</h2>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-[#432dd7] text-white rounded hover:bg-[#3725b8] transition"
          >
            Create Event
          </button>
        )}
      </div>

      {showCreate && (
        <EventCreateModal
          hubId={hubId}
          onClose={() => setShowCreate(false)}
          onCreated={fetchEvents}
        />
      )}

      {events.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        events.map((event) => (
          <div
            key={event.id}
            className="border border-gray-300 rounded p-4 mb-3 shadow-sm"
          >
            <h3 className="font-semibold text-lg">{event.title}</h3>
            <p className="text-gray-700">{event.description}</p>
            <p className="text-sm text-gray-500">
              🕒 {new Date(event.start_time).toLocaleString()} –{" "}
              {new Date(event.end_time).toLocaleString()}
            </p>
            <strong>{event.attendees_count} attending</strong>
            <div className="mt-2">
              {event.user_attending ? (
                <button
                  onClick={() => unattend(event.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Cancel Attendance
                </button>
              ) : (
                <button
                  onClick={() => attend(event.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  Attend
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

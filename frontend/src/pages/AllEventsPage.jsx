import { useState, useEffect } from "react";
import api from "../api/axios";
import EventEditModal from "../components/EventEditModal";
import EventDetailsModal from "../components/EventDetailsModal";

const DEFAULT_IMAGE = "https://via.placeholder.com/400x200?text=No+Image";

export default function AllEventsPage({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/events/");
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCardClick = (event) => {
    // Use hub_admin_id from API
    const isAdmin = user && user.id === event.hub_admin_id;
    setSelectedEvent(event);
    setIsEditing(isAdmin);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setIsEditing(false);
  };

  if (loading) return <p className="text-center mt-10">Loading events…</p>;

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => {
        const isAdmin = user && user.id === event.hub_admin_id;

        return (
          <div
            key={event.id}
            className="bg-white shadow-lg rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl transition"
            onClick={() => handleCardClick(event)}
          >
            <img
              src={event.image_url || DEFAULT_IMAGE}
              alt={event.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-bold mb-1">{event.title}</h3>
              <p className="text-gray-600 mb-2 truncate">{event.description}</p>
              <p className="text-sm text-gray-500 mb-1">
                🕒 {new Date(event.start_time).toLocaleString()} –{" "}
                {event.end_time ? new Date(event.end_time).toLocaleString() : "N/A"}
              </p>
              <p className="text-sm text-gray-500">
                Hub: {event.hub_name} | {event.attendees_count} attending
              </p>
              {isAdmin && (
                <span className="mt-2 inline-block px-3 py-1 rounded-lg bg-[#432dd7] text-white text-sm">
                  Admin – Click to Edit
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* MODALS */}
      {selectedEvent && isEditing && (
        <EventEditModal
          event={selectedEvent}
          onClose={handleCloseModal}
          onUpdated={fetchEvents}
        />
      )}

      {selectedEvent && !isEditing && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

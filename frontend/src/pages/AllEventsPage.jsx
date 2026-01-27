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
  const [attendingStatus, setAttendingStatus] = useState({});
  const [membershipStatus, setMembershipStatus] = useState({});

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/events/");
      setEvents(res.data);

      const status = {};
      const membership = {};
      res.data.forEach(event => {
        status[event.id] = event.user_attending;
        membership[event.hub] = event.is_member ?? true; // if backend returns membership info
      });
      setAttendingStatus(status);
      setMembershipStatus(membership);
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
    const isAdmin = user && user.id === event.hub_admin_id;
    setSelectedEvent(event);
    setIsEditing(isAdmin);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setIsEditing(false);
  };

  const attendEvent = async (event) => {
    try {
      if (!membershipStatus[event.hub]) {
        await api.post(`/hubs/${event.hub}/request_join/`);
        alert("You requested to join the hub. Please wait for approval.");
        return;
      }

      const res = await api.post(`/events/${event.id}/attend/`);
      setAttendingStatus(prev => ({ ...prev, [event.id]: true }));
      setEvents(prev =>
        prev.map(ev =>
          ev.id === event.id ? { ...ev, attendees_count: res.data.attendees_count } : ev
        )
      );
    } catch (err) {
      console.error(err);
      alert("Couldn't Confirm Event attendance");
    }
  };

  const cancelAttend = async (event) => {
    try {
      const res = await api.post(`/events/${event.id}/unattend/`);
      setAttendingStatus(prev => ({ ...prev, [event.id]: false }));
      setEvents(prev =>
        prev.map(ev =>
          ev.id === event.id ? { ...ev, attendees_count: res.data.attendees_count } : ev
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to cancel attendance.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading events…</p>;
  if (!events.length) return <p className="text-center mt-10 text-gray-500">No upcoming events</p>;

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => {
        const isAdmin = user && user.id === event.hub_admin_id;
        const isAttending = attendingStatus[event.id];
        const isMember = membershipStatus[event.hub] ?? true;

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
              <p className="text-sm text-gray-500 mb-2">
                Hub: {event.hub_name} | {event.attendees_count} attending
              </p>

              {isAdmin && (
                <span className="mt-2 inline-block px-3 py-1 rounded-lg bg-[#432dd7] text-white text-sm">
                  Admin – Click to Edit
                </span>
              )}

              {!isAdmin && (
                <div className="mt-2">
                  {!isMember ? (
                    <button
                      className="px-3 py-1 rounded-lg bg-yellow-500 text-white text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        attendEvent(event);
                      }}
                    >
                      Request to Join Hub
                    </button>
                  ) : isAttending ? (
                    <button
                      className="px-3 py-1 rounded-lg bg-red-500 text-white text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelAttend(event);
                      }}
                    >
                      Cancel Attendance
                    </button>
                  ) : (
                    <button
                      className="px-3 py-1 rounded-lg bg-green-500 text-white text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        attendEvent(event);
                      }}
                    >
                      Attend
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

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

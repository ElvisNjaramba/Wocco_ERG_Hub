import React from "react";

const DEFAULT_IMAGE = "https://via.placeholder.com/400x200?text=No+Image";

export default function EventDetailsModal({ event, onClose }) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-xl overflow-hidden transform transition-transform duration-300 scale-100">
        {/* Event Image */}
        <img
          src={event.image_url || DEFAULT_IMAGE}
          alt={event.title}
          className="w-full h-48 object-cover"
        />

        {/* Event Info */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-[#432dd7]">{event.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 font-bold text-xl"
            >
              &times;
            </button>
          </div>

          <p className="text-gray-700">{event.description}</p>

          <div className="flex flex-col sm:flex-row sm:justify-between text-gray-600 text-sm sm:text-base gap-2">
            <p><strong>Hub:</strong> {event.hub_name}</p>
            <p><strong>Location:</strong> {event.location || "Not specified"}</p>
            <p><strong>Start:</strong> {new Date(event.start_time).toLocaleString()}</p>
            <p><strong>End:</strong> {event.end_time ? new Date(event.end_time).toLocaleString() : "Not specified"}</p>
            <p><strong>Attendees:</strong> {event.attendees_count}</p>
          </div>

          {event.attendees && event.attendees.length > 0 && (
            <div>
              <strong className="block mb-1">Attending Users:</strong>
              <ul className="list-disc ml-5 space-y-1 text-gray-700">
                {event.attendees.map((att) => (
                  <li key={att.id}>{att.name || att.username}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#432dd7] text-white hover:bg-[#3725b8] font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

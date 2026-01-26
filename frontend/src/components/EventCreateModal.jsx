import { useState } from "react";
import api from "../api/axios";

export default function EventCreateModal({ hubId, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("start_time", startTime);
    formData.append("end_time", endTime);
    if (image) formData.append("image", image);

    try {
      await api.post(`/hubs/${hubId}/create_event/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onCreated(); // refresh events
      onClose(); // close modal
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#432dd7]">Create Event</h2>

        {error && <p className="text-red-600 mb-2">{JSON.stringify(error)}</p>}

        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
            rows={3}
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm">End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full mt-1"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#432dd7] text-white py-2 rounded hover:bg-[#3725b8] transition"
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CreateEventPage() {
  const navigate = useNavigate();

  const [hubs, setHubs] = useState([]);
  const [hubId, setHubId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load hubs the user belongs to
  useEffect(() => {
    async function fetchHubs() {
      try {
        const res = await api.get("/hubs/");
        setHubs(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load hubs");
      }
    }
    fetchHubs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hubId) {
      setError("Please select a hub");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("hub", hubId);
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


      navigate(`/hubs/${hubId}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-10">
      <h2 className="text-3xl font-bold text-[#432dd7] mb-6 text-center">
        Create Event
      </h2>

      {error && (
        <p className="text-red-600 bg-red-100 p-2 rounded mb-4">{JSON.stringify(error)}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Hub Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Hub</label>
          <select
            value={hubId}
            onChange={(e) => setHubId(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">-- Select a Hub --</option>
            {hubs.map((hub) => (
              <option key={hub.id} value={hub.id}>
                {hub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2"
            rows={4}
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium mb-1">Start Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium mb-1">End Time</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-xl bg-[#432dd7] text-white font-medium hover:bg-[#3725b8] transition"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}

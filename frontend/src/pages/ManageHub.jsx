import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function ManageHub() {
  const { hubId } = useParams();

  const [hub, setHub] = useState(null);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState([]);
  const [banHistory, setBanHistory] = useState([]);

  // Editable state for hub
  const [editedHubName, setEditedHubName] = useState("");
  const [editedHubDescription, setEditedHubDescription] = useState("");

  // Editable state for events
  const [editedEvents, setEditedEvents] = useState({}); // key = eventId

  // --- Load hub data ---
  const loadHub = async () => {
    const res = await api.get(`/hubs/${hubId}/`);
    setHub(res.data);
    setEditedHubName(res.data.name);
    setEditedHubDescription(res.data.description);
  };

  const loadMembers = async () => {
    const res = await api.get(`/hubs/${hubId}/members/`);
    setMembers(res.data);
  };

  const loadEvents = async () => {
    const res = await api.get(`/events/?hub=${hubId}`);
    setEvents(res.data);

    // Initialize editableEvents state
    const init = {};
    res.data.forEach((e) => {
      init[e.id] = {
        title: e.title,
        description: e.description,
        location: e.location,
        start_time: e.start_time,
        end_time: e.end_time,
        image: null,
      };
    });
    setEditedEvents(init);
  };

  const loadBanHistory = async () => {
    const res = await api.get(`/hubs/${hubId}/ban_history/`);
    setBanHistory(res.data);
  };

  useEffect(() => {
    loadHub();
    loadMembers();
    loadEvents();
    loadBanHistory();
  }, [hubId]);

  // --- Member actions ---
  const banMember = async (userId) => {
    if (!window.confirm("Ban this member?")) return;
    await api.post(`/hubs/${hubId}/ban_member/`, { user_id: userId });
    loadMembers();
    loadBanHistory();
  };

  // --- Hub update ---
const updateHub = async () => {
  try {
    const payload = {
      name: editedHubName,
      description: editedHubDescription,
    };
    await api.patch(`/hubs/${hubId}/update_hub/`, payload);
    alert("Hub updated successfully!");
    loadHub();
  } catch (err) {
    console.error("Failed to update hub:", err);
    alert("Failed to update hub. Please try again.");
  }
};


  // --- Event update ---
  const updateEvent = async (eventId) => {
    const e = editedEvents[eventId];
    const formData = new FormData();
    formData.append("title", e.title);
    formData.append("description", e.description);
    formData.append("location", e.location);
    formData.append("start_time", e.start_time);
    if (e.end_time) formData.append("end_time", e.end_time);
    if (e.image) formData.append("image", e.image);

    try {
      await api.patch(`/events/${eventId}/update_event/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Event updated successfully!");
      loadEvents();
    } catch (err) {
      console.error(err);
      alert("Failed to update event");
    }
  };

  // Filtered members
  const filteredMembers = members.filter((m) =>
    m.username.toLowerCase().includes(search.toLowerCase())
  );

  if (!hub) return <p>Loading hub...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* --- Hub Info --- */}
      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold text-[#432dd7]">Manage Hub</h2>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-gray-700 font-medium">Hub Name</span>
            <input
              value={editedHubName}
              onChange={(e) => setEditedHubName(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-[#432dd7] focus:border-[#432dd7]"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Description</span>
            <textarea
              value={editedHubDescription}
              onChange={(e) => setEditedHubDescription(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-[#432dd7] focus:border-[#432dd7]"
            />
          </label>

          <button
            onClick={updateHub}
            className="mt-2 rounded-xl bg-[#432dd7] text-white px-4 py-2 hover:bg-[#3725b8] transition"
          >
            Save Hub Changes
          </button>
        </div>
      </section>

      {/* --- Members --- */}
      <section className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-xl font-semibold">Members</h3>
        <input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-2 mb-4 w-full rounded-lg border-gray-300 p-2 focus:ring-[#432dd7] focus:border-[#432dd7]"
        />

        <div className="divide-y">
          {filteredMembers.map((m) => (
            <div
              key={m.user_id}
              className="flex justify-between items-center py-3"
            >
              <div>
                <p className="font-medium">{m.username}</p>
                <p className="text-sm text-gray-500">
                  Joined:{" "}
                  {m.approved_at
                    ? new Date(m.approved_at).toLocaleDateString()
                    : "Pending"}
                </p>
              </div>
              <button
                onClick={() => banMember(m.user_id)}
                className="text-sm px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
              >
                Ban
              </button>
            </div>
          ))}
          {filteredMembers.length === 0 && (
            <p className="text-gray-500 text-center py-4">No members found</p>
          )}
        </div>
      </section>

      {/* --- Events --- */}
      <section className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-xl font-semibold">Events</h3>
        <div className="divide-y mt-4 space-y-4">
          {events.map((e) => {
            const ee = editedEvents[e.id] || {};
            return (
              <div key={e.id} className="py-4 flex flex-col gap-2 border-b">
                <label className="text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  value={ee.title}
                  onChange={(ev) =>
                    setEditedEvents({
                      ...editedEvents,
                      [e.id]: { ...ee, title: ev.target.value },
                    })
                  }
                  className="w-full rounded-lg border-gray-300 p-2 focus:ring-[#432dd7] focus:border-[#432dd7]"
                />

                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={ee.description || ""}
                  onChange={(ev) =>
                    setEditedEvents({
                      ...editedEvents,
                      [e.id]: { ...ee, description: ev.target.value },
                    })
                  }
                  className="w-full rounded-lg border-gray-300 p-2 focus:ring-[#432dd7] focus:border-[#432dd7]"
                />

                <label className="text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  value={ee.location || ""}
                  onChange={(ev) =>
                    setEditedEvents({
                      ...editedEvents,
                      [e.id]: { ...ee, location: ev.target.value },
                    })
                  }
                  className="w-full rounded-lg border-gray-300 p-2 focus:ring-[#432dd7] focus:border-[#432dd7]"
                />

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={new Date(ee.start_time).toISOString().slice(0, 16)}
                      onChange={(ev) =>
                        setEditedEvents({
                          ...editedEvents,
                          [e.id]: { ...ee, start_time: ev.target.value },
                        })
                      }
                      className="w-full rounded-lg border-gray-300 p-2 focus:ring-[#432dd7] focus:border-[#432dd7]"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      value={
                        ee.end_time
                          ? new Date(ee.end_time).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(ev) =>
                        setEditedEvents({
                          ...editedEvents,
                          [e.id]: { ...ee, end_time: ev.target.value },
                        })
                      }
                      className="w-full rounded-lg border-gray-300 p-2 focus:ring-[#432dd7] focus:border-[#432dd7]"
                    />
                  </div>
                </div>

                <label className="text-sm font-medium text-gray-700 mt-2">
                  Image
                </label>
                <input
                  type="file"
                  onChange={(ev) =>
                    setEditedEvents({
                      ...editedEvents,
                      [e.id]: { ...ee, image: ev.target.files[0] },
                    })
                  }
                />

                <button
                  onClick={() => updateEvent(e.id)}
                  className="mt-2 rounded-xl bg-[#432dd7] text-white px-4 py-2 hover:bg-[#3725b8] transition"
                >
                  Save Event Changes
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- Ban History --- */}
      <section className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-xl font-semibold">Ban History</h3>
        <div className="divide-y mt-4">
          {banHistory.map((b) => (
            <div key={b.user_id} className="flex justify-between py-2">
              <span>{b.username}</span>
              <span className="text-gray-500 text-sm">
                {new Date(b.banned_at).toLocaleString()}
              </span>
            </div>
          ))}

          {banHistory.length === 0 && (
            <p className="text-gray-500 text-center py-4">No bans yet</p>
          )}
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import HubEvents from "./HubEvents";

export default function HubDetails() {
  const { hubId } = useParams();
  const navigate = useNavigate();

  const [hub, setHub] = useState(null);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState(null); // ⬅️ NOTHING open by default

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.get("/me/");
        setUser(me.data);
        localStorage.setItem("user", JSON.stringify(me.data));

        const hubRes = await api.get(`/hubs/${hubId}/`);
        setHub(hubRes.data);
      } catch {
        navigate("/hubs/list");
      }
    };

    load();
  }, [hubId, navigate]);

  if (!hub || !user) {
    return (
      <div className="p-6 text-gray-600">Loading hub…</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* ---------- HUB HEADER ---------- */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-3xl font-bold text-[#432dd7]">
          {hub.name}
        </h1>

        <p className="text-gray-700 mt-2">
          {hub.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-6 text-sm text-gray-600">
          <p>
            <strong>Admin:</strong> {hub.admin}
          </p>

          {hub.members && (
            <p>
              <strong>Members:</strong> {hub.members.length}
            </p>
          )}
        </div>
      </div>

      {/* ---------- ACTION BUTTONS ---------- */}
<div className="flex gap-3 mt-6 mb-4">
  <button
    onClick={() => navigate(`/hubs/${hubId}/chat`)}
    className="px-4 py-2 rounded-xl bg-[#432dd7] text-white hover:bg-[#3725b8]"
  >
    Open Chat
  </button>

  <button
    onClick={() => setTab("events")}
    className={`px-4 py-2 rounded-xl transition ${
      tab === "events"
        ? "bg-[#432dd7] text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    Events
  </button>
</div>

{/* ---------- CONTENT ---------- */}
{!tab && (
  <div className="bg-white rounded-2xl shadow p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-2">
      About this hub
    </h3>

    <p className="text-gray-700 leading-relaxed">
      {hub.description || "No description provided for this hub."}
    </p>
  </div>
)}


{tab === "events" && (
  <HubEvents
    hubId={hubId}
    hub={hub}
    user={user}
  />
)}


    </div>
  );
}

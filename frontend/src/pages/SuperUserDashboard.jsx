import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import CircularGallery from "../components/CircularGallery";
import { HubsTable } from "../components/HubsTable";
import { EventsTable } from "../components/EventsTable";
import "../assets/superuser.css";

export default function SuperUserDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    hubs: 0,
    events: 0,
    users: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch hubs and events
        const hubsRes = await api.get("/hubs/gallery_hubs/");
        const hubs = hubsRes.data;
        const allEvents = [];
        let totalEvents = 0;

        for (const hub of hubs) {
          const res = await api.get(`/hubs/${hub.id}/upcoming_events/`);
          totalEvents += res.data.length;
          res.data.slice(0, 5).forEach((e) => {
            allEvents.push({
              image: e.image_url || "https://picsum.photos/800/600",
              title: e.title,
              hubName: hub.name,
              hubId: hub.id,
              eventId: e.id,
              startTime: e.start_time,
              membershipStatus: e.membership_status ?? null,
            });
          });
        }

        // Fetch users
        const usersRes = await api.get("/users/");
        setStats({
          hubs: hubs.length,
          events: totalEvents,
          users: usersRes.data.length,
        });

        setEvents(allEvents);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold">Superuser Dashboard</h1>
        <p className="text-lg">Manage all hubs, events, and users effortlessly</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition">
          <h2 className="text-gray-500">Total Hubs</h2>
          <p className="text-2xl font-bold text-purple-700">{stats.hubs}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition">
          <h2 className="text-gray-500">Total Events</h2>
          <p className="text-2xl font-bold text-indigo-700">{stats.events}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition">
          <h2 className="text-gray-500">Total Users</h2>
          <p className="text-2xl font-bold text-purple-500">{stats.users}</p>
        </div>
      </div>

      {/* Admin Controls */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: "Create Hub", action: () => navigate("/hubs/create"), color: "bg-purple-600" },
          { label: "Create Event", action: () => navigate("/events/create"), color: "bg-indigo-600" },
          { label: "Pending Requests", action: () => navigate("/hubs/requests"), color: "bg-green-600" },
          { label: "Banned Members", action: () => navigate("/hubs/bans"), color: "bg-red-600" },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            className={`${btn.color} text-white px-6 py-3 rounded-xl shadow hover:scale-105 transition`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Upcoming Events Carousel */}
      <div>
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">Upcoming Events</h2>
        {loading ? (
          <p>Loading events…</p>
        ) : events.length === 0 ? (
          <p>No upcoming events</p>
        ) : (
          <div className="dashboard-gallery w-full" style={{ height: 320 }}>
            <CircularGallery
              items={events}
              bend={3}
              borderRadius={0.05}
              onItemClick={(item) =>
                navigate(`/hubs/${item.hubId}?tab=events&event=${item.eventId}`)
              }
            />
          </div>
        )}
      </div>

      {/* Tables */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition">
          <h2 className="text-xl font-semibold mb-4 text-purple-700">Hubs Overview</h2>
          <HubsTable />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition">
          <h2 className="text-xl font-semibold mb-4 text-indigo-700">Events Overview</h2>
          <EventsTable />
        </div>
      </div>
    </div>
  );
}

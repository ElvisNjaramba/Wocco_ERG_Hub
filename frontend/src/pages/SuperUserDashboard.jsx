import { useState, useEffect } from "react";
import api from "../api/axios";
import CircularGallery from "../components/CircularGallery";
import { HubsTable } from "../components/HubsTable";
import { EventsTable } from "../components/EventsTable";
import "../assets/superuser.css";

export default function SuperUserDashboard() {
  const [hubEvents, setHubEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHubEvents = async () => {
      try {
        setLoading(true);

        // 1️⃣ Fetch all hubs
        const hubsRes = await api.get("/hubs/");
        const hubs = hubsRes.data;

        const eventsData = [];

        // 2️⃣ Fetch upcoming events for each hub
        for (const hub of hubs) {
          const res = await api.get(`/hubs/${hub.id}/upcoming_events/`);
          const now = new Date();
          const upcoming = res.data
            .slice(0, 5)
            .map((e) => ({
              id: e.id,
              title: e.title,
              image: e.image_url || "https://picsum.photos/800/600",
              start_time: e.start_time,
            }));


          if (upcoming.length > 0) {
            eventsData.push({
              hubName: hub.name,
              hubId: hub.id,
              events: upcoming,
            });
          }
        }

        setHubEvents(eventsData);
      } catch (err) {
        console.error("Failed to fetch hub events", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHubEvents();
  }, []);

  return (
    <div className="dashboard space-y-8 p-6">
      {/* ---------- Upcoming Events by Hub ---------- */}
      {loading ? (
        <p>Loading upcoming events…</p>
      ) : hubEvents.length === 0 ? (
        <p>No upcoming events</p>
      ) : (
        hubEvents.map((hub) => (
          <div key={hub.hubId} className="space-y-4">
            <h3 className="text-xl font-semibold text-[#432dd7]">{hub.hubName} Upcoming Events</h3>
            <div
              className="dashboard-gallery w-full"
              style={{ height: "300px" }}
            >
              <CircularGallery
                items={hub.events.map((e) => ({
                  image: e.image,
                  text: e.title,
                }))}
                bend={3}
                textColor="#fff"
                borderRadius={0.05}
              />
            </div>
          </div>
        ))
      )}

      {/* ---------- Tables ---------- */}
      <div className="space-y-6">
        <HubsTable />
        <EventsTable />
      </div>
    </div>
  );
}

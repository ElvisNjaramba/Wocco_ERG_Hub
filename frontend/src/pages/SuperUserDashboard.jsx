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


  const navigate = useNavigate();

useEffect(() => {
  const fetchEvents = async () => {
    try {
      setLoading(true);

      const hubsRes = await api.get("/hubs/gallery_hubs/");
      const hubs = hubsRes.data;

      const allEvents = [];

      for (const hub of hubs) {
        const res = await api.get(`/hubs/${hub.id}/upcoming_events/`);

        res.data.slice(0, 5).forEach(e => {
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

      setEvents(allEvents);
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  fetchEvents();
}, []);


  return (
<div className="dashboard space-y-8 p-6">
  <h2 className="text-2xl font-semibold text-[#432dd7]">
    All Upcoming Events
  </h2>

  {loading ? (
    <p>Loading events…</p>
  ) : events.length === 0 ? (
    <p>No upcoming events</p>
  ) : (
    <div className="dashboard-gallery w-full" style={{ height: 300 }}>
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

  {/* tables stay unchanged */}
  <div className="space-y-6">
    <HubsTable />
    <EventsTable />
  </div>
</div>

  );
}

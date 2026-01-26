import { useEffect, useState } from "react";
import api from "../api/axios";
import CircularGallery from "../components/CircularGallery";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
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
              text: e.title,
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
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Upcoming Events</h1>

      {loading ? (
        <p>Loading events…</p>
      ) : events.length === 0 ? (
        <p>No upcoming events</p>
      ) : (
        <div style={{ height: 300 }}>
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
  );
}

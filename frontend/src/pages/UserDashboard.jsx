import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo-animation.gif";
import CardCarousel from "../components/CardCarousel";

export default function UserDashboard() {
  const [hubs, setHubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [meRes, hubsRes, eventsRes] = await Promise.all([
          api.get("/me/"),
          api.get("/hubs/gallery_hubs/"),
          api.get("/events/upcoming/"),
        ]);

        setMe(meRes.data);
        setHubs(hubsRes.data || []);
        setEvents(eventsRes.data || []);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const firstName =
    me?.first_name || me?.full_name?.split(" ")[0] || me?.username || "";

  const now = new Date();

  /* -------------------- DERIVED DATA -------------------- */

    const approvedHubIds = useMemo(() => {
  return new Set(
    hubs.filter(h => h.membership_status === "approved").map(h => h.id)
  );
}, [hubs]);

const normalizedEvents = useMemo(() => {
  const seen = new Set();

  return events
    .filter(event => {
      const eventEnd = new Date(event.end_time || event.start_time);
      // Only future events AND from approved hubs
      return eventEnd >= now && approvedHubIds.has(event.hub?.id || event.hub);
    })
    .filter(event => {
      // Remove duplicates
      if (seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    })
    .map(event => ({
      ...event,
      hubName: event.hub_name || event.hub?.name,
      image: event.image_url || "https://picsum.photos/600/400",
    }));
}, [events, approvedHubIds, now]);

  // Events this month
const eventsThisMonth = useMemo(() => {
  return normalizedEvents.filter(event => {
    const d = new Date(event.start_time);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}, [normalizedEvents, now]);

  // Membership map
  const membershipStatus = useMemo(() => {
    const map = {};
    hubs.forEach(h => {
      map[h.id] = h.membership_status === "approved";
    });
    return map;
  }, [hubs]);

  // Attending map
  const attendingStatus = useMemo(() => {
    const map = {};
    events.forEach(e => {
      if (e.is_attending !== undefined) map[e.id] = e.is_attending;
    });
    return map;
  }, [events]);

  const notificationsCount = 0; // placeholder



  /* -------------------- UI -------------------- */

  if (loading) {
    return <div className="p-8 text-gray-500">Loading your dashboard…</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {firstName} 👋</h1>
          <p className="text-indigo-100 mt-1">
            Connect, learn, and grow through Wocco’s Employee Resource Groups
          </p>
        </div>

        <button
          onClick={() => navigate("/hubs/list")}
          className="px-4 py-2 rounded-lg bg-white text-indigo-600 text-sm font-medium hover:bg-indigo-50"
        >
          Explore Hubs
        </button>
      </div>

      {/* About */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 border rounded-xl p-6">
        <div>
          <h2 className="text-xl font-bold mb-3">About Wocco</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            At Wocco, we believe strong communities build stronger companies.
            Employee Resource Groups (ERGs) are employee-led spaces designed
            to foster inclusion, shared identity, learning, and growth.
          </p>
        </div>

        <div className="h-48 rounded-lg overflow-hidden shadow">
          <img
            src={Logo}
            alt="Wocco community"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat label="Hubs Joined" value={hubs.length} icon="🏘️" />
<Stat label="Upcoming Events" value={normalizedEvents.length} icon="📅" />
<Stat label="This Month" value={eventsThisMonth.length} icon="⭐" />

        <Stat label="Notifications" value={notificationsCount} icon="🔔" />
      </section>

      {/* Upcoming Events */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>

        {normalizedEvents.length === 0 ? (
          <p className="text-gray-500">No upcoming events from your hubs.</p>
        ) : (
          <CardCarousel
            items={normalizedEvents.slice(0, 6)}
            attendingStatus={attendingStatus}
            membershipStatus={membershipStatus}
            onAttend={(event) => console.log("Attend", event.id)}
            onCancel={(event) => console.log("Cancel", event.id)}
            onItemClick={(event) =>
              navigate(`/hubs/${event.hub}?tab=events&event=${event.id}`)
            }
          />
        )}
      </section>

      {/* Hubs */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Your ERG Hubs</h2>

        {hubs.length === 0 ? (
          <p className="text-gray-500">You haven’t joined any hubs yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hubs.map((hub) => (
              <div
                key={hub.id}
                className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition"
              >
                <div
                  className="h-36 bg-gray-200"
                  style={{
                    backgroundImage: `url(${hub.image_url || "https://picsum.photos/600/400"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                <div className="p-4">
                  <div className="font-semibold">{hub.name}</div>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {hub.description || "Employee Resource Group"}
                  </p>

                  <div className="flex justify-between mt-3">
                    <button
                      onClick={() => navigate(`/hubs/${hub.id}`)}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Open Hub
                    </button>

                    {hub.admin === me?.username && (
                      <button
                        onClick={() => navigate(`/manage-hubs/${hub.id}`)}
                        className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700"
                      >
                        Manage
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* -------------------- SMALL COMPONENT -------------------- */

function Stat({ label, value, icon }) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-center gap-4 hover:shadow-md transition">
      <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-xl">
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
    </div>
  );
}

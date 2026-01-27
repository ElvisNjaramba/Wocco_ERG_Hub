import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo-animation.gif";


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

        const meRes = await api.get("/me/");
        setMe(meRes.data);

        const hubsRes = await api.get("/hubs/gallery_hubs/");
        setHubs(hubsRes.data);

        const eventsRes = await api.get("/hubs/my_events/");
        const flatEvents = eventsRes.data.flatMap(h =>
          h.events.map(e => ({
            ...e,
            hub_id: h.hub_id,
            hub_name: h.hub_name,
          }))
        );
        setEvents(flatEvents);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading your dashboard…</div>;
  }

const firstName =
  me?.first_name ||
  me?.full_name?.split(" ")[0] ||
  me?.username ||
  "";

const now = new Date();

const upcomingEventsCount = events.filter(
  e => new Date(e.start_time) > now
).length;

// Placeholder until notifications API exists
const notificationsCount = 0;


  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-indigo-100 mt-1">
            Connect, learn, and grow through Wocco’s Employee Resource Groups
          </p>
        </div>

        <button
          onClick={() => navigate("/hubs/list")}
          className="self-start sm:self-auto px-4 py-2 rounded-lg bg-white text-indigo-600 text-sm font-medium hover:bg-indigo-50"
        >
          Explore Hubs
        </button>
      </div>

<section
  style={{
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 24,
    alignItems: "center",
    marginTop: 40,
    padding: 24,
    borderRadius: 16,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  }}
>
  {/* Text */}
  <div>
    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
      About Wocco
    </h2>

    <p style={{ fontSize: 14, lineHeight: 1.6, color: "#374151" }}>
      At Wocco, we believe strong communities build stronger companies.
      Our Employee Resource Groups (ERGs) are employee-led spaces designed
      to foster inclusion, shared identity, learning, and growth.
    </p>

    <p style={{ fontSize: 14, lineHeight: 1.6, color: "#374151", marginTop: 8 }}>
      This hub exists to help you connect, participate in events, and
      contribute to communities that matter to you — openly, safely,
      and collaboratively.
    </p>
  </div>

  {/* Image */}
  <div
    style={{
      width: "100%",
      height: 200,
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 10px 20px rgba(0,0,0,.08)",
    }}
  >
    <img
      src={Logo}
      alt="Wocco ERG community"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  </div>
</section>


{/* Dashboard Summary */}
<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Hubs Joined */}
  <div className="bg-white rounded-xl border p-5 flex items-center gap-4 hover:shadow-md transition">
    <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl">
      🏘️
    </div>
    <div>
      <div className="text-sm text-gray-500">Hubs Joined</div>
      <div className="text-2xl font-semibold text-gray-900">
        {hubs.length}
      </div>
    </div>
  </div>

  {/* Upcoming Events */}
  <div className="bg-white rounded-xl border p-5 flex items-center gap-4 hover:shadow-md transition">
    <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-xl">
      📅
    </div>
    <div>
      <div className="text-sm text-gray-500">Upcoming Events</div>
      <div className="text-2xl font-semibold text-gray-900">
        {upcomingEventsCount}
      </div>
    </div>
  </div>

  {/* Events This Month */}
  <div className="bg-white rounded-xl border p-5 flex items-center gap-4 hover:shadow-md transition">
    <div className="h-12 w-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 text-xl">
      ⭐
    </div>
    <div>
      <div className="text-sm text-gray-500">This Month</div>
      <div className="text-2xl font-semibold text-gray-900">
        {
          events.filter(e => {
            const d = new Date(e.start_time);
            return (
              d.getMonth() === now.getMonth() &&
              d.getFullYear() === now.getFullYear()
            );
          }).length
        }
      </div>
    </div>
  </div>

  {/* Notifications */}
  <div className="bg-white rounded-xl border p-5 flex items-center gap-4 hover:shadow-md transition">
    <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 text-xl">
      🔔
    </div>
    <div>
      <div className="text-sm text-gray-500">Notifications</div>
      <div className="text-2xl font-semibold text-gray-900">
        {notificationsCount}
      </div>
    </div>
  </div>
</section>


      {/* Hubs */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Your ERG Hubs</h2>
        {hubs.length === 0 ? (
          <p className="text-gray-500">You haven’t joined any hubs yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hubs.map(hub => (
              <div
                key={hub.id}
                className="bg-white rounded-xl overflow-hidden border hover:shadow-lg transition"
              >
                <div
                  className="h-36 bg-gray-200"
                  style={{
                    backgroundImage: `url(${hub.image_url || "https://picsum.photos/600/400"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                <div className="p-4 space-y-2">
                  <div className="font-semibold text-gray-900">{hub.name}</div>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {hub.description || "Employee Resource Group"}
                  </p>

                  <div className="flex items-center justify-between pt-3">
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

      {/* Events */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
        {events.length === 0 ? (
          <p className="text-gray-500">No upcoming events from your hubs.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 6).map(event => (
              <div
                key={event.id}
                onClick={() => navigate(`/hubs/${event.hub_id}?tab=events&event=${event.id}`)}
                className="cursor-pointer bg-white rounded-xl overflow-hidden border hover:shadow-lg transition"
              >
                <div
                  className="h-36 bg-gray-200"
                  style={{
                    backgroundImage: `url(${event.image_url || "https://picsum.photos/600/400"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                <div className="p-4 space-y-1">
                  <div className="text-sm text-indigo-600 font-medium">
                    {event.hub_name}
                  </div>
                  <div className="font-semibold text-gray-900">
                    {event.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(event.start_time).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* About Wocco */}

    </div>
  );
}

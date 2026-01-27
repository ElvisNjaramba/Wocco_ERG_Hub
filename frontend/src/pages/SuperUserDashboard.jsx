// // SuperUserDashboard.jsx
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api/axios";
// import { HubsTable } from "../components/HubsTable";
// import { EventsTable } from "../components/EventsTable";
// import "../assets/superuser.css";

// const DEFAULT_IMAGE = "https://via.placeholder.com/400x200?text=No+Image";

// export default function SuperUserDashboard() {
//   const navigate = useNavigate();

//   const [events, setEvents] = useState([]);
//   const [attendingStatus, setAttendingStatus] = useState({});
//   const [membershipStatus, setMembershipStatus] = useState({});
//   const [loading, setLoading] = useState(true);

//   const [stats, setStats] = useState({
//     hubs: 0,
//     events: 0,
//     users: 0,
//   });

//   /* ================================
//      FETCH DASHBOARD DATA
//   ================================= */
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         setLoading(true);

//         // ---- Fetch hubs
//         const hubsRes = await api.get("/hubs/gallery_hubs/");
//         const hubs = hubsRes.data;

//         // ---- Collect upcoming events
//         const collectedEvents = [];
//         let totalEvents = 0;

//         for (const hub of hubs) {
//           const res = await api.get(`/hubs/${hub.id}/upcoming_events/`);
//           totalEvents += res.data.length;

//           res.data.forEach((event) => {
//             collectedEvents.push({
//               ...event,          // keep backend shape
//               hub: hub.id,       // ensure hub id exists
//               hub_name: hub.name // optional display
//             });
//           });
//         }

//         // ---- Fetch users count
//         const usersRes = await api.get("/users/");

//         // ---- Build attendance & membership maps
//         const attending = {};
//         const membership = {};

//         collectedEvents.forEach((event) => {
//           attending[event.id] = event.user_attending ?? false;
//           membership[event.hub] = event.is_member ?? true;
//         });

//         setEvents(collectedEvents);
//         setAttendingStatus(attending);
//         setMembershipStatus(membership);

//         setStats({
//           hubs: hubs.length,
//           events: totalEvents,
//           users: usersRes.data.length,
//         });
//       } catch (err) {
//         console.error("Dashboard fetch failed:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   /* ================================
//      ATTEND EVENT
//   ================================= */
//   const attendEvent = async (event) => {
//     try {
//       if (!membershipStatus[event.hub]) {
//         await api.post(`/hubs/${event.hub}/request_join/`);
//         alert("You requested to join the hub. Await approval.");
//         return;
//       }

//       const res = await api.post(`/events/${event.id}/attend/`);

//       setAttendingStatus((prev) => ({
//         ...prev,
//         [event.id]: true,
//       }));

//       setEvents((prev) =>
//         prev.map((ev) =>
//           ev.id === event.id
//             ? { ...ev, attendees_count: res.data.attendees_count }
//             : ev
//         )
//       );
//     } catch (err) {
//       console.error(err);
//       alert("Failed to attend event");
//     }
//   };

//   /* ================================
//      CANCEL ATTENDANCE
//   ================================= */
//   const cancelAttend = async (event) => {
//     try {
//       const res = await api.post(`/events/${event.id}/unattend/`);

//       setAttendingStatus((prev) => ({
//         ...prev,
//         [event.id]: false,
//       }));

//       setEvents((prev) =>
//         prev.map((ev) =>
//           ev.id === event.id
//             ? { ...ev, attendees_count: res.data.attendees_count }
//             : ev
//         )
//       );
//     } catch (err) {
//       console.error(err);
//       alert("Failed to cancel attendance");
//     }
//   };

//   /* ================================
//      RENDER
//   ================================= */
//   return (
//     <div className="p-6 space-y-8">

//       {/* Header */}
//       <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl">
//         <h1 className="text-3xl font-bold">Superuser Dashboard</h1>
//         <p>Manage hubs, events, and users</p>
//       </div>

//       {/* Stats */}
//       <div className="grid sm:grid-cols-3 gap-6">
//         <Stat label="Total Hubs" value={stats.hubs} />
//         <Stat label="Total Events" value={stats.events} />
//         <Stat label="Total Users" value={stats.users} />
//       </div>

//       {/* Admin Controls */}
//       <div className="flex flex-wrap gap-4">
//         {[
//           { label: "Create Hub", action: () => navigate("/hubs/create"), color: "bg-purple-600" },
//           { label: "Create Event", action: () => navigate("/events/create"), color: "bg-indigo-600" },
//           { label: "Create Admin", action: () => navigate("/register/superuser"), color: "bg-green-600" },
//           { label: "Upload Users", action: () => navigate("/superuser/users/create"), color: "bg-red-600" },
//           { label: "Create User", action: () => navigate("/superuser/users/upload"), color: "bg-red-600" },
//         ].map((btn) => (
//           <button
//             key={btn.label}
//             onClick={btn.action}
//             className={`${btn.color} text-white px-6 py-3 rounded-xl shadow hover:scale-105 transition`}
//           >
//             {btn.label}
//           </button>
//         ))}
//       </div>

//       {/* Upcoming Events */}
//       <div className="mt-10">
//         <h2 className="text-2xl font-semibold text-purple-700 mb-4">
//           Upcoming Events
//         </h2>

//         {loading ? (
//           <p>Loading events…</p>
//         ) : events.length === 0 ? (
//           <p className="text-gray-500">No upcoming events</p>
//         ) : (
//           <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
//             {events.map((event) => {
//               const isAttending = attendingStatus[event.id];
//               const isMember = membershipStatus[event.hub];

//               return (
//                 <div
//                   key={event.id}
//                   onClick={() =>
//                     navigate(`/hubs/${event.hub}?tab=events&event=${event.id}`)
//                   }
//                   className="min-w-[320px] max-w-[320px] bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
//                 >
//                   <img
//                     src={event.image_url || DEFAULT_IMAGE}
//                     alt={event.title}
//                     onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
//                     className="w-full h-40 object-cover"
//                   />

//                   <div className="p-4">
//                     <h3 className="text-lg font-bold truncate">
//                       {event.title}
//                     </h3>

//                     <p className="text-gray-600 text-sm line-clamp-2 mb-2">
//                       {event.description}
//                     </p>

//                     <p className="text-xs text-gray-500 mb-1">
//                       🕒 {new Date(event.start_time).toLocaleString()}
//                     </p>

//                     <p className="text-xs text-gray-500 mb-2">
//                       {event.attendees_count} attending
//                     </p>

//                     {/* Actions */}
//                     {!isMember ? (
//                       <button
//                         className="w-full bg-yellow-500 text-white py-2 rounded-lg text-sm"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           attendEvent(event);
//                         }}
//                       >
//                         Request to Join Hub
//                       </button>
//                     ) : isAttending ? (
//                       <button
//                         className="w-full bg-red-500 text-white py-2 rounded-lg text-sm"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           cancelAttend(event);
//                         }}
//                       >
//                         Cancel Attendance
//                       </button>
//                     ) : (
//                       <button
//                         className="w-full bg-green-600 text-white py-2 rounded-lg text-sm"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           attendEvent(event);
//                         }}
//                       >
//                         Attend
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Tables */}
//       <div className="space-y-6">
//         <HubsTable />
//         <EventsTable />
//       </div>
//     </div>
//   );
// }

// /* ================================
//    STAT COMPONENT
// ================================= */
// const Stat = ({ label, value }) => (
//   <div className="bg-white p-6 rounded-xl shadow">
//     <h2 className="text-gray-500">{label}</h2>
//     <p className="text-2xl font-bold">{value}</p>
//   </div>
// );


// SuperUserDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import CardCarousel from "../components/CardCarousel";
import { HubsTable } from "../components/HubsTable";
import { EventsTable } from "../components/EventsTable";
import "../assets/superuser.css";

const DEFAULT_IMAGE = "https://via.placeholder.com/400x200?text=No+Image";

export default function SuperUserDashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [attendingStatus, setAttendingStatus] = useState({});
  const [membershipStatus, setMembershipStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ hubs: 0, events: 0, users: 0 });

  /* ================================
     FETCH DASHBOARD DATA
  ================================= */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const hubsRes = await api.get("/hubs/gallery_hubs/");
        const hubs = hubsRes.data;

        const collectedEvents = [];
        let totalEvents = 0;

        for (const hub of hubs) {
          const res = await api.get(`/hubs/${hub.id}/upcoming_events/`);
          totalEvents += res.data.length;

          res.data.forEach((event) => {
            collectedEvents.push({
              ...event,
              hub: hub.id,
              hubName: hub.name,
              eventId: event.id,
              image: event.image_url || DEFAULT_IMAGE,
            });
          });
        }

        const usersRes = await api.get("/users/");

        const attending = {};
        const membership = {};

        collectedEvents.forEach((event) => {
          attending[event.id] = event.user_attending ?? false;
          membership[event.hub] = event.is_member ?? true;
        });

        setEvents(collectedEvents);
        setAttendingStatus(attending);
        setMembershipStatus(membership);
        setStats({ hubs: hubs.length, events: totalEvents, users: usersRes.data.length });
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /* ================================
     ATTEND / CANCEL ATTEND
  ================================= */
  const attendEvent = async (event) => {
    try {
      if (!membershipStatus[event.hub]) {
        await api.post(`/hubs/${event.hub}/request_join/`);
        alert("Requested to join hub.");
        return;
      }
      const res = await api.post(`/events/${event.id}/attend/`);
      setAttendingStatus((prev) => ({ ...prev, [event.id]: true }));
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === event.id ? { ...ev, attendees_count: res.data.attendees_count } : ev
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to attend event");
    }
  };

  const cancelAttend = async (event) => {
    try {
      const res = await api.post(`/events/${event.id}/unattend/`);
      setAttendingStatus((prev) => ({ ...prev, [event.id]: false }));
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === event.id ? { ...ev, attendees_count: res.data.attendees_count } : ev
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to cancel attendance");
    }
  };

  /* ================================
     RENDER
  ================================= */
  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl">
        <h1 className="text-3xl font-bold">Superuser Dashboard</h1>
        <p>Manage hubs, events, and users</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        <Stat label="Total Hubs" value={stats.hubs} />
        <Stat label="Total Events" value={stats.events} />
        <Stat label="Total Users" value={stats.users} />
      </div>

      {/* Admin Controls */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: "Create Hub", action: () => navigate("/hubs/create"), color: "bg-purple-600" },
          { label: "Create Event", action: () => navigate("/events/create"), color: "bg-indigo-600" },
          { label: "Create Admin", action: () => navigate("/register/superuser"), color: "bg-green-600" },
          { label: "Upload Users", action: () => navigate("/superuser/users/create"), color: "bg-red-600" },
          { label: "Create User", action: () => navigate("/superuser/users/upload"), color: "bg-red-600" },
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
      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">Upcoming Events</h2>

        {loading ? (
          <p>Loading events…</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500">No upcoming events</p>
        ) : (
          <div className="overflow-x-auto scrollbar-hide">
            <CardCarousel
              items={events}
              onItemClick={(event) => navigate(`/hubs/${event.hub}?tab=events&event=${event.id}`)}
            />
          </div>
        )}
      </div>

      {/* Tables */}
      <div className="space-y-6">
        <HubsTable />
        <EventsTable />
      </div>
    </div>
  );
}

/* ================================
   STAT COMPONENT
================================= */
const Stat = ({ label, value }) => (
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="text-gray-500">{label}</h2>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

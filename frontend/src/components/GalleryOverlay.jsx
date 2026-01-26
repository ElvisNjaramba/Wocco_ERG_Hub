import api from "../api/axios";

export default function GalleryOverlay({ item }) {
  const start = new Date(item.startTime).toLocaleString();

  const handleJoin = async () => {
    if (item.membershipStatus !== "approved") {
      await api.post(`/hubs/${item.hubId}/request_join/`);
      alert("Hub join request sent");
      return;
    }

    await api.post(`/events/${item.eventId}/attend/`);
    alert("You are attending this event");
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-xl bg-black/70 backdrop-blur-md text-white p-4 rounded-xl">
      <p className="text-sm opacity-80">{item.hubName}</p>

      <h3 className="text-lg font-semibold">{item.title}</h3>

      <p className="text-sm mt-1">
        🗓 {start}
      </p>

      <button
        onClick={handleJoin}
        className="mt-3 w-full bg-[#432dd7] hover:bg-[#2f1fb8] transition text-white py-2 rounded-lg"
      >
        {item.membershipStatus === "approved"
          ? "Join Event"
          : "Request Hub Access"}
      </button>
    </div>
  );
}

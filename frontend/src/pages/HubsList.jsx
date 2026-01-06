import { useEffect, useState } from "react";
import api from "../api/axios";

export default function HubsList({ user }) {
  const [hubs, setHubs] = useState([]);

  const fetchHubs = async () => {
    const res = await api.get("/hubs/");
    setHubs(res.data);
  };

  const requestJoin = async (hubId) => {
    await api.post(`/hubs/${hubId}/request_join/`);
    alert("Join request sent");
  };

  useEffect(() => {
    fetchHubs();
  }, []);

  return (
    <div>
      <h2>Community Hubs</h2>
      {hubs.map((hub) => (
        <div key={hub.id} style={{ border: "1px solid gray", margin: 5, padding: 5 }}>
          <h3>{hub.name}</h3>
          <p>{hub.description}</p>
          {hub.admin === user.username ? (
            <span>Admin</span>
          ) : (
            <button onClick={() => requestJoin(hub.id)}>Request to Join</button>
          )}
        </div>
      ))}
    </div>
  );
}

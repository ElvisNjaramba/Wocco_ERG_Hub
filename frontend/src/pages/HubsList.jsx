import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function HubsList() {
  const [hubs, setHubs] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const loadData = async () => {
    const me = await api.get("/me/");
    const hubsRes = await api.get("/hubs/");
    setUser(me.data);
    setHubs(hubsRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const requestJoin = async (hubId) => {
    await api.post(`/hubs/${hubId}/request_join/`);
    await loadData(); // refresh hub status
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>Community Hubs</h2>

      {hubs.map((hub) => (
        <div
          key={hub.id}
          style={{ border: "1px solid gray", margin: 5, padding: 5 }}
        >
          <h3>{hub.name}</h3>
          <p>{hub.description}</p>

          {/* ADMIN */}
          {hub.admin === user.username && (
            <strong>Admin</strong>
          )}

          {/* NOT A MEMBER */}
          {!hub.membership_status && hub.admin !== user.username && (
            <button onClick={() => requestJoin(hub.id)}>
              Request to Join
            </button>
          )}

          {/* PENDING */}
          {hub.membership_status === "pending" && (
            <button disabled>Pending</button>
          )}

          {/* APPROVED */}
          {hub.membership_status === "approved" && (
            <button onClick={() => navigate(`/hubs/${hub.id}`)}>
              Enter Hub
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

import { useEffect, useState } from "react";
import api from "../api/axios";

export default function HubRequests({ hubId }) {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const res = await api.get("/hub-memberships/"); // backend returns memberships for this hub
    const pending = res.data.filter((r) => r.hub.id === hubId && !r.is_approved);
    setRequests(pending);
  };

  const approveUser = async (userId) => {
    await api.post(`/hubs/${hubId}/approve_member/`, { user_id: userId });
    alert("User approved");
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div>
      <h2>Pending Join Requests</h2>
      {requests.map((r) => (
        <div key={r.id}>
          <span>{r.user}</span>
          <button onClick={() => approveUser(r.user_id)}>Approve</button>
        </div>
      ))}
    </div>
  );
}

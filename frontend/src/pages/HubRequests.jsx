import { useEffect, useState } from "react";
import api from "../api/axios";

export default function HubRequests({ hubId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get(`/hubs/${hubId}/pending_requests/`);
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId) => {
    await api.post(`/hubs/${hubId}/approve_member/`, {
      user_id: userId,
    });
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, [hubId]);

  if (loading) return <p>Loading requests...</p>;

  if (requests.length === 0) {
    return <p>No pending requests</p>;
  }

  return (
    <div>
      <h2>Pending Join Requests</h2>

      {requests.map((r) => (
        <div key={r.id} style={{ marginBottom: 8 }}>
          <span>{r.username}</span>
          <button
            style={{ marginLeft: 10 }}
            onClick={() => approveUser(r.user_id)}
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}

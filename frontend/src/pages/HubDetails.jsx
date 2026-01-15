import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import HubChat from "./HubChat";
import HubEvents from "../components/HubEvents";


export default function HubDetails() {
  const { hubId } = useParams();
  const navigate = useNavigate();

  const [hub, setHub] = useState(null);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("chat")

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.get("/me/")
        setUser(me.data)
        localStorage.setItem("user", JSON.stringify(me.data))

        const hubRes = await api.get(`/hubs/${hubId}/`);
        setHub(hubRes.data);
      } catch {
        navigate("/hubs/list");
      }
    };

    load();
  }, [hubId]);

  if (!hub || !user) return <p>Loading...</p>;

  return (
    <>
        <h2>{hub.name}</h2>
    <p>{hub.description}</p>

    <p>
      <strong>Admin:</strong> {hub.admin}
    </p>

    {hub.members && (
      <p>
        <strong>Members:</strong> {hub.members.join(", ")}
      </p>
    )}

<div className="tabs">
  <button
    onClick={() => setTab("chat")}
    style={{ fontWeight: tab === "chat" ? "bold" : "normal" }}
  >
    Chat
  </button>

  <button
    onClick={() => setTab("events")}
    style={{ fontWeight: tab === "events" ? "bold" : "normal" }}
  >
    Events
  </button>
</div>

<hr />

{tab === "chat" && <HubChat hubId={hubId} />}
{tab === "events" && (
  <HubEvents
    hubId={hubId}
    hub={hub}
    user={user}
  />
)}



    {/* <hr />
      <h2>{hub.name}</h2>
    <HubChat hubId={hubId} /> */}
    </>
  );
}

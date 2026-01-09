import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import HubChat from "./HubChat";

export default function HubDetails() {
  const { hubId } = useParams();
  const navigate = useNavigate();

  const [hub, setHub] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.get("/me/");
        setUser(me.data);

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
      <HubChat hubId={hubId} />
    </>
  );
}

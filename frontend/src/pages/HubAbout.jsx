import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function HubAbout() {
  const { hubId } = useParams();
  const navigate = useNavigate();

  const [hub, setHub] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHub = async () => {
    try {
      const res = await api.get(`/hubs/${hubId}/`);
      setHub(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHub();
  }, []);

  const requestJoin = async () => {
    await api.post(`/hubs/${hubId}/request_join/`);
    navigate("/hubs/list");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading hub…
      </div>
    );

  if (!hub) return null;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden h-72">
        <img
          src={hub.image_url || "https://picsum.photos/1200/600"}
          alt={hub.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />

        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-4xl font-bold">{hub.name}</h1>
          <p className="text-lg opacity-90 mt-2 max-w-xl">
            {hub.tagline || "A community built for growth, learning, and impact."}
          </p>
        </div>
      </div>

      {/* Why Join */}
      <section className="grid md:grid-cols-3 gap-6">
        <Feature
          title="🤝 Community"
          desc="Connect with like-minded members who share your interests."
        />
        <Feature
          title="🎓 Events & Learning"
          desc="Exclusive workshops, meetups, and curated experiences."
        />
        <Feature
          title="🚀 Growth"
          desc="Collaborate, build projects, and unlock opportunities."
        />
      </section>

      {/* About */}
      <section className="bg-white rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-[#432dd7]">
          About this Hub
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {hub.description || "This hub is designed to bring people together around a shared mission."}
        </p>
      </section>

      {/* CTA */}
      <div className="flex justify-between items-center bg-[#432dd7] text-white rounded-3xl p-6">
        <div>
          <h3 className="text-xl font-semibold">Ready to join?</h3>
          <p className="opacity-90">
            Become part of the {hub.name} community today.
          </p>
        </div>

        {hub.membership_status === "pending" ? (
          <button
            disabled
            className="px-6 py-3 rounded-xl bg-white/30 cursor-not-allowed"
          >
            Request Pending
          </button>
        ) : (
          <button
            onClick={requestJoin}
            className="px-6 py-3 rounded-xl bg-white text-[#432dd7] font-semibold hover:scale-105 transition"
          >
            Request to Join
          </button>
        )}
      </div>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}

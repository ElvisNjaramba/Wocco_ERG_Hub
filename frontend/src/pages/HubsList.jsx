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

const handleHubClick = (hub, isAdmin) => {
  if (hub.membership_status === "approved" || isAdmin) {
    navigate(`/hubs/${hub.id}`);
  } else {
    navigate(`/hubs/${hub.id}/about`);
  }
};


  const requestJoin = async (hubId) => {
    await api.post(`/hubs/${hubId}/request_join/`);
    await loadData();
  };

  const cancelRequest = async (hubId) => {
  await api.post(`/hubs/${hubId}/cancel_request/`);
  await loadData();
};

const leaveHub = async (hubId) => {
  if (!window.confirm("Are you sure you want to leave this hub?")) return;
  await api.post(`/hubs/${hubId}/leave_hub/`);
  await loadData();
};


  if (!user)
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading hubs…
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-[#432dd7]">
          Community Hubs
        </h2>
        <p className="text-gray-500 mt-1">
          Join vibrant communities and upcoming events
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {hubs.map((hub) => {
          const isAdmin = hub.admin === user.username;

          return (
<div
  key={hub.id}
  onClick={() => handleHubClick(hub, isAdmin)}
  className="group bg-white rounded-3xl overflow-hidden
             shadow-sm hover:shadow-xl
             transition-all duration-300 cursor-pointer"
>

      
              {/* Image Header */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={hub.image_url || "https://picsum.photos/800/600"}
                  alt={hub.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  {isAdmin && (
                    <Badge color="indigo">Admin</Badge>
                  )}
                  {hub.membership_status === "pending" && (
                    <Badge color="yellow">Pending</Badge>
                  )}
                  {hub.membership_status === "approved" && !isAdmin && (
                    <Badge color="green">Member</Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-gray-900">
                  {hub.name}
                </h3>

                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                  {hub.description || "No description provided."}
                </p>


{/* Actions */}
<div className="mt-5 flex flex-col gap-2">
  {/* Not a member yet */}
  {!hub.membership_status && !isAdmin && (
    <PrimaryButton
      onClick={(e) => {
        e.stopPropagation();
        requestJoin(hub.id);
      }}
    >
      Request to Join
    </PrimaryButton>
  )}

  {/* Pending request */}
  {hub.membership_status === "pending" && !isAdmin && (
    <>
      <DisabledButton>Awaiting Approval</DisabledButton>
      <SecondaryButton
        onClick={(e) => {
          e.stopPropagation();
          cancelRequest(hub.id);
        }}
      >
        Cancel Request
      </SecondaryButton>
    </>
  )}

  {/* Approved member or admin */}
  {(hub.membership_status === "approved" || isAdmin) && (
    <>
      {/* Enter Hub button (everyone who’s a member/admin) */}
      <SecondaryButton
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/hubs/${hub.id}`);
        }}
      >
        Enter Hub →
      </SecondaryButton>

      {/* Admin sees Manage Hub, member sees Leave Hub */}
      {isAdmin ? (
        <GhostButton
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/manage-hubs/${hub.id}`);
          }}
        >
          Manage Hub
        </GhostButton>
      ) : (
        <SecondaryButton
          onClick={(e) => {
            e.stopPropagation();
            leaveHub(hub.id);
          }}
        >
          Leave Hub
        </SecondaryButton>
      )}
    </>
  )}
</div>



              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Small UI helpers ---------- */

function Badge({ children, color }) {
  const colors = {
    indigo: "bg-[#432dd7]/90 text-white",
    yellow: "bg-yellow-400/90 text-black",
    green: "bg-green-500/90 text-white",
  };

  return (
    <span
      className={`text-xs font-semibold px-3 py-1 rounded-full backdrop-blur ${colors[color]}`}
    >
      {children}
    </span>
  );
}

function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="w-full rounded-xl bg-[#432dd7] text-white py-2 text-sm font-medium hover:bg-[#3725b8] transition"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="w-full rounded-xl border border-[#432dd7] text-[#432dd7] py-2 text-sm font-medium hover:bg-[#432dd7] hover:text-white transition"
    >
      {children}
    </button>
  );
}

function GhostButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="w-full rounded-xl border border-gray-200 text-gray-700 py-2 text-sm font-medium hover:bg-gray-50 transition"
    >
      {children}
    </button>
  );
}

function DisabledButton({ children }) {
  return (
    <button
      disabled
      className="w-full rounded-xl bg-gray-100 text-gray-400 py-2 text-sm font-medium cursor-not-allowed"
    >
      {children}
    </button>
  );
}

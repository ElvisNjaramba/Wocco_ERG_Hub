import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import HubEvents from "./HubEvents";
import { 
  Users, Crown, Calendar, MessageSquare, LogOut, Settings,
  Clock, ChevronRight, CheckCircle, UserPlus, Loader2, Shield, Globe
} from "lucide-react";

export default function HubDetails() {
  const { hubId } = useParams();
  const navigate = useNavigate();

  const [hub, setHub] = useState(null);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const heroImages = [
  hub?.image_url,
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2070&auto=format&fit=crop",
].filter(Boolean);

const [heroIndex, setHeroIndex] = useState(0);


  useEffect(() => {
    const loadHub = async () => {
      try {
        const me = await api.get("/me/");
        setUser(me.data);

        const hubRes = await api.get(`/hubs/${hubId}/`);
        setHub(hubRes.data);
      } catch (err) {
        console.error(err);
        navigate("/hubs/list");
      } finally {
        setLoading(false);
      }
    };
    loadHub();
  }, [hubId, navigate]);
  useEffect(() => {
  setHeroIndex(0);
}, [heroImages.length]);

useEffect(() => {
  if (heroImages.length <= 1) return;

  const interval = setInterval(() => {
    setHeroIndex((prev) => (prev + 1) % heroImages.length);
  }, 6000); // ⏱️ change speed here

  return () => clearInterval(interval);
}, [heroImages.length]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-[#432dd7]/20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Loader2 className="w-12 h-12 text-[#432dd7] animate-spin" />
          </div>
        </div>
        <p className="mt-8 text-lg text-gray-600 font-medium">Loading hub details...</p>
      </div>
    );

  if (!hub || !user) return null;

  const isAdmin = hub.admin === user.username;

  const leaveHub = async () => {
    if (!window.confirm("Are you sure you want to leave this hub? You'll need to request access again to rejoin.")) return;
    setIsLeaving(true);
    try {
      await api.post(`/hubs/${hubId}/leave_hub/`);
      navigate("/hubs/list");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLeaving(false);
    }
  };

  const requestJoin = async () => {
    setIsRequesting(true);
    try {
      await api.post(`/hubs/${hubId}/request_join/`);
      const updatedHub = await api.get(`/hubs/${hubId}/`);
      setHub(updatedHub.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRequesting(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50/50">
      {/* ---------- HERO ---------- */}
{/* ---------- HERO ---------- */}
<div className="relative h-96 md:h-[500px] overflow-hidden">
  {/* <img
    src={hub.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"}
    alt={hub.name}
    className="h-full w-full object-cover"
  /> */}

  {/* Rotating Hero Images */}
<div className="absolute inset-0">
  {heroImages.map((img, index) => (
    <img
      key={index}
      src={img}
      alt={hub.name}
className={`
  absolute inset-0 h-full w-full object-cover
  transition-all duration-[7000ms] ease-out
  ${index === heroIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"}
`}

    />
  ))}
</div>


  {/* Dark gradient for readability */}
  <div className="absolute inset-0 bg-black/50" />

  {/* Hero Content */}
  <div className="absolute inset-0 max-w-7xl mx-auto px-4 md:px-8 flex flex-col justify-end pb-12">
    <div className="space-y-4 text-white drop-shadow-lg">
      <div className="flex items-center gap-3">
        {isAdmin && (
          <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-semibold">Admin</span>
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
          <Users className="w-4 h-4" />
          <span className="text-sm font-semibold">{hub.members?.length || 0} members</span>
        </div>
      </div>

      {/* Hub Name */}
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
        {hub.name}
      </h1>

      {/* Tagline */}
      <p className="text-xl md:text-2xl text-white/90 max-w-3xl">
        {hub.tagline || ""}
      </p>
    </div>
  </div>

  {/* Decorative Curve */}
  <div className="absolute -bottom-1 left-0 right-0">
    <svg viewBox="0 0 1440 120" className="w-full">
      <path
        d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32V120H0Z"
        fill="rgb(249 250 251)"
      />
    </svg>
  </div>

  {/* Back Button */}
  <button
    onClick={() => navigate("/hubs/list")}
    className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all"
  >
    <ChevronRight className="w-4 h-4 rotate-180 text-white" />
    <span className="text-white text-sm font-medium">Back to Hubs</span>
  </button>
</div>


      {/* ---------- MAIN CONTENT ---------- */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ---------- LEFT COLUMN ---------- */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hub Info Card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">About This Hub</h2>
                <div className="flex items-center gap-3 -space-x-2">
                  {hub.members?.slice(0, 3).map((member, idx) => (
                    <div
                      key={idx}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-[#432dd7] to-purple-500 border-2 border-white flex items-center justify-center text-white font-bold text-sm"
                    >
                      {member.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {hub.members?.length > 3 && (
                    <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 font-bold text-sm">
                      +{hub.members.length - 3}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">{hub.description}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-gray-100 pt-6">
                <StatItem label="Members" value={hub.members?.length || 0} />
                <StatItem label="Events" value={hub.events_count || 0} />
                <StatItem
  label="Admin Initial"
  value={hub.admin ? hub.admin.charAt(0).toUpperCase() : "—"}
/>

                <StatItem label="Active" value="24/7" />
              </div>
            </div>

            {/* Action Tabs */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-8 space-y-6 hover:shadow-[0_20px_40px_rgba(79,70,229,0.35)]">
              <h2 className="text-2xl font-bold text-gray-900">Hub Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActionButton
                  icon={<Calendar className="w-6 h-6" />}
                  title="View Events"
                  description="Browse upcoming hub events and activities"
                  onClick={() => setTab(tab === "events" ? null : "events")}
                  active={tab === "events"}
                />
                <ActionButton
                  icon={<MessageSquare className="w-6 h-6" />}
                  title="Open Chat"
                  description="Join real-time conversations with members"
                  onClick={() => navigate(`/hubs/${hubId}/chat`)}
                />
                {isAdmin && (
                  <ActionButton
                    icon={<Settings className="w-6 h-6" />}
                    title="Manage Hub"
                    description="Administrator controls and settings"
                    onClick={() => navigate(`/manage-hubs/${hubId}`)}
                  />
                )}
                {!isAdmin && hub.membership_status === "approved" && (
                  <ActionButton
                    icon={<LogOut className="w-6 h-6" />}
                    title="Leave Hub"
                    description="Leave this community permanently"
                    onClick={leaveHub}
                    loading={isLeaving}
                    variant="danger"
                  />
                )}
              </div>
            </div>

            {/* Events Section */}
            {tab === "events" && (
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                  <p className="text-gray-600 mt-2">Events happening in this hub</p>
                </div>
                <HubEvents hubId={hubId} hub={hub} user={user} />
              </div>
            )}
          </div>

          {/* ---------- RIGHT COLUMN / SIDEBAR ---------- */}
          <div className="space-y-8">
            {/* Member Status Card */}
            <MemberStatusCard
              hub={hub}
              user={user}
              isAdmin={isAdmin}
              isLeaving={isLeaving}
              leaveHub={leaveHub}
              isRequesting={isRequesting}
              requestJoin={requestJoin}
              navigate={navigate}
              hubId={hubId}
            />

            {/* Admin Info */}
            <div className="bg-gradient-to-br from-[#432dd7] to-purple-600 rounded-3xl shadow-2xl p-6 text-white space-y-4">
              <h3 className="text-lg font-bold">Hub Admin</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Crown className="w-8 h-8" />
                </div>
                <div>
                  <div className="font-bold text-xl">{hub.admin || "Unknown Admin"}</div>
                  <div className="text-white/80 text-sm">Community Leader</div>
                </div>
              </div>
              <p className="text-white/90 text-sm">
                Managed by {hub.admin}. Contact for membership or event queries.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-3">
              <h3 className="text-lg font-bold text-gray-900">Hub Statistics</h3>
              <StatItem label="Total Members" value={hub.members?.length || 0} />
              <StatItem label="Active Events" value={hub.events_count || 0} />
              <StatItem label="Member Since" value="Today" />
              <StatItem label="Community Score" value="98%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */
function MemberStatusCard({
  hub,
  user,
  isAdmin,
  isLeaving,
  leaveHub,
  isRequesting,
  requestJoin,
  navigate,
  hubId,
}) {
  const isMember =
    hub.members?.includes(user?.username) ||
    hub.membership_status === "approved";

  if (isAdmin) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#432dd7]/5 to-purple-500/5 rounded-xl">
          <Crown className="w-6 h-6 text-[#432dd7]" />
          <div>
            <div className="font-semibold text-gray-900">
              Hub Administrator
            </div>
            <div className="text-sm text-gray-600">
              Full control access
            </div>
          </div>
        </div>
        <PrimaryButton onClick={() => navigate(`/manage-hubs/${hubId}`)}>
          <Settings className="w-5 h-5 mr-2" /> Manage Hub
        </PrimaryButton>
      </div>
    );
  }

  if (isMember) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-xl">
          <CheckCircle className="w-6 h-6 text-emerald-500" />
          <div>
            <div className="font-semibold text-gray-900">
              Approved Member
            </div>
            <div className="text-sm text-gray-600">
              Full access granted
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* <PrimaryButton onClick={() => navigate(`/hubs/${hubId}`)}>
            Enter Hub
          </PrimaryButton> */}
          <DangerButton onClick={leaveHub} loading={isLeaving}>
            <LogOut className="w-4 h-4 mr-2" /> Leave
          </DangerButton>
        </div>
      </div>
    );
  }

  if (hub.membership_status === "pending") {
    return (
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-xl">
          <Clock className="w-6 h-6 text-amber-500" />
          <div>
            <div className="font-semibold text-gray-900">
              Pending Approval
            </div>
            <div className="text-sm text-gray-600">
              Waiting for admin review
            </div>
          </div>
        </div>
        <DisabledButton>
          <Clock className="w-5 h-5 mr-2 animate-pulse" /> Request Pending
        </DisabledButton>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-500/5 to-gray-400/5 rounded-xl">
        <UserPlus className="w-6 h-6 text-gray-500" />
        <div>
          <div className="font-semibold text-gray-900">
            Not a Member
          </div>
          <div className="text-sm text-gray-600">
            Request to join this hub
          </div>
        </div>
      </div>
      <PrimaryButton onClick={requestJoin} loading={isRequesting}>
        <UserPlus className="w-5 h-5 mr-2" /> Request to Join
      </PrimaryButton>
    </div>
  );
}

function ActionButton({
  icon,
  title,
  description,
  onClick,
  active = false,
  loading = false,
  variant = "primary",
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        w-full flex items-start gap-4 p-6 rounded-full
        transition-all duration-200
        ${
          variant === "danger"
            ? "bg-red-500 hover:bg-red-600 text-white"
            : active
            ? "bg-[#4f46e5] text-white shadow-xl"
            : "bg-[#4f46e5]/90 text-white hover:bg-[#4f46e5]"
        }
      `}
    >
      {/* Icon */}
      <div className="p-3 rounded-full bg-white/20 flex items-center justify-center">
        <div className="text-white">{icon}</div>
      </div>

      {/* Text */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white">
          {title}
        </h3>
        <p className="text-sm text-white/80 leading-snug mt-1">
          {description}
        </p>
      </div>

      {loading && (
        <Loader2 className="w-5 h-5 text-white animate-spin" />
      )}
    </button>
  );
}



function StatItem({ label, value }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-[#432dd7]">{value}</span>
    </div>
  );
}

/* ---------- BUTTONS ---------- */

function PrimaryButton({ children, className = "", loading = false, ...props }) {
  return (
    <button
      {...props}
      disabled={loading}
      className={`w-full md:w-auto rounded-2xl bg-gradient-to-r from-[#432dd7] to-purple-600 text-white py-3 px-6 text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${className}`}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </button>
  );
}

function DangerButton({ children, className = "", loading = false, ...props }) {
  return (
    <button
      {...props}
      disabled={loading}
      className={`w-full md:w-auto rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${className}`}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </button>
  );
}

function DisabledButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      disabled
      className={`w-full md:w-auto rounded-2xl bg-gray-100 text-gray-400 py-3 px-6 text-lg font-semibold cursor-not-allowed flex items-center justify-center ${className}`}
    >
      {children}
    </button>
  );
}

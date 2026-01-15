import CreateUserForm from "../auth/CreateUserForm";
import UploadUsersExcel from "../auth/UploadUsersExcel";
import UsersTable from "../components/UsersTable";
import { HubsTable } from "../components/HubsTable";
import { EventsTable } from "../components/EventsTable";
import CircularGallery from "../components/CircularGallery"; // ✅ import gallery
import "../assets/superuser.css";

export default function SuperUserDashboard() {
  const galleryItems = [
    { image: "https://picsum.photos/seed/super1/800/600", text: "Super Hub 1" },
    { image: "https://picsum.photos/seed/super2/800/600", text: "Super Hub 2" },
    { image: "https://picsum.photos/seed/super3/800/600", text: "Super Hub 3" },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-gallery" style={{ height: "400px", marginBottom: "2rem" }}>
        <CircularGallery items={galleryItems} bend={3} textColor="#fff" />
      </div>

      {/* Tables */}
      <HubsTable />
      <EventsTable />
      <UsersTable />
    </div>
  );
}

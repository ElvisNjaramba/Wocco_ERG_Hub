import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./auth/Login";
import SuperUserRegister from "./auth/SuperUserRegister";
import ProtectedRoute from "./auth/ProtectedRoute";

import SuperUserDashboard from "./pages/SuperUserDashboard";
import UserDashboard from "./pages/UserDashboard";
import Profile from "./pages/Profile";
import { ChangePassword } from "./pages/Password";
import HubsList from "./pages/HubsList";
import HubAbout from "./pages/HubAbout";
import CreateHub from "./pages/CreateHub";
import ManageHub from "./pages/ManageHub";
import CreateEventPage from "./pages/CreateEventPage";
import AllEventsPage from "./pages/AllEventsPage";
import HubDetails from "./pages/HubDetails";
import CreateUserPage from "./pages/CreateUserPage";
import UploadUsersPage from "./pages/UploadUsersPage";
import HubChat from "./pages/HubChat";
import AppLayout from "./components/AppLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/superuser/dashboard" element={<SuperUserDashboard />} />
            <Route path="/superuser/users/create" element={<CreateUserPage />} />
            <Route path="/superuser/users/upload" element={<UploadUsersPage />} />
            <Route path="/register/superuser" element={<SuperUserRegister />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/hubs/list" element={<HubsList />} />   
            <Route path="/hubs/:hubId/about" element={<HubAbout />} />   
            <Route path="/hubs/create" element={<CreateHub />} />        
            <Route path="/manage-hubs/:hubId" element={<ManageHub />} />
            <Route path="/events/create" element={<CreateEventPage />} />
            <Route path="/events/list" element={<AllEventsPage />} />
            <Route path="/hubs/:hubId" element={<HubDetails />} />
            <Route path="/hubs/:hubId/chat" element={<HubChat />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


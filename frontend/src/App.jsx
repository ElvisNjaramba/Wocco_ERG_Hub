import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./auth/Login";
import SuperUserRegister from "./auth/SuperUserRegister";
import ProtectedRoute from "./auth/ProtectedRoute";

import SuperUserDashboard from "./pages/SuperUserDashboard";
import UserDashboard from "./pages/UserDashboard";
import Profile from "./pages/Profile";
import { ChangePassword } from "./pages/Password";
import HubsList from "./pages/HubsList";
import HubDetails from "./pages/HubDetails";

import AppLayout from "./components/AppLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register/superuser" element={<SuperUserRegister />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/superuser/dashboard" element={<SuperUserDashboard />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/hubs/list" element={<HubsList />} />
            <Route path="/hubs/:hubId" element={<HubDetails />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


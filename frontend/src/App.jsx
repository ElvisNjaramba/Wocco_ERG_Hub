import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./auth/Login";
import SuperUserRegister from "./auth/SuperUserRegister";
import ProtectedRoute from "./auth/ProtectedRoute";

import SuperUserDashboard from "./pages/SuperUserDashboard";
import UserDashboard from "./pages/UserDashboard";
import Profile from "./pages/Profile";
import { ChangePassword } from "./pages/Password";
import HubsList from "./pages/HubsList";
import HubRequests from "./pages/HubRequests";
import HubDetails from "./pages/HubDetails";
import HubChat from "./pages/HubChat";




export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register/superuser" element={<SuperUserRegister />} />

        <Route
          path="/superuser/dashboard"
          element={
            <ProtectedRoute>
              <SuperUserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hubs/list"
          element={
            <ProtectedRoute>
              <HubsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hubs/:hubId"
          element={
            <ProtectedRoute>
              <HubDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hub/request"
          element={
            <ProtectedRoute>
              <HubsList />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

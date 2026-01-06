import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import SuperUserRegister from "./auth/SuperUserRegister";
import SuperUserDashboard from "./pages/SuperUserDashboard";
import UserDashboard from "./pages/UserDashboard";
import Profile from "./pages/Profile";
import { ChangePassword } from "./pages/Password";
import ProtectedRoute from "./auth/ProtectedRoute";

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
      </Routes>
    </BrowserRouter>
  );
}

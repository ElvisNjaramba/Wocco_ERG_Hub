import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "16px" }}>
        <Outlet />
      </main>
    </>
  );
}

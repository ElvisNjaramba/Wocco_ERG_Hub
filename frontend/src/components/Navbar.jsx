import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const [user, setUser] = useState(null);
  const isAuthenticated = !!localStorage.getItem("access");

  useEffect(() => {
    if (!isAuthenticated) {
      setUser(null);
      return;
    }

    api
      .get("/me/")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, [isAuthenticated]);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    navigate("/login");
  };

  const dashboardPath = user?.is_superuser
    ? "/superuser/dashboard"
    : "/user/dashboard";

  const links =
    isAuthenticated && user
      ? [
          { to: dashboardPath, label: "Dashboard" },
          { to: "/hubs/list", label: "Hubs" },
          { to: "/profile", label: "Profile" },
        ]
      : [];

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <Link to="/" style={styles.logo}>
          Wocco
        </Link>

        <button onClick={() => setOpen(!open)} style={styles.menuBtn}>
          ☰
        </button>
      </div>

      <div
        style={{
          ...styles.links,
          ...(open ? styles.linksOpen : {}),
        }}
      >
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            onClick={() => setOpen(false)}
            style={{
              ...styles.link,
              ...(location.pathname.startsWith(l.to)
                ? styles.active
                : {}),
            }}
          >
            {l.label}
          </Link>
        ))}

        {isAuthenticated && <div style={styles.divider} />}

        {isAuthenticated ? (
          <>
            <Link to="/change-password" style={styles.link}>
              Change Password
            </Link>
            <button onClick={logout} style={styles.logout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={styles.login}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}


const styles = {
    nav: { 
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid #e5e7eb",
        background: "#ffffff",
        position: "sticky",
        top: 0,
        zIndex: 100, 
    },

    brand: { 
        display: "flex", 
        alignItems: "center", 
        gap: 12, 
    },
    logo: { 
        fontSize: 18, 
        fontWeight: 700,
      textDecoration: "none", 
      color: "#4f46e5", 
    },

    menuBtn: { 
        display: "none", 
        fontSize: 20, 
        background: "none", 
        border: "none", 
        cursor: "pointer", 
    },

    links: { 
        display: "flex", 
        alignItems: "center", 
        gap: 14, 
    },

    linksOpen: { 
        position: "absolute", 
        top: 56, right: 16, 
        flexDirection: "column", 
        background: "#fff", 
        padding: 12, 
        borderRadius: 8, 
        boxShadow: "0 10px 20px rgba(0,0,0,.1)", 
    },
    link: { 
        textDecoration: "none", 
        color: "#374151", 
        fontSize: 14, 
    },
    active: { 
        color: "#4f46e5", 
        fontWeight: 600, 
    },
    divider: { 
        width: 1, 
        height: 18, 
        background: "#e5e7eb", 
    },
    logout: { 
        border: "none", 
        background: "#ef4444", 
        color: "#fff", 
        padding: "6px 10px", 
        borderRadius: 6, 
        cursor: "pointer", 
    },

    "@media (max-width: 768px)": { 
        menuBtn: { display: "block" }, 
        links: { display: "none" }, 
    },
login: {
  textDecoration: "none",
  background: "#4f46e5",
  color: "#fff",
  padding: "6px 12px",
  borderRadius: 6,
  fontSize: 14,
},
}
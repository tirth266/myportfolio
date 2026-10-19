import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Navbar({ toggleTheme, theme }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { id: "home", label: "Home", to: "/" },
    { id: "about", label: "About Me", to: "/about" },
    { id: "skills", label: "Skills", to: "/skills" },
    { id: "projects", label: "Projects", to: "/projects" },
    { id: "tasks", label: "Tasks", to: "/tasks" },
    { id: "experience", label: "Experience", to: "/experience" },
    { id: "contact", label: "Contact", to: "/contact" },
  ];

  const handleToggle = () => setMenuOpen((open) => !open);
  const handleLinkClick = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="logo" onClick={handleLinkClick}>
        Tirth.dev
      </NavLink>

      <button className="menu-toggle" onClick={handleToggle} type="button">
        ☰
      </button>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        {links.map((link) => (
          <NavLink
            key={link.id}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={handleLinkClick}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <span className="hidden rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 sm:inline">
              {user?.name || user?.email || "User"}
            </span>
            <button className="btn btn-secondary" type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <NavLink className="btn btn-primary" to="/login" onClick={handleLinkClick}>
            Login
          </NavLink>
        )}
        <button className="theme-toggle" onClick={toggleTheme} type="button">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

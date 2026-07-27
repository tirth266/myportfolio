import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

function Navbar({ toggleTheme, theme }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { id: "home", label: "Home", to: "/" },
    { id: "about", label: "About Me", to: "/about" },
    { id: "skills", label: "Skills", to: "/skills" },
    { id: "projects", label: "Projects", to: "/projects" },
    { id: "experience", label: "Experience", to: "/experience" },
    { id: "contact", label: "Contact", to: "/contact" },
  ];

  const handleToggle = () => setMenuOpen((open) => !open);
  const handleLinkClick = () => setMenuOpen(false);

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

      <button className="theme-toggle" onClick={toggleTheme} type="button">
        {theme === "dark" ? "☀️" : "🌙"}
      </button>
    </nav>
  );
}

export default Navbar;

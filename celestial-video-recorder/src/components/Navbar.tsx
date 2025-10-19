import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Camera, ShieldCheck, BookText, House, Sun, Moon } from "lucide-react";
import "./Navbar.css";

export const Navbar: React.FC = () => {
  const toggleTheme = () => {
    const root = document.documentElement;
    const isLight = root.getAttribute("data-theme") === "light";
    root.setAttribute("data-theme", isLight ? "dark" : "light");
    localStorage.setItem("theme", isLight ? "dark" : "light");
  };

  React.useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
  }, []);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <Camera className="brand-icon" />
          <span>AuthLens</span>
        </Link>
        <div className="links">
          <NavLink
            to="/"
            className={({ isActive }) => `link ${isActive ? "active" : ""}`}
          >
            <House className="link-icon" /> Home
          </NavLink>
          <NavLink
            to="/live"
            className={({ isActive }) => `link ${isActive ? "active" : ""}`}
          >
            Live
          </NavLink>
          <NavLink
            to="/validate"
            className={({ isActive }) => `link ${isActive ? "active" : ""}`}
          >
            Validate
          </NavLink>
          <NavLink
            to="/ledger/demo-video"
            className={({ isActive }) => `link ${isActive ? "active" : ""}`}
          >
            <BookText className="link-icon" /> Ledger
          </NavLink>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <Sun size={16} /> / <Moon size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

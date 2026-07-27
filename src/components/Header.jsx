import { Link } from "react-router-dom";

function Header({ name }) {
  return (
    <header className="hero-section" id="home">
      <div className="hero-content">
        <div className="hero-text">
          <p className="eyebrow">Hello, I'm</p>
          <h1>{name}</h1>
          <h2>Developer • AI/ML Enthusiast • Problem Solver</h2>
          <p>
            I craft modern web experiences and intelligent systems with a focus on
            clean design, strong architecture, and real-world impact.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/contact">
              Contact Me
            </Link>
            <Link className="btn btn-secondary" to="/projects">
              View Projects
            </Link>
          </div>
          <div className="social-links">
            <a href="https://github.com" target="_blank" rel="noreferrer">GH</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">IN</a>
            <a href="https://x.com" target="_blank" rel="noreferrer">X</a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="profile-card">
            <div className="profile-orb"></div>
            <div className="profile-placeholder">TS</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

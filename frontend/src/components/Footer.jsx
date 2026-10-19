import { Link } from "react-router-dom";

function Footer({ email }) {
  return (
    <footer className="footer">
      <div>
        <h3>Tirth.dev</h3>
        <p>Contact: {email}</p>
      </div>
      <div>
        <Link to="/">Home</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <p>© 2026 All rights reserved.</p>
    </footer>
  );
}

export default Footer;

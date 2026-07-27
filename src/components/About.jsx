import { Link } from "react-router-dom";

function About() {
  return (
    <section id="about" className="section-card">
      <div className="section-heading">
        <p className="eyebrow">About Me</p>
        <h2>Building thoughtful products with code and creativity.</h2>
      </div>

      <div className="about-grid">
        <div>
          <p>
            I'm a developer focused on building polished web experiences and
            practical AI-powered solutions. My work blends product thinking,
            clean frontend development, and a strong understanding of modern
            tools.
          </p>
          <p>
            I enjoy turning ambitious ideas into simple, robust interfaces that
            feel premium and perform well on every device.
          </p>
          <Link className="btn btn-primary" to="/contact">
            Download CV
          </Link>
        </div>
      </div>
    </section>
  );
}

export default About;
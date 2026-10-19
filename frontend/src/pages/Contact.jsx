import { useState } from "react";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <section className="section-card page-section">
      <div className="section-heading">
        <p className="eyebrow">Contact</p>
        <h2>Let’s discuss your next AI product.</h2>
      </div>

      <div className="contact-grid">
        <form className="contact-form">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <textarea
            rows="5"
            placeholder="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>

          <p className="form-hint">
            Live Preview: {message.length}/150 characters
          </p>

          <button className="btn btn-primary" type="button">
            Send Message
          </button>
        </form>

        <div className="contact-info">
          <div className="info-card">
            <h3>Email</h3>
            <p>tirth@example.com</p>
          </div>
          <div className="info-card">
            <h3>Location</h3>
            <p>Ahmedabad, India</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;

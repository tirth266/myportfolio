function Contact() {
  return (
    <section id="contact" className="section-card contact-section">
      <div className="section-heading">
        <p className="eyebrow">Contact</p>
        <h2>Let’s build something exceptional.</h2>
      </div>

      <div className="contact-grid">
        <form className="contact-form">
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Your Email" />
          <input type="text" placeholder="Subject" />
          <textarea rows="5" placeholder="Your Message"></textarea>
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
          <div className="info-card">
            <h3>Social</h3>
            <p>GitHub • LinkedIn • X</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;

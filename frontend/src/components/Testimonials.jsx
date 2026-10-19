function Testimonials() {
  const testimonials = [
    {
      name: "Ava Sharma",
      role: "Product Designer",
      quote: "A thoughtful developer who blends visual polish with reliable execution.",
    },
    {
      name: "Rohan Patel",
      role: "Startup Founder",
      quote: "The final product felt premium, fast, and easy for users to engage with.",
    },
  ];

  return (
    <section className="section-card">
      <div className="section-heading">
        <p className="eyebrow">Testimonials</p>
        <h2>Trusted by clients and collaborators.</h2>
      </div>

      <div className="testimonial-grid">
        {testimonials.map((item) => (
          <div className="testimonial-card" key={item.name}>
            <p>“{item.quote}”</p>
            <h3>{item.name}</h3>
            <span>{item.role}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;

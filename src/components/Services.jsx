function Services() {
  const services = [
    { title: "Web Development", description: "Responsive, high-performing websites for modern businesses." },
    { title: "React Development", description: "Component-driven React apps with a premium UI feel." },
    { title: "Python Development", description: "Automation, backend logic, and data-driven applications." },
    { title: "AI & Machine Learning", description: "Practical AI experiences and intelligent product features." },
    { title: "UI/UX Design", description: "Clean, accessible interfaces with thoughtful interaction design." },
  ];

  return (
    <section className="section-card">
      <div className="section-heading">
        <p className="eyebrow">Services</p>
        <h2>How I can help your product stand out.</h2>
      </div>

      <div className="services-grid">
        {services.map((service) => (
          <div className="service-card" key={service.title}>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Services;

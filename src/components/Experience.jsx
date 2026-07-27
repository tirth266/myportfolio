function Experience() {
  const items = [
    {
      company: "PixelForge Labs",
      role: "Frontend Developer",
      period: "2023 - Present",
      description: "Built polished product interfaces and collaborated on design systems.",
    },
    {
      company: "NovaAI Studio",
      role: "AI Developer Intern",
      period: "2022 - 2023",
      description: "Worked on ML prototypes and automation tools for internal workflows.",
    },
  ];

  return (
    <section id="experience" className="section-card">
      <div className="section-heading">
        <p className="eyebrow">Experience</p>
        <h2>Career milestones and growth.</h2>
      </div>

      <div className="timeline">
        {items.map((item) => (
          <div className="timeline-item" key={item.company}>
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>{item.role}</h3>
              <p className="timeline-company">{item.company}</p>
              <p className="timeline-period">{item.period}</p>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Experience;

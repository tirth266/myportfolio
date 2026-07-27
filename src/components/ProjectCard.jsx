function ProjectCard({ project }) {
  return (
    <article className="project-card">
      <span className="project-card-badge">{project.label}</span>
      <div className="project-image-placeholder" aria-label={`${project.title} icon`}>
        <span className="project-icon">{project.icon || "🤖"}</span>
      </div>
      <h3>{project.title}</h3>
      <p>{project.description}</p>

      <div className="tag-row">
        {project.techStack.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <ul className="feature-list">
        {project.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      <div className="project-actions">
        <a className="btn btn-secondary" href={project.github} target="_blank" rel="noreferrer">
          <span className="btn-icon" aria-hidden="true">🐙</span>
          GitHub
        </a>
        <button className="btn btn-primary btn-disabled" type="button" disabled>
          <span className="btn-icon" aria-hidden="true">🔗</span>
          Coming Soon
        </button>
      </div>
    </article>
  );
}

export default ProjectCard;

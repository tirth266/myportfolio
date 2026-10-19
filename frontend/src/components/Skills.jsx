function Skills() {
  const categories = [
    {
      title: "Frontend",
      skills: ["React", "JavaScript", "CSS", "HTML"],
    },
    {
      title: "Backend",
      skills: ["Node.js", "Express", "Python", "APIs"],
    },
    {
      title: "Database",
      skills: ["MongoDB", "SQL", "Firebase"],
    },
    {
      title: "AI / ML",
      skills: ["TensorFlow", "PyTorch", "NLP", "Computer Vision"],
    },
    {
      title: "Tools",
      skills: ["Git", "Vite", "Figma", "VS Code"],
    },
  ];

  return (
    <section id="skills" className="section-card">
      <div className="section-heading">
        <p className="eyebrow">Skills</p>
        <h2>Core stack and capabilities.</h2>
      </div>

      <div className="skills-grid">
        {categories.map((category) => (
          <div className="skill-card" key={category.title}>
            <h3>{category.title}</h3>
            <ul>
              {category.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;

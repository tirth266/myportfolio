import ProjectCard from "./ProjectCard";

function Projects() {
  const projects = [
    {
      title: "👗 AI Fashion Recommendation System",
      description:
        "An AI-powered fashion recommendation platform that suggests visually similar clothing using deep learning, image embeddings, and personalized user preferences. The system also recommends clothing sizes and manages a user's digital wardrobe.",
      techStack: ["React", "Flask", "MongoDB", "ResNet", "CNN", "AI"],
      features: [
        "Image-based fashion recommendation",
        "Google Authentication",
        "Personalized recommendations",
        "Size estimation",
        "Wardrobe management",
        "MongoDB Atlas",
        "Deep Learning",
        "REST API",
      ],
      github: "https://github.com/tirth266/Fashion-Recommdation-System",
      label: "Featured",
      icon: "👗",
    },
    {
      title: "📄 AI Document Scanner",
      description:
        "A modern AI-powered document scanner that allows users to upload documents, extract text using OCR, and manage scanned files through a responsive React and Flask application.",
      techStack: ["React", "Flask", "OCR", "Python", "AI"],
      features: [
        "OCR Text Extraction",
        "Document Upload",
        "Image Processing",
        "Flask REST API",
        "Responsive React UI",
        "Secure File Handling",
      ],
      github: "https://github.com/tirth266/AI-Doc-Scanner",
      label: "Latest",
      icon: "📄",
    },
    {
      title: "🚗 AI Driver Distraction Detection",
      description:
        "An intelligent driver monitoring system that detects distracted driving behavior using computer vision and deep learning. The system analyzes live video, detects unsafe actions, and provides real-time voice alerts to improve road safety.",
      techStack: ["YOLO", "OpenCV", "Python", "React", "Flask", "AI"],
      features: [
        "Driver Monitoring",
        "Face Detection",
        "Mobile Usage Detection",
        "Drowsiness Detection",
        "Seat Belt Detection",
        "Real-Time Voice Alerts",
        "Live Camera Processing",
        "AI-Based Safety Analysis",
      ],
      github: "https://github.com/tirth266",
      label: "AI Project",
      icon: "🚗",
    },
  ];

  return (
    <section id="projects" className="section-card page-section">
      <div className="section-heading">
        <p className="eyebrow">Projects</p>
        <h2>Real AI projects built for meaningful product experiences.</h2>
      </div>

      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}

export default Projects;

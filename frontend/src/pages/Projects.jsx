import { useState, useEffect, useCallback } from "react";
import ProjectCard from "../components/ProjectCard";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import RepoCard from "../components/RepoCard";
import "../components/RepoCard.css";

const GITHUB_API_URL = "https://api.github.com/users/tirth266/repos";

function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(GITHUB_API_URL);

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setRepos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

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
    <section className="section-card page-section">
      <div className="section-heading">
        <p className="eyebrow">Projects</p>
        <h2>Real AI projects built with practical impact.</h2>
      </div>

      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>

      {/* ── GitHub Repositories Section ── */}
      <div className="section-heading" style={{ marginTop: "48px" }}>
        <p className="eyebrow">GitHub</p>
        <h2>Open Source Repositories</h2>
      </div>

      {/* Search Bar */}
      {!loading && !error && (
        <div className="repo-search-wrapper">
          <span className="repo-search-icon" aria-hidden="true">🔍</span>
          <input
            className="repo-search-input"
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {repos.length > 0 && (
            <p className="repo-count">
              Showing <strong>{filteredRepos.length}</strong> of{" "}
              <strong>{repos.length}</strong> repositories
            </p>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && <Spinner />}

      {/* Error State */}
      {error && !loading && <ErrorMessage error={error} onRetry={fetchRepos} />}

      {/* Success State */}
      {!loading && !error && filteredRepos.length > 0 && (
        <div className="repo-grid">
          {filteredRepos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}

      {/* Empty Search Results */}
      {!loading && !error && filteredRepos.length === 0 && repos.length > 0 && (
        <div className="repo-empty">
          <span className="repo-empty-icon" aria-hidden="true">📭</span>
          No repositories found.
        </div>
      )}
    </section>
  );
}

export default Projects;

import "./RepoCard.css";

function RepoCard({ repo }) {
  const updatedDate = new Date(repo.updated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="repo-card">
      <div className="repo-card-header">
        <span className="repo-card-icon" aria-hidden="true">📁</span>
        <h3 className="repo-card-name">{repo.name}</h3>
      </div>

      <p className="repo-card-desc">
        {repo.description || "No description provided."}
      </p>

      <div className="repo-card-meta">
        <span className="repo-meta-item">
          <span className="repo-star-icon" aria-hidden="true">⭐</span>
          {repo.stargazers_count}
        </span>

        {repo.language && (
          <span className="repo-language-badge">
            <span className="repo-language-dot" aria-hidden="true"></span>
            {repo.language}
          </span>
        )}
      </div>

      <p className="repo-updated">Updated: {updatedDate}</p>

      <div className="repo-card-actions">
        <a
          className="repo-open-btn"
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
        >
          Open Repository
          <span className="repo-external-icon" aria-hidden="true">🔗</span>
        </a>
      </div>
    </article>
  );
}

export default RepoCard;

import "./ErrorMessage.css";

function ErrorMessage({ error, onRetry }) {
  return (
    <div className="error-container">
      <span className="error-icon" aria-hidden="true">❌</span>
      <p className="error-title">Failed to load repositories.</p>
      <p className="error-detail">{error}</p>
      <button className="error-retry-btn" onClick={onRetry} type="button">
        🔄 Retry
      </button>
    </div>
  );
}

export default ErrorMessage;

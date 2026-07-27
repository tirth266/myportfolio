import "./Spinner.css";

function Spinner() {
  return (
    <div className="spinner-container">
      <div className="spinner-ring" aria-label="Loading"></div>
      <p className="spinner-text">Loading repositories...</p>
    </div>
  );
}

export default Spinner;

import "./Spinner.css";

function Spinner({ text = "Loading..." }) {
  return (
    <div className="spinner-container">
      <div className="spinner-ring" aria-label="Loading"></div>
      <p className="spinner-text">{text}</p>
    </div>
  );
}

export default Spinner;

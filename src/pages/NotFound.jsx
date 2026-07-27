import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section className="section-card page-section not-found">
      <h2>404</h2>
      <p>Page Not Found</p>
      <Link className="btn btn-primary" to="/">
        Return Home
      </Link>
    </section>
  );
}

export default NotFound;

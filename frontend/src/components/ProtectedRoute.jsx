import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

/**
 * Practical 7 — Client side route guard.
 *
 * This is only a UX convenience. It stops the Tasks page from flashing while
 * the user is logged out, but it is NOT security: anything in the browser can
 * be edited by the user. The real protection is the auth middleware on the
 * server, which checks the JWT on every single API call.
 *
 * The two layers work together:
 *   - this component  -> nicer navigation, no pointless API call
 *   - middleware/auth.js -> actually stops unauthorised access
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isRestoring } = useAuth();
  const location = useLocation();

  // On page load we do not know yet whether the stored token is still valid,
  // because AuthContext is waiting for GET /api/auth/me. Redirecting now
  // would throw away a perfectly good session, so wait.
  if (isRestoring) {
    return (
      <div className="page-section" role="status" aria-live="polite">
        <Spinner text="Checking your session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // `state.from` remembers where the user was heading, so the Login page
    // can send them back there after a successful login.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;

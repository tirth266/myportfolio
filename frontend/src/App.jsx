import { lazy, Suspense, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import Spinner from "./components/Spinner";
import Home from "./pages/Home";

// Route-level code splitting (Practical 8): every route except the entry "/"
// is fetched on demand as its own chunk.
const AboutPage = lazy(() => import("./pages/About"));
const SkillsPage = lazy(() => import("./pages/Skills"));
const Projects = lazy(() => import("./pages/Projects"));
const ExperiencePage = lazy(() => import("./pages/Experience"));
const Contact = lazy(() => import("./pages/Contact"));
const TasksPage = lazy(() => import("./pages/Tasks"));
const LoginPage = lazy(() => import("./pages/Login"));
const RegisterPage = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteFallback() {
  return (
    <div className="page-section" role="status" aria-live="polite">
      <Spinner text="Loading page..." />
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className={`app ${theme}`}>
      <ScrollToTop />
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <Footer email="tirth@example.com" />
    </div>
  );
}

export default App;

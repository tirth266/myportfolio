import { lazy, Suspense, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import Spinner from "./components/Spinner";
import Home from "./pages/Home";

// Practical 8: Route-level code splitting using React.lazy() and dynamic import()
// Supplementary: 300ms minimum delay prevents UI flicker on fast connections
const lazyWithDelay = (importFn, minDelay = 300) =>
  lazy(() =>
    Promise.all([
      importFn(),
      new Promise((resolve) => setTimeout(resolve, minDelay)),
    ]).then(([module]) => module)
  );

// Convert all page components (except entry Home) to lazy-loaded chunks
const AboutPage = lazyWithDelay(() => import("./pages/About"));
const SkillsPage = lazyWithDelay(() => import("./pages/Skills"));
const Projects = lazyWithDelay(() => import("./pages/Projects"));
const ExperiencePage = lazyWithDelay(() => import("./pages/Experience"));
const Contact = lazyWithDelay(() => import("./pages/Contact"));
const TasksPage = lazyWithDelay(() => import("./pages/Tasks"));
const LoginPage = lazyWithDelay(() => import("./pages/Login"));
const RegisterPage = lazyWithDelay(() => import("./pages/Register"));
const NotFound = lazyWithDelay(() => import("./pages/NotFound"));

// Fallback component matching portfolio theme
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

import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import AboutPage from "./pages/About";
import SkillsPage from "./pages/Skills";
import Projects from "./pages/Projects";
import ExperiencePage from "./pages/Experience";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

function App() {
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className={`app ${theme}`}>
      <ScrollToTop />
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer email="tirth@example.com" />
    </div>
  );
}

export default App;

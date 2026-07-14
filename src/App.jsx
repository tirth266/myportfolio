import Header from "./components/Header";
import About from "./components/About";
import Skills from "./components/Skills";
import Footer from "./components/Footer";

function App() {
  const skills = [
    "React",
    "JavaScript",
    "Python",
    "Machine Learning",
    "HTML",
    "CSS",
  ];

  return (
    <div>
      <Header name="Tirth Savsani" />

      <About />

      <Skills skillList={skills} />

      <Footer email="tirth@example.com" />
    </div>
  );
}

export default App;

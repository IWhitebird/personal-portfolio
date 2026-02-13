import { useEffect, useState, useCallback, Suspense, lazy } from "react";
import "./App.css";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import DisplacementSphere from "./components/Sphere";
import { MyContext } from "./MyContext";
import ModeSwitch from "./components/Navbar/ModeSwitch";
import ScrollProgress from "./components/ScrollProgress";
import { Analytics } from "@vercel/analytics/react"

const Experience = lazy(() => import("./components/Experience"));
const Projects = lazy(() => import("./components/Projects"));
const About = lazy(() => import("./components/About"));
const Contact = lazy(() => import("./components/Contact"));
const ResumeModal = lazy(() => import("./components/Resume/ResumeModal"));
const Chat = lazy(() => import("./components/Chat"));

function Spinner() {
  return (
    <div className="spinner-wrapper">
      <div className="spinner" />
    </div>
  );
}

function App() {

  const [mode, setMode] = useState(localStorage.getItem("mode") || "light");
  const [resumeModal, setResumeModal] = useState(false);

  if (mode === "light") {
    document.body.style.backgroundColor = "#f2f2f2";
  } else {
    document.body.style.backgroundColor = "#111111";
  }

  localStorage.setItem("mode", mode);

  useEffect(() => {
    if (resumeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [resumeModal]);

  function changeMode() {
    if (mode === "light") {
      setMode("dark");
      document.body.style.backgroundColor = "#111111";
    } else {
      setMode("light");
      document.body.style.backgroundColor = "#f2f2f2";
    }
  }

  const handleSetTheme = useCallback((theme) => {
    setMode(theme);
    document.body.style.backgroundColor = theme === "light" ? "#f2f2f2" : "#111111";
  }, []);

  const handleShowResume = useCallback(() => {
    setResumeModal(true);
  }, []);

  return (
    <Suspense fallback={<Spinner />}>
      <Analytics />
      <MyContext.Provider value={{ mode, setMode }}>
        <ScrollProgress />
        <div
          className={`App
      transition-colors duration-300 ease-in
      ${mode === "light" ? "light-mode" : "dark-mode"}
      `}
        >
          {resumeModal && (
            <Suspense fallback={<Spinner />}>
              <ResumeModal setResumeModal={setResumeModal} />
            </Suspense>
          )}
          <ModeSwitch handleClick={changeMode} />
          <DisplacementSphere />
          <Home setResumeModal={setResumeModal} />
          <Experience />
          <Projects />
          <About />
          <Contact />
          <Navbar setResumeModal={setResumeModal} />
          <Chat onSetTheme={handleSetTheme} onShowResume={handleShowResume} />
        </div>
      </MyContext.Provider>
    </Suspense>
  );
}

export default App;

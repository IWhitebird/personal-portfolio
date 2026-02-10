import { useEffect, useState, Suspense } from "react";
import "./App.css";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import DisplacementSphere from "./components/Sphere";
import Contact from "./components/Contact";
import About from "./components/About";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import ResumeModal from "./components/Resume/ResumeModal";
import { MyContext } from "./MyContext";
import ModeSwitch from "./components/Navbar/ModeSwitch";
import { Analytics } from "@vercel/analytics/react"

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

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Analytics />
      <MyContext.Provider value={{ mode, setMode }}>
        <div
          className={`App
      transition-colors duration-300 ease-in
      ${mode === "light" ? "light-mode" : "dark-mode"}
      `}
        >
          {resumeModal && <ResumeModal setResumeModal={setResumeModal} />}
          <ModeSwitch handleClick={changeMode} />
          <DisplacementSphere />
          <Home setResumeModal={setResumeModal} />
          <Experience />
          <Projects />
          <About />
          <Contact />
          <Navbar setResumeModal={setResumeModal} />
        </div>
      </MyContext.Provider>
    </Suspense>
  );
}

export default App;

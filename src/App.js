import { useEffect, useState, Suspense } from "react";
import "./App.css";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import DisplacementSphere from "./components/Sphere";
import Contact from "./components/Contact";
import About from "./components/About";
import Projects from "./components/Projects";
import { MyContext } from "./MyContext";
import ModeSwitch from "./components/Navbar/ModeSwitch";

function App() {
  const [mode, setMode] = useState(localStorage.getItem("mode") || "light");

  if (mode === "light") {
    document.body.style.backgroundColor = "#f2f2f2";
  } else {
    document.body.style.backgroundColor = "#111111";
  }

  localStorage.setItem("mode", mode);

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

      <MyContext.Provider value={{ mode, setMode }}>
        <div
          className={`App
      transition-colors duration-300 ease-in
      ${mode === "light" ? "light-mode" : "dark-mode"}
      `}
        >
          <ModeSwitch handleClick={changeMode} />
          <DisplacementSphere />
          <Home />
          <Projects />
          <About />
          <Contact />
          <Navbar />
        </div>
      </MyContext.Provider>
    </Suspense>
  );
}

export default App;

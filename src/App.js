import './App.css';
import Home from './components/Home';
import Navbar from './components/Navbar';
import DisplacementSphere from './components/Sphere';
import Contact from './components/Contact';
import About from './components/About';
import Projects from './components/Projects';

function App() {
  return (
    <>
    <div className="App">
      <DisplacementSphere />
      <Home />
      {/* <Projects /> */}
      <About />
      <Contact />
      <Navbar />
    </div>
    </>
  );
}

export default App;
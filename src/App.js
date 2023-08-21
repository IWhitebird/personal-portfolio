import './App.css';
import Home from './components/Home';
import Navbar from './components/Navbar';
import DisplacementSphere from './components/Sphere';
import Contact from './components/Contact';

function App() {
  return (
    <>
    <div className="App">
      <DisplacementSphere />
      <Home />
      <Contact />
      <Navbar />
    </div>
    </>
  );
}

export default App;
import './App.css';
import Home from './components/Home';
import Counter from './components/Navbar/counter';

function App() {
  return (
    <div className="App">
      
      <div className='relative'>
          <DisplacementSphere />
      </div>

      <Counter />
    </div>
  );
}

export default App;

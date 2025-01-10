import logo from './logo.svg';
import './CSS/App.css';
import Login from './Components/login';
import ApiTest from './Components/api-test';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <h1>Hello world</h1> */}
        {/* <Login /> */}
        <ApiTest />
      </header>
    </div>
  );
}

export default App;

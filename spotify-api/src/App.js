import './CSS/App.css';
import ApiTest from './Components/api-test';
import TopSongs from './Components/top-songs';
import Search from './Components/search';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify API Test</h1>
      </header>
      <TopSongs />
      <Search />
      <p>Website made by Milton Tomasino<br></br>Contact: jonathantomasino13@gmail.com</p>
    </div>
  );
}

export default App;

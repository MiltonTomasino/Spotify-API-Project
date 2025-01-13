import React, { useEffect, useState} from 'react';


function ApiTest(){

    const [data, setData] = useState("null");
    const [temp, setTemp] = useState("")
    const [topSongs, setTopSongs] = useState([]);

    const fetchData = () => {
        fetch("http://localhost:3001/api")
        .then((response) => response.json())
        .then((data) => setData(data.message))
        .catch((error) => console.error("Error fetching data:", error));
    };

    const tempFunc = () => {
        fetch("http://localhost:3001/spotify-data")
        .then((response) => response.json())
        .then((temp) => setTemp(temp.keyUsed))
        .catch((error) => console.error("Error fetching key", error));
    };

    const fetchTopSongs = () => {
        fetch("http://localhost:3001/top-songs")
        .then((res) => res.json())
        .then((songs) => setTopSongs(songs))
        .catch((e) => console.error("Error fetching top songs: ", e));
    };

    return (
        <div>
            <h1>Data from server:</h1>
            <button onClick={fetchData}>Fetch Data</button>
            {data && (
                <pre>{data}</pre>
            )}
            <button onClick={tempFunc}>Fetch Key</button>
            {temp && (
                <pre>{temp}</pre>
            )}

            <h1>Top 10 Songs</h1>
            <button onClick={fetchTopSongs}>fetch</button>
            {topSongs.length > 0 && (
                <ul>
                    {topSongs.map((song, index) => (
                        <li key={index}>
                            {song.track} by {song.artist}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default ApiTest
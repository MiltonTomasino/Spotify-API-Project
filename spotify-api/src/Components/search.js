import React, { useState, useEffect } from 'react'
import "../CSS/search.css"

function Search() {

    const [searchInput, setSearchInput] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    async function search() {
        setError(null);
        setIsLoading(true);
        console.log("Search for " + searchInput);

        try {
            const res = await fetch(`http://localhost:3001/search?q=${encodeURIComponent(searchInput)}`);
            if (!res.ok) {
                throw new Error("Failed to fetch search results");
            }

            const data = await res.json();
            console.log("This is the resulting data",data)
            setResults(data.items || []);

        } catch (error) {
            console.error("Error during search:", error);
            setError("Failed to fetch search results. Please try again");
        } finally {
            setIsLoading(false);
        }
        
    }

  return (
    <div className='search-wrapper'>
        <div className='input-wrapper'>
            <input 
                className='input-box'
                placeholder='Search for Artist'
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        search();
                    }
                }}
                onChange={(e) => setSearchInput(e.target.value)}
            />
            <button onClick={search}>Search</button>
            
        </div>
        <div className='search-body'>
            {isLoading ? (
                <div className='loading-icon'>Loading...</div>
            ) : (
                results.map((album, index) => (
                    <div 
                        className='Card' 
                        key={album.id}
                        style={{
                            animationDelay: `${index * 0.1}s`,
                        }}
                    >
                        <img src={album.images[0]?.url} alt={album.name} />
                        <div className='text-box'>
                            <h3>{album.name}</h3>
                            <p>{album.artists.map((artist) => artist.name).join(", ")}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  )
}

export default Search
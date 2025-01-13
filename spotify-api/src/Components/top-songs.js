import React, { useEffect, useState } from 'react';
import "../CSS/top-songs.css"
import "../CSS/search.css"

const TopSongs = () => {

    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        setIsLoading(true);
        window.location.href = "http://localhost:3001/login";
    };

    const checkLoginStatus = async () => {
        try {

            const res = await fetch("http://localhost:3001/check-auth", {
                method: "GET",
                credentials: 'include',
            });

            if (res.ok) {
                setIsLoggedIn(true);
                fetchUserData();
                setIsLoading(false);
            } else {
                setIsLoggedIn(false);
                setIsLoading(false);
            }

        } catch (error) {
            console.error("Error checking login status", error);
            setIsLoggedIn(false);
            setIsLoading(false);
        }
    }

    const fetchUserData = async () => {
        const res = await fetch("http://localhost:3001/user-data", {
            method: "GET",
            credentials: 'include',
        });
        const data = await res.json();
        console.log("data:", data.topSongs);
        setUserData(data);
        console.log("User data:", userData);
    };

    useEffect(() => {
        checkLoginStatus();
    }, [])

    // useEffect(() => {
    //     console.log("Updated user data:", userData);
    // }, [userData]);

    return(
        <div className='login-wrapper'>
            {isLoading ? (
                <div className='loading-icon'>Loading...</div>
            ) : (
                <>
                    {!isLoggedIn ? (
                        <>
                            <h2>Login to Spotify to see your top songs</h2>
                            <button onClick={handleLogin}>Login with Spotify</button>
                        </>
                    ) : (
                        <div>
                            {userData ? (
                                <div className='user-container'>
                                    <h2>Your top 10 songs:</h2>
                                    {userData.topSongs.map((track, i) => {
                                        return(
                                            <div key={i} className='track-card'>
                                                <h3>{i+1}. {track.name}</h3>
                                                <p>by {track.artist}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className='loading-icon'>Loading...</div>
                            )}
                        </div>
                    )}
                </>
                
            )}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        </div>
    )
}

export default TopSongs


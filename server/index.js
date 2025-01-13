import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cookieParser from "cookie-parser";

dotenv.config();

const PORT = 3001;
const app = express();
const REDIRECT_URI = "http://localhost:3001/callback";

const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
}

app.use(cookieParser());
app.use(cors(corsOptions));

const getBasicSpotifyToken = async () => {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    console.log("CLIENT_ID:", process.env.CLIENT_ID);
    console.log("CLIENT_SECRET", process.env.CLIENT_SECRET);

    if (!clientId || !clientSecret) {
        throw new Error("Spotify CLIENT_ID or CLIENT_SECRET is missing.");
    }

    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + Buffer.from(clientId + ':' + clientSecret).toString("base64"),
        },
        body: "grant_type=client_credentials",
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
        throw new Error("Failed to fetch basic token: " + tokenData.error);
    }

    return tokenData.access_token;
};

app.get("/login", (req, res) => {
    const scope = "user-read-private user-read-email playlist-read-private user-top-read";
    const authURL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    res.redirect(authURL);
});


app.get("/callback", async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send("Authorization code is missing");
    }

    try  {
        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization:
                    "Basic " +
                    Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString("base64"),
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: REDIRECT_URI,
            }),
        });


        const tokenData = await tokenResponse.json();

        // console.log("tokenData: ",tokenData);    

        if (tokenData.access_token) {

            res.cookie("accessToken", tokenData.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV == "production",
                sameSite: "Strict",
                maxAge: tokenData.expires_in * 1000,
            });

            // res.send("Login successful! You can now use the app");
            res.redirect("http://localhost:3000");
        } else {
            throw new Error("Failed to get access token");
        }
    } catch (error) {
        console.error("Error during token exchange:", error);
        res.status(500).send("Failed to authenticate with spotify");
    }

});

app.get("/search", async (req, res) => {
    const { q: query } = req.query;

    if (!query) {
        return res.status(400).send("Query parameters missing.");
    }

    try {
        const token = await getBasicSpotifyToken();

        const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const searchData = await searchRes.json();
        console.log(searchData);
        const artistID = searchData.artists?.items[0]?.id;
        

        const albums = await fetch(`https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album&market=US&limit=50`,
            {
                headers: {Authorization: `Bearer ${token}`},
            }
        );
        const albumsResult = await albums.json();
        console.log(albumsResult);
        if (!albums.ok) {
            throw new Error("Spotify API Search Error: " + JSON.stringify(searchData));
        }
        res.json({items: albumsResult.items});

    } catch (error) {
        console.error("Error performing search:", error);
        res.status(500).json({error: "Failed to perform search"});
    }

});

app.get("/check-auth", (req, res) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({loggedIn: false});
    } else {
        return res.status(200).json({loggedIn: true});
    }

});

app.get("/user-data", async (req, res) => {

    const accessToken = req.cookies.accessToken;

    console.log("Cookie:", accessToken);

    if (!accessToken) {
        return res.status(401).json({error: "User is not authenticated"});
    }

    try {
        const spotifyRes = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=10", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const topTracks = await spotifyRes.json();

        console.log("topTracks:", topTracks);

        if (!topTracks) {
            throw new Error("Failed to retrieve top tracks");
        }

        const topSongs = topTracks.items.map((t) => ({
            name: t.name,
            artist: t.artists.map((a) => a.name).join(", "),
            album: t.album.name,
            imageUrl: t.album.images[0]?.url,
        }));

        console.log("topSongs", topSongs);

        res.json({topSongs});

        // const userData = await spotifyRes.json();
        // res.json(userData);
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({error: "Failed to fetch user data."});
    }
});

app.get("/top-songs", async (req, res) => {
    try {
        const token = await getBasicSpotifyToken();

        console.log("Spotify access token:", token);

        const spotifyRes = await fetch(
            `https://api.spotify.com/v1/playlists/37i9dQZF1E34XhyfNnyrab/tracks`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const spotifyData = await spotifyRes.json();

        if (!spotifyRes.ok) {
            console.error("Spotify API Error:", spotifyData);
            return res.status(spotifyRes.status).json({error: spotifyData.error});
        }

        if (!spotifyData.items) {
            console.error("Unexpeted Spotify API response:", spotifyData);
            throw new Error("Spotify API response does not contain items.");
        }

        console.log(spotifyData);

        const topSongs = spotifyData.items.map((item) => ({
            track: item.track.name,
            artist: item.track.artists.map((artist) => artist.name).join(", "),
        }));

        res.json(topSongs);

    } catch (error) {
        console.error("Error fetching top songs:", error);
        res.status(500).json({ error: "Failed to fetch top songs"});
    }
});

app.get("/api", (req, res) => {
    res.json({message: "Hello from Server!"});
});

app.get("/spotify-data", (req, res) => {
    const apiKey = process.env.CLIENT_ID;
    console.log("API key being sent: ", apiKey);
    res.json({ keyUsed: apiKey });
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
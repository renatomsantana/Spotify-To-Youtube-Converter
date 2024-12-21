// index.js - Backend (Node.js + Express)

const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const { google } = require('googleapis');
const app = express();
const PORT = process.env.PORT || 3000;

// Spotify API configuration
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI, // For OAuth (optional here)
});

// YouTube API configuration
const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY, // YouTube Data API key
});

// Middleware to parse JSON
app.use(express.json());

// Route: Convert Spotify playlist to YouTube links
app.post('/convert', async (req, res) => {
    const { playlistUrl } = req.body;

    if (!playlistUrl) {
        return res.status(400).json({ error: 'Playlist URL is required' });
    }

    try {
        // Extract playlist ID from URL
        const playlistId = playlistUrl.split('/playlist/')[1].split('?')[0];

        // Fetch playlist details from Spotify
        const playlistData = await spotifyApi.getPlaylist(playlistId);
        const tracks = playlistData.body.tracks.items;

        // Extract song and artist names
        const songs = tracks.map(item => {
            const track = item.track;
            return `${track.name} ${track.artists.map(artist => artist.name).join(' ')}`;
        });

        // Fetch YouTube links for each song
        const youtubeLinks = await Promise.all(
            songs.map(async (song) => {
                const response = await youtube.search.list({
                    part: 'snippet',
                    q: song,
                    maxResults: 1,
                });

                const video = response.data.items[0];
                return video ? `https://www.youtube.com/watch?v=${video.id.videoId}` : null;
            })
        );

        // Return the links
        res.json({ youtubeLinks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

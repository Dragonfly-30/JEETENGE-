const express = require("express");
const router = express.Router();
const axios = require("axios");

// ✅ Middleware: Check If User is Authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.accessToken) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized - Please log in via Spotify" });
};

// 🔹 Route: Get User's Top Artists (Protected Route)
router.get("/top-artists", ensureAuthenticated, async (req, res) => {
  try {
    const accessToken = req.user.accessToken;

    const response = await axios.get("https://api.spotify.com/v1/me/top/artists", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching Spotify data:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch top artists" });
  }
});

// 🔹 Route: Get User's Top Tracks (Protected Route)
router.get("/top-tracks", ensureAuthenticated, async (req, res) => {
  try {
    const accessToken = req.user.accessToken;

    const response = await axios.get("https://api.spotify.com/v1/me/top/tracks", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching Spotify data:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch top tracks" });
  }
});

// Route to fetch user data from Spotify and save it
router.get('/user-data', ensureAuthenticated, async (req, res) => {
  try {
    const accessToken = req.user.accessToken;

    // Fetch user's top artists and tracks from Spotify
    const [topArtists, topTracks] = await Promise.all([
      axios.get('https://api.spotify.com/v1/me/top/artists', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      axios.get('https://api.spotify.com/v1/me/top/tracks', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    const userData = {
      spotify_id: req.user.profile.id, // Make sure this is the correct path to the user ID
      email: req.user.profile.emails?.[0]?.value || "N/A",
      top_artists: topArtists.data.items,
      top_tracks: topTracks.data.items,
    };

    // Save user data to MongoDB
    const saveResponse = await axios.post('http://localhost:5000/save-user-data', userData);
    res.status(200).json(saveResponse.data);
  } catch (err) {
    console.error('Error fetching or saving user data', err);
    res.status(500).json({ error: 'Failed to fetch or save user data' });
  }
});

// 🔹 Route: Refresh and Update User Preference Data
router.get('/refresh-user-data', ensureAuthenticated, async (req, res) => {
  try {
    const User = require('../models/User'); // Import User model
    const accessToken = req.user.accessToken;

    // Fetch user's top artists and tracks from Spotify
    const [topArtists, topTracks] = await Promise.all([
      axios.get('https://api.spotify.com/v1/me/top/artists', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      axios.get('https://api.spotify.com/v1/me/top/tracks', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    // Process artist data
    const processedArtists = topArtists.data.items.map((artist, index) => ({
      name: artist.name,
      spotify_id: artist.id,
      popularity: artist.popularity,
      preference_rank: index + 1,
      genres: artist.genres || []
    }));

    // Process track data
    const processedTracks = topTracks.data.items.map((track, index) => ({
      name: track.name,
      spotify_id: track.id,
      artists: track.artists.map(a => a.name),
      preference_rank: index + 1
    }));

    // Find and update user in database
    const user = await User.findOne({ spotify_id: req.user.profile.id });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user data
    user.top_artists = processedArtists;
    user.top_tracks = processedTracks;
    user.last_preference_update = new Date();

    // Calculate and update fan score
    user.fan_score = user.calculateFanScore();

    // Save updated user
    await user.save();

    res.status(200).json({ 
      message: 'User preferences updated successfully',
      fan_score: user.fan_score
    });

  } catch (err) {
    console.error('Error refreshing user data', err);
    res.status(500).json({ error: 'Failed to refresh user data' });
  }
});

module.exports = router;
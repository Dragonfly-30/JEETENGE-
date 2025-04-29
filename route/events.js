// Updated events.js route file to include user preference ranking
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const axios = require('axios');

// Get all events - with optional user preference ranking
router.get('/events', async (req, res) => {
  try {
    // Get events, sorted by date as a default
    const events = await Event.find().sort({ date: 1 }); // Sort by date ascending
    
    // Check if we have a logged-in user with Spotify token
    if (req.isAuthenticated() && req.user && req.user.accessToken) {
      try {
        // Fetch user's top artists from Spotify
        const topArtists = await axios.get("https://api.spotify.com/v1/me/top/artists", {
          headers: {
            Authorization: `Bearer ${req.user.accessToken}`,
          },
        });
        
        // If we have top artists data, rank the events
        if (topArtists.data && topArtists.data.items && topArtists.data.items.length > 0) {
          const rankedEvents = rankEventsByUserPreference(events, topArtists.data.items);
          return res.json(rankedEvents);
        }
      } catch (spotifyError) {
        // If there's an error with Spotify, just return unranked events
        console.error('Error fetching Spotify data for ranking:', spotifyError.message);
      }
    }
    
    // Return unranked events if no user or Spotify data
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Helper function to rank events based on user preferences
 */
function rankEventsByUserPreference(events, topArtists) {
  // Clone events to avoid modifying original data
  const rankedEvents = JSON.parse(JSON.stringify(events));
  
  // Calculate a relevance score for each event
  rankedEvents.forEach(event => {
    // Default score if no match
    let relevanceScore = 0;
    const eventArtist = event.artistName.toLowerCase();
    
    // Check if this event's artist is in user's top artists
    const matchingArtistIndex = topArtists.findIndex(artist => 
      eventArtist.includes(artist.name.toLowerCase()) || 
      artist.name.toLowerCase().includes(eventArtist)
    );
    
    if (matchingArtistIndex !== -1) {
      const matchingArtist = topArtists[matchingArtistIndex];
      
      // Calculate score based on artist position and popularity
      // Lower index = higher preference, max score 100
      const positionScore = Math.max(0, 100 - (matchingArtistIndex * 5));
      
      // Popularity score (0-100 directly from Spotify)
      const popularityScore = matchingArtist.popularity;
      
      // Combined score with position weighted more heavily than general popularity
      relevanceScore = (positionScore * 0.7) + (popularityScore * 0.3);
    }
    
    // Add the score to the event object
    event.userRelevanceScore = Math.round(relevanceScore);
  });
  
  // Sort events by relevance score (highest first)
  rankedEvents.sort((a, b) => {
    // If scores are equal, sort by date
    if (b.userRelevanceScore === a.userRelevanceScore) {
      return new Date(a.date) - new Date(b.date);
    }
    // Otherwise sort by score
    return b.userRelevanceScore - a.userRelevanceScore;
  });
  
  return rankedEvents;
}

// Get event by ID (keeping original code)
router.get('/events/:eventId', async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.eventId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Book tickets endpoint (keeping original code)
// Book tickets endpoint with attendee information
router.post('/book-ticket', async (req, res) => {
  try {
    const { eventId, tickets, attendee } = req.body;
    
    // Validate inputs
    if (!eventId || !tickets || tickets < 1) {
      return res.status(400).json({ message: 'Invalid request: missing event ID or tickets' });
    }
    
    // Validate attendee information if provided
    if (attendee) {
      if (!attendee.name || !attendee.email) {
        return res.status(400).json({ message: 'Invalid request: missing attendee information' });
      }
    }
    
    const event = await Event.findOne({ eventId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.availableTickets < tickets) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }
    
    // Update available tickets
    event.availableTickets -= tickets;
    await event.save();
    
    // In a real app, you'd also create a ticket record for the user
    // For example:
    /*
    const ticketRecord = new Ticket({
      eventId: event._id,
      userId: req.user._id, // If user is authenticated
      quantity: tickets,
      attendee: attendee,
      totalPrice: event.ticketPrice * tickets,
      purchaseDate: new Date(),
      confirmationCode: `TICKET-${eventId}-${Date.now().toString().slice(-6)}`
    });
    await ticketRecord.save();
    */
    
    res.json({
      success: true,
      message: `Successfully booked ${tickets} tickets for ${event.eventName}`,
      event,
      // You could include the ticket information here
      // ticket: ticketRecord
    });
    
  } catch (error) {
    console.error('Error booking tickets:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  spotify_id: { type: String, required: true, unique: true },
  email: { type: String, required: true },  // Removed unique constraint from email
  fan_score: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  // New fields to store user preferences
  top_artists: [{
    name: String,
    spotify_id: String,
    popularity: Number,
    preference_rank: Number,
    genres: [String]
  }],
  top_tracks: [{
    name: String,
    spotify_id: String,
    artists: [String],
    preference_rank: Number
  }],
  last_preference_update: { type: Date },
  // Track user's ticket history
  tickets: [{
    eventId: String,
    eventName: String,
    artistName: String,
    date: Date,
    quantity: Number,
    purchaseDate: { type: Date, default: Date.now }
  }]
});

// Calculate fan score based on user preferences and ticket history
userSchema.methods.calculateFanScore = function() {
  // Base score
  let score = 10;
  
  // Add points for each top artist (more points for higher ranked artists)
  if (this.top_artists && this.top_artists.length > 0) {
    this.top_artists.forEach((artist, index) => {
      // More points for higher-ranked artists (index 0 = highest rank)
      score += Math.max(0, 5 - (index * 0.5));
    });
  }
  
  // Add points for ticket purchase history
  if (this.tickets && this.tickets.length > 0) {
    // Each ticket adds some points
    score += this.tickets.length * 2;
    
    // Recent tickets count more
    const now = new Date();
    const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
    
    const recentTickets = this.tickets.filter(ticket => 
      ticket.purchaseDate >= oneMonthAgo
    );
    
    score += recentTickets.length * 3;
  }
  
  // Cap the score at 100
  this.fan_score = Math.min(100, Math.round(score));
  return this.fan_score;
};

module.exports = mongoose.model('User', userSchema);
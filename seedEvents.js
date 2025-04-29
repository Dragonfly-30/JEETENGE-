require("dotenv").config();
const mongoose = require('mongoose');
const connectDB = require('./db');

// Connect to MongoDB
connectDB();

// Import Event model
const Event = require('./models/Event');

// Event image URLs (placeholder URLs - replace with actual image URLs)
const eventImages = [
    '/images/Arijit_Singh.avif',
    '/images/Neha_kakkar.jpeg',
    '/images/badshah.webp',
    '/images/AR_Rahman.jpg',
    '/images/Shreya_ghosal.avif',
    '/images/Divine.webp',
    '/images/Sonu_Nigam.jpg',
    '/images/Mohit_chauhan.jpeg',
    '/images/Aastha_Gill.jpeg',
    '/images/Amit_Trivedi.jpeg',
    '/images/Darshan_Raval.jpeg',
    '/images/Diljit_Dosanjh.jpeg',
    '/images/Honey_Singh.jpeg',
    '/images/Jonita_Gandhi.jpeg',
    '/images/Mika_Singh.jpeg',
    '/images/Pritam.jpeg',
    '/images/Raftaar.jpeg',
    '/images/Shaan.jpeg',
    '/images/Sunidhi_Chauhan.jpeg',
  ];


// Fake events data
const fakeEvents = [
  {
    eventId: 'event1',
    artistName: 'Arijit Singh',
    eventName: 'Arijit Live in Concert',
    date: new Date('2023-12-15T19:00:00'),
    venue: 'Delhi Stadium',
    ticketPrice: 1500,
    totalTickets: 1000,
    availableTickets: 1000,
    imageUrl: eventImages[0] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event2',
    artistName: 'Neha Kakkar',
    eventName: 'Neha Kakkar World Tour',
    date: new Date('2023-12-22T20:00:00'),
    venue: 'Mumbai Arena',
    ticketPrice: 2000,
    totalTickets: 800,
    availableTickets: 650,
    imageUrl: eventImages[1] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event3',
    artistName: 'Badshah',
    eventName: 'Badshah Rap Night',
    date: new Date('2023-12-30T21:00:00'),
    venue: 'Bengaluru Stadium',
    ticketPrice: 1800,
    totalTickets: 1200,
    availableTickets: 900,
    imageUrl: eventImages[2] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event4',
    artistName: 'A.R. Rahman',
    eventName: 'Rahman Musical Night',
    date: new Date('2024-01-05T19:30:00'),
    venue: 'Chennai Auditorium',
    ticketPrice: 2500,
    totalTickets: 1500,
    availableTickets: 1500,
    imageUrl: eventImages[3] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event5',
    artistName: 'Shreya Ghoshal',
    eventName: 'Melody Queen Live',
    date: new Date('2024-01-15T18:00:00'),
    venue: 'Hyderabad Convention Center',
    ticketPrice: 1700,
    totalTickets: 900,
    availableTickets: 750,
    imageUrl: eventImages[4] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event6',
    artistName: 'Divine',
    eventName: 'Gully Gang Tour',
    date: new Date('2024-01-28T20:30:00'),
    venue: 'Pune Music Arena',
    ticketPrice: 1600,
    totalTickets: 800,
    availableTickets: 800,
    imageUrl: eventImages[5] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event7',
    artistName: 'Sonu Nigam',
    eventName: 'Sonu Nigam Unplugged',
    date: new Date('2024-02-10T19:00:00'),
    venue: 'Kolkata Stadium',
    ticketPrice: 2200,
    totalTickets: 1100,
    availableTickets: 980,
    imageUrl: eventImages[6] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event8',
    artistName: 'Mohit Chauhan',
    eventName: 'Mohit Chauhan Soul Strings',
    date: new Date('2024-11-11T20:00:00'),
    venue: 'Ahmedabad Live Grounds',
    ticketPrice: 1899,
    totalTickets: 950,
    availableTickets: 900,
    imageUrl: eventImages[7] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event9',
    artistName: 'Aastha Gill',
    eventName: 'Aastha Gill Pop Night',
    date: new Date('2024-12-01T19:30:00'),
    venue: 'Jaipur Sound City',
    ticketPrice: 1299,
    totalTickets: 800,
    availableTickets: 780,
    imageUrl: eventImages[8] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event10',
    artistName: 'Amit Trivedi',
    eventName: 'Amit Trivedi Musical Vibes',
    date: new Date('2025-01-05T19:00:00'),
    venue: 'Lucknow Harmony Grounds',
    ticketPrice: 2100,
    totalTickets: 1150,
    availableTickets: 1100,
    imageUrl: eventImages[9] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event11',
    artistName: 'Darshan Raval',
    eventName: 'Darshan Raval Love Night',
    date: new Date('2025-02-14T19:00:00'),
    venue: 'Indore Musical Square',
    ticketPrice: 1599,
    totalTickets: 1000,
    availableTickets: 940,
    imageUrl: eventImages[10] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event12',
    artistName: 'Diljit Dosanjh',
    eventName: 'Diljit Live Desi Beats',
    date: new Date('2025-03-09T20:00:00'),
    venue: 'Ludhiana Melody Grounds',
    ticketPrice: 2299,
    totalTickets: 1400,
    availableTickets: 1300,
    imageUrl: eventImages[11] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event13',
    artistName: 'Honey Singh',
    eventName: 'Yo Yo Honey Singh Party Anthem',
    date: new Date('2025-03-22T18:30:00'),
    venue: 'Goa Beach Arena',
    ticketPrice: 1799,
    totalTickets: 1200,
    availableTickets: 1120,
    imageUrl: eventImages[12] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event14',
    artistName: 'Jonita Gandhi',
    eventName: 'Jonita Gandhi - Melody Unplugged',
    date: new Date('2025-04-05T19:30:00'),
    venue: 'Nagpur City Center',
    ticketPrice: 1399,
    totalTickets: 950,
    availableTickets: 890,
    imageUrl: eventImages[13] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event15',
    artistName: 'Mika Singh',
    eventName: 'Mika Singh Punjabi Night',
    date: new Date('2025-04-20T20:00:00'),
    venue: 'Amritsar Music Arena',
    ticketPrice: 2000,
    totalTickets: 1100,
    availableTickets: 1000,
    imageUrl: eventImages[14] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event16',
    artistName: 'Pritam',
    eventName: 'Pritam Hit Parade',
    date: new Date('2025-05-11T19:00:00'),
    venue: 'Bhopal Harmony Grounds',
    ticketPrice: 2099,
    totalTickets: 1300,
    availableTickets: 1220,
    imageUrl: eventImages[15] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event17',
    artistName: 'Raftaar',
    eventName: 'Raftaar Rhyme Riot',
    date: new Date('2025-06-01T19:00:00'),
    venue: 'Patna Urban Beats Arena',
    ticketPrice: 1699,
    totalTickets: 1000,
    availableTickets: 950,
    imageUrl: eventImages[16] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event18',
    artistName: 'Shaan',
    eventName: 'Shaan Golden Melodies',
    date: new Date('2025-06-15T20:00:00'),
    venue: 'Chennai Soul Center',
    ticketPrice: 1499,
    totalTickets: 1100,
    availableTickets: 1050,
    imageUrl: eventImages[17] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event19',
    artistName: 'Sunidhi Chauhan',
    eventName: 'Sunidhi Chauhan Rock Night',
    date: new Date('2025-07-07T19:30:00'),
    venue: 'Surat Festival Ground',
    ticketPrice: 1899,
    totalTickets: 1150,
    availableTickets: 1000,
    imageUrl: eventImages[18] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event20',
    artistName: 'Neha Kakkar',
    eventName: 'Neha Kakkar Dance Fiesta',
    date: new Date('2025-08-12T19:00:00'),
    venue: 'Ranchi Soundscape Dome',
    ticketPrice: 1599,
    totalTickets: 1000,
    availableTickets: 940,
    imageUrl: eventImages[1] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event21',
    artistName: 'AR Rahman',
    eventName: 'AR Rahman - Symphony of Stars',
    date: new Date('2025-09-01T20:00:00'),
    venue: 'Hyderabad Musical Arena',
    ticketPrice: 2499,
    totalTickets: 1600,
    availableTickets: 1500,
    imageUrl: eventImages[3] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event22',
    artistName: 'Divine',
    eventName: 'Divine - Gully Beats Live',
    date: new Date('2025-09-20T19:30:00'),
    venue: 'Mumbai Gully Grounds',
    ticketPrice: 1799,
    totalTickets: 1200,
    availableTickets: 1100,
    imageUrl: eventImages[5] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event23',
    artistName: 'Aastha Gill',
    eventName: 'Aastha Gill Pop Vibes',
    date: new Date('2025-10-05T18:00:00'),
    venue: 'Ahmedabad Concert Hall',
    ticketPrice: 1399,
    totalTickets: 900,
    availableTickets: 860,
    imageUrl: eventImages[8] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event24',
    artistName: 'Amit Trivedi',
    eventName: 'Amit Trivedi Indie Night',
    date: new Date('2025-10-18T20:00:00'),
    venue: 'Delhi Indie Stage',
    ticketPrice: 1899,
    totalTickets: 1100,
    availableTickets: 1020,
    imageUrl: eventImages[9] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event25',
    artistName: 'Mohit Chauhan',
    eventName: 'Mohit Chauhan Soul Session',
    date: new Date('2025-11-01T19:00:00'),
    venue: 'Pune Music Dome',
    ticketPrice: 1599,
    totalTickets: 950,
    availableTickets: 910,
    imageUrl: eventImages[7] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event26',
    artistName: 'Shreya Ghoshal',
    eventName: 'Shreya Ghoshal Melody Magic',
    date: new Date('2025-11-20T19:00:00'),
    venue: 'Kolkata Melody Theatre',
    ticketPrice: 2199,
    totalTickets: 1400,
    availableTickets: 1300,
    imageUrl: eventImages[4] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event27',
    artistName: 'Pritam',
    eventName: 'Pritam Live Bollywood Beats',
    date: new Date('2025-12-05T19:30:00'),
    venue: 'Bangalore Sound Arena',
    ticketPrice: 1999,
    totalTickets: 1350,
    availableTickets: 1250,
    imageUrl: eventImages[15] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event28',
    artistName: 'Jonita Gandhi',
    eventName: 'Jonita Gandhi Midnight Notes',
    date: new Date('2025-12-20T20:00:00'),
    venue: 'Chandigarh Night Garden',
    ticketPrice: 1499,
    totalTickets: 1000,
    availableTickets: 940,
    imageUrl: eventImages[13] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event29',
    artistName: 'Mika Singh',
    eventName: 'Mika Singh Full Power',
    date: new Date('2026-01-10T19:00:00'),
    venue: 'Jaipur Arena Dome',
    ticketPrice: 1799,
    totalTickets: 1100,
    availableTickets: 990,
    imageUrl: eventImages[14] || '/images/concert-placeholder.jpg'
  },
  {
    eventId: 'event30',
    artistName: 'Raftaar',
    eventName: 'Raftaar - Desi Flow',
    date: new Date('2026-01-25T19:30:00'),
    venue: 'Lucknow Urban Stage',
    ticketPrice: 1699,
    totalTickets: 1050,
    availableTickets: 980,
    imageUrl: eventImages[16] || '/images/concert-placeholder.jpg'
  },
];

// Function to seed database
async function seedDatabase() {
  try {
    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events from database');
    
    // Insert new events
    const result = await Event.insertMany(fakeEvents);
    console.log(`Successfully seeded ${result.length} events to database`);
    
    // Display all events
    const allEvents = await Event.find({});
    console.log('All events in database:');
    allEvents.forEach(event => {
      console.log(`- ${event.eventName} by ${event.artistName} on ${event.formattedDate}`);
    });
    
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
}

// Run the seeding function
seedDatabase();

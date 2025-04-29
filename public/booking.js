// Booking Page Script
document.addEventListener("DOMContentLoaded", async () => {
    // Setup sidebar functionality
    setupSidebar();
    
    // Fetch user data to personalize the page
    await fetchUserData();
    
    // Get event ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    
    if (!eventId) {
      // No event ID provided, show error
      showBookingError("No event was selected. Please go back and select an event.");
      return;
    }
    
    // Load event details
    await loadEventDetails(eventId);
    
    // Set up form event handlers
    setupFormHandlers();
  });
  
  // Load Event Details from the server
  async function loadEventDetails(eventId) {
    try {
      const eventLoading = document.getElementById('event-loading');
      const eventDetails = document.getElementById('event-details');
      
      // Show loading state
      eventLoading.style.display = 'block';
      eventDetails.style.display = 'none';
      
      // Fetch event details
      const response = await fetch(`/api/events/${eventId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch event details. Status: ${response.status}`);
      }
      
      const event = await response.json();
      
      // Populate event details
      document.getElementById('event-name').textContent = event.eventName;
      document.getElementById('event-artist').textContent = event.artistName;
      document.getElementById('event-date').textContent = formatDate(event.date);
      document.getElementById('event-venue').textContent = event.venue;
      document.getElementById('event-price').textContent = event.ticketPrice.toFixed(2);
      document.getElementById('per-ticket-price').textContent = event.ticketPrice.toFixed(2);
      document.getElementById('tickets-available').textContent = event.availableTickets;
      document.getElementById('tickets-total').textContent = event.totalTickets;
      document.getElementById('ticket-total').textContent = event.ticketPrice.toFixed(2);
      document.getElementById('booking-event-id').value = event.eventId;
      
      // Update page title
      document.title = `Book: ${event.eventName} - Music Event Platform`;
      
      // Set event image with fallback
      const eventImage = document.getElementById('event-image');
      let imageUrl = event.imageUrl || '/images/concert-placeholder.jpg';
      // Remove 'public/' prefix if it exists
      imageUrl = imageUrl.replace('public/', '');
      eventImage.src = imageUrl;
      eventImage.onerror = function() {
        this.src = '/images/concert-placeholder.jpg';
      };
      
      // Update quantity input max attribute based on available tickets
      const quantityInput = document.getElementById('ticket-quantity');
      quantityInput.max = Math.min(event.availableTickets, 10); // Max 10 tickets per booking or available tickets
      
      if (event.availableTickets <= 0) {
        // No tickets available
        showBookingError("Sorry, this event is sold out.");
        return;
      }
      
      // Hide loading state and show event details
      eventLoading.style.display = 'none';
      eventDetails.style.display = 'block';
      
    } catch (error) {
      console.error("Error loading event details:", error);
      showBookingError("Failed to load event details. Please try again later.");
    }
  }
  
  // Set up form handlers
  function setupFormHandlers() {
    // Handle quantity change to update total price
    const quantityInput = document.getElementById('ticket-quantity');
    if (quantityInput) {
      quantityInput.addEventListener('change', () => {
        updateTotalPrice();
      });
      
      // Also handle input event for spinners
      quantityInput.addEventListener('input', () => {
        updateTotalPrice();
      });
    }
    
    // Handle form submission
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
      bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await processBooking();
      });
    }
    
    // Handle retry button
    const retryButton = document.getElementById('retry-booking');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        // Hide error and show form again
        document.getElementById('booking-error').style.display = 'none';
        document.getElementById('event-details').style.display = 'block';
      });
    }
  }
  
  // Update total price based on quantity
  function updateTotalPrice() {
    const quantity = parseInt(document.getElementById('ticket-quantity').value);
    const pricePerTicket = parseFloat(document.getElementById('per-ticket-price').textContent);
    const totalPrice = (quantity * pricePerTicket).toFixed(2);
    document.getElementById('ticket-total').textContent = totalPrice;
  }
  
  // Process booking submission
  async function processBooking() {
    try {
      const eventId = document.getElementById('booking-event-id').value;
      const tickets = parseInt(document.getElementById('ticket-quantity').value);
      const attendeeName = document.getElementById('attendee-name').value;
      const attendeeEmail = document.getElementById('attendee-email').value;
      const attendeePhone = document.getElementById('attendee-phone').value;
      
      // Basic validation
      if (!attendeeName || !attendeeEmail || !attendeePhone) {
        alert('Please fill in all fields.');
        return;
      }
      
      // Submit booking to server
      const response = await fetch('/api/book-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          eventId, 
          tickets,
          attendee: {
            name: attendeeName,
            email: attendeeEmail,
            phone: attendeePhone
          }
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to book tickets');
      }
      
      // Show confirmation
      showBookingConfirmation({
        eventName: result.event.eventName,
        tickets: tickets,
        email: attendeeEmail,
        confirmationCode: `TICKET-${eventId}-${Date.now().toString().slice(-6)}`
      });
      
    } catch (error) {
      console.error('Error processing booking:', error);
      showBookingError(error.message || 'An error occurred while processing your booking. Please try again.');
    }
  }
  
  // Show booking confirmation
  function showBookingConfirmation(data) {
    document.getElementById('event-details').style.display = 'none';
    document.getElementById('booking-error').style.display = 'none';
    
    const confirmationSection = document.getElementById('booking-confirmation');
    
    // Populate confirmation details
    document.getElementById('confirmation-event-name').textContent = data.eventName;
    document.getElementById('confirmation-tickets').textContent = data.tickets;
    document.getElementById('confirmation-email').textContent = data.email;
    
    // Generate QR code
    if (window.QRCode) {
      const qrContainer = document.getElementById('qrcode');
      qrContainer.innerHTML = ''; // Clear previous QR code if any
      
      new QRCode(qrContainer, {
        text: data.confirmationCode,
        width: 128,
        height: 128
      });
    }
    
    // Show confirmation
    confirmationSection.style.display = 'block';
    
    // Scroll to top of confirmation
    confirmationSection.scrollIntoView({ behavior: 'smooth' });
  }
  
  // Show booking error
  function showBookingError(message) {
    document.getElementById('event-loading').style.display = 'none';
    document.getElementById('event-details').style.display = 'none';
    document.getElementById('booking-confirmation').style.display = 'none';
    
    const errorSection = document.getElementById('booking-error');
    document.getElementById('error-message').textContent = message;
    errorSection.style.display = 'block';
  }
  
  // Format date nicely
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', weekday: 'long' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }
  
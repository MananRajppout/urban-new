const axios = require('axios');

/**
 * Book an appointment on cal.com calendar
 * @param {string} calApiKey - The API key for authentication (with 'cal_' prefix)
 * @param {object} bookingData - The booking data (event type, start time, attendee details, etc.)
 * @returns {object} - Response data from the API
 */
const bookAppointment = async function ({calApiKey, bookingData}) {
    // console.log('Booking Appointment: ', calApiKey, ': ', bookingData);
    const url = `https://api.cal.com/v2/bookings`;
    const headers = {
        'Authorization': `Bearer ${calApiKey}`, // Secure API key handling
        'cal-api-version': '2024-08-13',        // Required API version
        'Content-Type': 'application/json',
    };

    try {
        // Make API request to book the appointment
        const response = await axios.post(url, bookingData, { headers });
        
        if (response.data.status === 'success') {
            // console.log('Appointment booked successfully:', response.data.data);
            return JSON.stringify(response.data.data); // Return the booking details
        } else {
            // console.error('Failed to book appointment:', response.data);
            return JSON.stringify({ success: false, message: 'Booking could not be completed.' });
        }
    } catch (error) {
        // console.error('Error booking appointment:', error.response ? error.response.data.error.message : error.message);
        return JSON.stringify({ success: false, message: `There was an issue booking the appointment. Please try again later. Error: ${error.response ? error.response.data.error.message : error.message}` });
    }
};

module.exports = bookAppointment;

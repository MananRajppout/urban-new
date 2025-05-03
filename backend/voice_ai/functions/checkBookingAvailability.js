const axios = require('axios');

/**
 * Check the availability on cal.com calendar for a specific time slot
 * @param {string} calApiKey - The API key for authentication (with 'cal_' prefix)
 * @param {string} dateTime - The requested booking date and time in ISO 8601 format
 * @returns {boolean} - True if the time slot is available, false otherwise
 */
const checkBookingAvailability = async function ({calApiKey, dateTime}) {
    // console.log("Check availability: ", dateTime, ': ',calApiKey);
    const url = `https://api.cal.com/v2/bookings`;
    const headers = {
        'Authorization': `Bearer ${calApiKey}`, // Secure API key handling
        'cal-api-version': '2024-08-13', // Required API version
    };
    
    const params = {
        afterStart: dateTime,
        beforeEnd: new Date(new Date(dateTime).getTime() + 15 * 60 * 1000).toISOString(), // 15-minute window
        sortStart: 'asc', // Sort results by start time in ascending order
        status: 'upcoming', // Only consider upcoming bookings
    };

    try {
        // Fetch bookings in the given time range
        const response = await axios.get(url, { headers, params });
        const bookings = response.data.data;

        // Check if the requested time slot is available
        const isAvailable = bookings.every(booking => {
            const bookingStart = new Date(booking.startTime).getTime();
            const bookingEnd = new Date(booking.endTime).getTime();
            const requestedStart = new Date(dateTime).getTime();
            const requestedEnd = requestedStart + 15 * 60 * 1000;

            return JSON.stringify((requestedEnd <= bookingStart || requestedStart >= bookingEnd)); // No overlap
        });

        if (isAvailable) {
            // console.log('Time slot is available');
            return 'Time slot is available';
        } else {
            // console.log('Time slot is unavailable');
            return 'Time slot is unavailable';
        }
    } catch (error) {
        // console.error('Error checking booking availability:', error.response ? error.response.data.error.message : error.message);
        return 'Error checking booking availability: ' + (error.response ? error.response.data.error.message : error.message);
    }
};

module.exports = checkBookingAvailability;

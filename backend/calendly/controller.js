const { default: axios } = require("axios");
const catchAsyncError = require("../middleware/catchAsyncError");
const { BookedMeeting } = require("./model");

exports.fetchCalendlyProfile = catchAsyncError(async (req, res, next) => {
  const userName = req.params.user_name;
  console.log("userName", userName);
  const url = `https://calendly.com/api/booking/profiles/${userName}`;

  try {
    const response = await axios.get(url);
    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching Calendly profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Calendly profile",
    });
  }
});

// New API endpoint to fetch all event types for a given user
exports.fetchEventTypes = catchAsyncError(async (req, res, next) => {
  const userName = req.params.user_name;
  console.log("Fetching event types for user:", userName);
  const url = `https://calendly.com/api/booking/profiles/${userName}/event_types`;

  try {
    const response = await axios.get(url);
    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching event types:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event types",
    });
  }
});

// New API endpoint to fetch available slots for a specific event type
exports.fetchAvailableSlots = catchAsyncError(async (req, res, next) => {
  const eventTypeUuid = req.params.event_type_uuid;
  const timezone = encodeURIComponent(req.query.timezone || "Asia/Calcutta");
  const diagnostics = req.query.diagnostics || "false";
  const rangeStart = req.query.range_start;
  const rangeEnd = req.query.range_end;
  const schedulingLinkUuid = req.query.scheduling_link_uuid;

  const url = `https://calendly.com/api/booking/event_types/${eventTypeUuid}/calendar/range?timezone=${timezone}&diagnostics=${diagnostics}&range_start=${rangeStart}&range_end=${rangeEnd}&scheduling_link_uuid=${schedulingLinkUuid}`;
  console.log(url);
  try {
    const response = await axios.get(url);
    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching calendar range:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch calendar range",
    });
  }
});

exports.bookMeeting = catchAsyncError(async (req, res, next) => {
    try {
        const {
            // browser,
            // device,
            chatbot_id,
            start_time,
            full_name,
            email,
            timezone,
            event_type_uuid,
            // recaptcha_token,
            // fingerprint
        } = req.body;

        const payload = {
            analytics: {
                "booking_flow": "v3",
                // "browser": browser,
                // "device": device,
                "fields_filled": 2, 
                "fields_presented": 1,
                "invitee_landed_at": new Date().toISOString(),
                "referrer_page": "profile_page",
                "seconds_to_convert": 545
            },
            embed: {},
            event: {
                guests: {},
                location_configuration: {
                    location: "",
                    phone_number: "",
                    additional_info: ""
                },
                start_time: start_time
            },
            event_fields: [],
            event_type_uuid: event_type_uuid,
            invitee: {
                timezone: timezone,
                time_notation: "12h",
                full_name: full_name,
                email: email
            },
            payment_token: {},
            scheduling_link_uuid: "ck6n-6t5-cct",
            // recaptcha_token: recaptcha_token,
            single_use_slug: null,
            tracking: {
                // fingerprint: fingerprint
            }
        };

        const response = await axios.post('https://calendly.com/api/booking/invitees', payload);
        console.log('response',response.data,response.status)
        if(response.status==200){
          // Create a new booked meeting instance
          const newBooking = new BookedMeeting({
              start_time,
              full_name,
              email,
              event_type_uuid,
              chatbot_id
          });
  
          // Save the booked meeting to the database
          await newBooking.save();
        }
   
        res.status(201).send({
            success: true,
            message: "Meeting booked successfully",
            data: response.data
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Failed to book meeting",
            data: error?.response?.data
        });
    }
});


// Step 4: Create an API endpoint to fetch all appointments for a given user
exports.fetchUserAppointments = catchAsyncError(async (req, res, next) => {
  try {
      // Get the chatbot_id, startTime, and endTime from the query parameters
      const { chatbot_id, startTime, endTime } = req.query;

      // Construct the query object
      const query = { id: chatbot_id };
      
      // Add date range filtering if both startTime and endTime are provided
      if (startTime && endTime) {
          // Parse the dates and set the start time to the beginning of the day and end time to the end of the day
          const start = new Date(startTime);
          start.setUTCHours(0, 0, 0, 0);

          const end = new Date(endTime);
          end.setUTCHours(23, 59, 59, 999);

          query.start_time = {
              $gte: start,
              $lte: end
          };
      }

      // Fetch all appointments for the given chatbot_id and date range from the database
      const appointments = await BookedMeeting.find(query);

      res.status(200).json({
          success: true,
          data: appointments,
      });
  } catch (error) {
      console.error("Error fetching user appointments:", error);
      res.status(500).json({
          success: false,
          message: "Failed to fetch user appointments",
      });
  }
});

const tools = [
  {
    type: "function",
    function: {
      name: "transferCall",
      description:
        "Initiate a call transfer when the customer requests to speak with someone else or indicates dissatisfaction, such as saying 'Connect me to someone else,' 'I want to talk to someone else,' or 'You are not being helpful.'",
      parameters: {
        type: "object",
        properties: {
          callSid: {
            type: "string",
            description: "The unique identifier for the active phone call.",
          },
          transferNumber: {
            type: "string",
            description:
              "The phone number to which the call will be transferred.",
          },
          response: {
            type: "string",
            description:
              "your last response to deliver to the customer before transferring the call, letting them know that you're transferring the call",
          },
        },
        required: ["callSid", "transferNumber", "response"],
      },
      returns: {
        type: "object",
        properties: {
          status: {
            type: "string",
            description:
              "Indicates whether the call was successfully transferred.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "endCall",
      description:
        "Invoke this function when the customer confirms the end of the conversation.",
      parameters: {
        type: "object",
        properties: {
          callSid: {
            type: "string",
            description: "The unique identifier for the active phone call.",
          },
          response: {
            type: "string",
            description:
              "A mandatory polite farewell greeting to deliver to the customer before ending the call.",
          },
        },
        required: ["callSid", "response"],
      },
      returns: {
        type: "object",
        properties: {
          status: {
            type: "string",
            description: "Indicates whether the call was successfully ended.",
          },
        },
      },
    },
  },
];

//   {
//     type: "function",
//     function: {
//       name: "checkBookingAvailability",
//       description: "Checks if the requested date and time are available for booking.",
//       parameters: {
//         type: "object",
//         properties: {
//           calApiKey: {
//             type: "string",
//             description: "API key for the booking service"
//           },
//           dateTime: {
//             type: "string",
//             description: "The timestamp of the appointment that is available for booking."
//           }
//         },
//         required: ["calApiKey", "dateTime"]
//       },
//       returns: {
//         type: "boolean",
//         description: "Returns true if the time slot is available, false if it is booked or unavailable."
//       }
//     }
//   },
//   {
//     type: "function",
//     function: {
//         name: "bookAppointment",
//         description: "Books an appointment on the Cal.com calendar using the provided event type and attendee details.",
//         parameters: {
//             type: "object",
//             properties: {
//                 calApiKey: {
//                     type: "string",
//                     description: "API key for authenticating the booking request. It must start with 'cal_' and should be provided in the Bearer token format."
//                 },
//                 bookingData: {
//                     type: "object",
//                     description: "The data for the booking, including the start time, event type ID, attendee details, and other optional parameters.",
//                     properties: {
//                         start: {
//                             type: "string",
//                             description: "The start time of the booking in ISO 8601 format (UTC timezone).",
//                             example: "2024-10-10T13:00:00Z"
//                         },
//                         eventTypeId: {
//                             type: "number",
//                             description: "The ID of the event type for the booking.",
//                             example: 1208191
//                         },
//                         attendee: {
//                             type: "object",
//                             description: "The attendee's details for the booking.",
//                             properties: {
//                                 name: {
//                                     type: "string",
//                                     description: "The name of the attendee.",
//                                     example: "John Doe"
//                                 },
//                                 email: {
//                                     type: "string",
//                                     description: "The email address of the attendee.",
//                                     example: "John@gmail.com"
//                                 },
//                                 timeZone: {
//                                     type: "string",
//                                     description: "The attendee's time zone.",
//                                     example: "Asia/Kolkata"
//                                 }
//                             },
//                             required: ["name", "email", "timeZone"]
//                         },
//                         guests: {
//                             type: "array",
//                             description: "An optional list of guest email addresses attending the event.",
//                             items: {
//                                 type: "string"
//                             }
//                         },
//                         meetingUrl: {
//                             type: "string",
//                             description: "Optional custom meeting URL. If not provided, Cal's default meeting link will be used."
//                         },
//                         bookingFieldsResponses: {
//                             type: "object",
//                             description: "Optional custom field responses for the booking.",
//                             additionalProperties: {
//                                 type: "string"
//                             }
//                         }
//                     },
//                     required: ["start", "eventTypeId", "attendee"]
//                 }
//             },
//             required: ["calApiKey", "bookingData"]
//         },
//         returns: {
//             type: "object",
//             properties: {
//                 success: {
//                     type: "boolean",
//                     description: "Whether the booking was successful."
//                 },
//                 message: {
//                     type: "string",
//                     description: "A confirmation or error message related to the booking."
//                 },
//                 data: {
//                     type: "object",
//                     description: "The booking data if successful.",
//                     properties: {
//                         id: {
//                             type: "string",
//                             description: "The ID of the booking."
//                         },
//                         start: {
//                             type: "string",
//                             description: "The start time of the booking in ISO 8601 format."
//                         },
//                         attendee: {
//                             type: "object",
//                             description: "Details of the attendee.",
//                             properties: {
//                                 name: {
//                                     type: "string",
//                                     description: "The name of the attendee."
//                                 },
//                                 email: {
//                                     type: "string",
//                                     description: "The email of the attendee."
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     }
//   }

module.exports = tools;

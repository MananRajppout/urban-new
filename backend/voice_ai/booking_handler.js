require("dotenv").config();
const { VoiceResponse } = require('twilio').twiml;
const { default: OpenAI } = require("openai");
const axios = require('axios');
const {getVoiceRespUrl} = require("./impl");
/**
 * BookingHandler class to manage the stages of booking a meeting.
 */
class BookingHandler {
    constructor(voiceInput, bookingDetails, AiAgentModel, res, conversationHistory) {
        this.voiceInput = voiceInput;
        this.bookingDetails = bookingDetails;
        this.AiAgentModel = AiAgentModel;
        this.res = res;
        this.conversationHistory = conversationHistory;
        this.twiml = new VoiceResponse();
        this.openai = new OpenAI({
            apiKey: "sk-proj-lQls5CirWlD8oi7lQVRzT3BlbkFJWnSOCJbrPd5IjpZeTqcu",
        });
        console.log('voice input is',this.voiceInput)
        console.log(bookingDetails);
    }

    /**
     * Book the meeting on cal.com calendar
     */
    async bookAppointment(calApiKey, bookingData) {
        const url = `https://api.cal.com/v1/bookings?apiKey=${calApiKey}`;
        console.log('Booking data ----->', bookingData, url);
        const response = await axios.post(url, bookingData);
        return response.data;
    }

    /**
     * CHaeck the availability on cal.com calendar
     */
    async findBookingByDate(calApiKey, date) {
        const url = `https://api.cal.com/v1/bookings`;
        const params = {
            apiKey: calApiKey,
            startTime: date,
            endTime: new Date(new Date(date).getTime() + (1/4) * 60 * 60 * 1000).toISOString() // Set end time to the next hour
        };

        try {
            const response = await axios.get(url, { params });
            return response.data; // This should include the booking details for the given date
        } catch (error) {
            console.error('Error finding booking by date:', error);
            throw error;
        }
    }

    async isTimeSlotAvailable(requestedStartTime, bookings) {
        // Convert the requested start time to milliseconds
        const requestedStart = new Date(requestedStartTime).getTime();
        // Calculate the end time based on the duration (15 minutes)
        const requestedEnd = requestedStart + 15 * 60 * 1000; // 15 minutes duration

        console.log('Requested Start Time (ms):', requestedStart);
        console.log('Requested End Time (ms):', requestedEnd);

        // Check for overlap with any existing bookings
        for (const booking of bookings) {
            const bookingStart = new Date(booking.startTime).getTime();
            const bookingEnd = new Date(booking.endTime).getTime();

            console.log('Booking Start Time (ms):', bookingStart);
            console.log('Booking End Time (ms):', bookingEnd);

            // Check if the requested time slot overlaps with the booking
            if (
                ((bookingStart >= requestedStart) && (bookingStart <= requestedEnd))
                ||
                ((bookingEnd >= requestedStart) && (bookingEnd <= requestedEnd))
            ) {
                // There is an overlap
                console.log('Overlap detected');
                return false;
            }
        }

        // No overlap found
        return true;
    }

    async updateFieldsFromResponse(response) {
        try {
            // Extract the JSON part from the response
            const jsonPartMatch = response.match(/\{.*\}/s);
            if (jsonPartMatch) {
                const jsonString = jsonPartMatch[0];
                const parsedJson = JSON.parse(jsonString);

                // Update booking details based on the parsed JSON
                if (parsedJson.name) this.bookingDetails.userName = parsedJson.name.trim();
                if (parsedJson.email) this.bookingDetails.userEmail = parsedJson.email.trim();
                if (parsedJson.dateTime) this.bookingDetails.userDateTime = parsedJson.dateTime.trim();
                if (typeof parsedJson.cancelled === 'boolean') this.bookingDetails.isCancelled = parsedJson.cancelled;
                if (typeof parsedJson.confirm === 'boolean') this.bookingDetails.isConfirmed = parsedJson.confirm;
            }
        } catch (error) {
            console.error("Error updating fields from response:", error);
        }
    }


    async getFinalJson() {
        const result = {};
        if (this.bookingDetails.userName) result.name = this.bookingDetails.userName;
        if (this.bookingDetails.userEmail) result.email = this.bookingDetails.userEmail;
        if (this.bookingDetails.userDateTime) result.dateTime = this.bookingDetails.userDateTime;
        result.cancelled = this.bookingDetails.isCancelled; // Ensure this is correctly assigned
        result.confirm = this.bookingDetails.isConfirmed;

        return JSON.stringify(result, null, 2);
    }


    /**
     * Extract and validate the user's name.
     */
    async handle() {

        try {
            this.res.cookie('current_time', Date.now());
            if (!this.voiceInput) {
                this.twiml.gather({
                    input: ["speech"],
                    speechTimeout: "auto",
                    speechModel: "experimental_conversations",
                    enhanced: true,
                    action: "/api/respond",
                })
                const msg = "Sorry, I didn't quite catch that. Could you please say it again for me?";
                const publicAudioFileUrl = await getVoiceRespUrl(msg,  this.AiAgentModel);
                await this.twiml.play(publicAudioFileUrl);
                this.bookingDetails.stage = "handling";
                this.res.cookie("bookingDetails", JSON.stringify(this.bookingDetails));
                return this.res.send(this.twiml.toString());
            }

            const systemPrompt = `
                You are an intelligent assistant tasked with booking meetings. Today's date is ${new Date().toISOString()}. Your role is to gather the following required details from the user:

                    1. Name
                    2. Email (ask to spell if unclear)
                    3. Date
                    4. Time (convert it to ISO 8601 format: YYYY-MM-DDTHH:mm:ss.SSSZ)

                    - Keep your responses short and conversational, like a natural human conversation.
                    - Ask for one piece of information at a time and confirm it before moving on.
                    - Use friendly, simple language. Avoid lists and overly formal language.
                    - If the user requests to cancel or modify a booking, process it as requested.
                    - Confirm all collected details with the user before finalizing.
                    - Provide the collected details in JSON format, including only the available information.
                    - Set "confirm" to true in the JSON only if the user explicitly confirms the details or says "yes."
                    - Set "confirm" to false in the JSON only if the meeting is already booked"
                    - If the meeting is to be canceled, set "cancelled" to true in the JSON.

                    Examples of JSON formats:
                    1. Partial information:
                    {
                        "name": "John Doe",
                        "email": null,
                        "dateTime": null,
                        "confirm": false,
                        "cancelled": false
                    }
                    2. Full information with confirmation:
                    {
                        "name": "John Doe",
                        "email": "john.doe@example.com",
                        "dateTime": "2024-05-30T12:00:00.000Z",
                        "confirm": true,
                        "cancelled": false
                    }
                    3. Full information with cancellation:
                    {
                        "name": "John Doe",
                        "email": "john.doe@example.com",
                        "dateTime": "2024-05-30T12:00:00.000Z",
                        "confirm": false,
                        "cancelled": true
                    }

                    Note: When confirming the date and time, speak it in a natural format (e.g., "May 30th, 2024 at 12:00 PM"), but in the JSON, ensure the format is ISO 8601 (YYYY-MM-DDTHH:mm:ss.SSSZ).
                    Always respond in the ${this.AiAgentModel?.language_code} language.

            `;

            // Prepare the prompt with the entire conversation history
            const conversationHistoryMessages = this.conversationHistory.map(entry => ({
                role: entry.role,
                content: entry.content
            }));

            // Filter out any existing system messages from conversationHistoryMessages
            const filteredConversationHistory = conversationHistoryMessages.filter(
                (message) => message.role !== "system"
            );

            console.log("Filterd message list: ", filteredConversationHistory);

            const messages = [
                { role: "system", content: systemPrompt },
                ...filteredConversationHistory, // existing conversation history
            ];


            const parsingCompletion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: messages,
                temperature: this.AiAgentModel.temperature,
            });
            const parsedMessage = parsingCompletion.choices[0].message.content.trim();
            const audiofieurl = await getVoiceRespUrl(parsedMessage, this.AiAgentModel);
            await this.twiml.play(audiofieurl);
            console.log('parsedMessage: ',parsedMessage);
            if (!parsedMessage) {
                this.twiml.gather({
                    input: ["speech"],
                    speechTimeout: "auto",
                    speechModel: "experimental_conversations",
                    enhanced: true,
                    action: "/api/respond",
                });
                const msg = "Sorry, I didn't quite catch that. Could you say it again for me?";
                const publicAudioFileUrl = await getVoiceRespUrl(msg, this.AiAgentModel);
                await this.twiml.play(publicAudioFileUrl);
                return this.res.send(this.twiml.toString());
            }

            this.updateFieldsFromResponse(parsedMessage);
            const jsonString = await this.getFinalJson();
            const result = JSON.parse(jsonString);
            console.log("result : ", result);
            this.conversationHistory.push({ role: "assistant", content: parsedMessage });
            this.res.cookie('conversationHistory', JSON.stringify(this.conversationHistory));

            if(result.confirm) {

                const bookingPayload = {
                    eventTypeId: parseInt(this.AiAgentModel?.CalenderTool?.cal_event_type_id),
                    // eventTypeId: 968526,
                    start: this.bookingDetails.userDateTime,
                    end: new Date(new Date(this.bookingDetails.userDateTime).getTime() + (1/4) * 60 * 60 * 1000).toISOString(),
                    responses: {
                        name: this.bookingDetails.userName,
                        email: this.bookingDetails.userEmail,
                        guests: [],
                        location: {
                            value: "inPerson",
                            optionValue: ""
                        }
                    },
                    metadata: {},
                    timeZone: this.AiAgentModel?.CalenderTool?.cal_timezone,
                    language: "en",
                    title: "Meeting with UrbanChat Assistant",
                    description: null,
                    status: "PENDING",
                    smsReminderNumber: null
                };

                try {
                    // Notify the user that you're checking the availability
                    let msg = "Let me check the availability for the provided time.";
                    let publicAudioFileUrl = await getVoiceRespUrl(msg, this.AiAgentModel);
                    await this.twiml.play(publicAudioFileUrl);

                    this.conversationHistory.push({ role: "assistant", content: msg });
                    this.res.cookie('conversationHistory', JSON.stringify(this.conversationHistory));

                    const checkBookingResponse = await this.findBookingByDate(this.AiAgentModel?.CalenderTool?.cal_api_key, this.bookingDetails.userDateTime);
                    console.log('Availability of the booking: ', checkBookingResponse);
                    const availability = await this.isTimeSlotAvailable(this.bookingDetails.userDateTime, checkBookingResponse.bookings);

                    if ((checkBookingResponse.bookings.length === 0 || checkBookingResponse.bookings.every(booking => booking.status === 'CANCELLED')) || availability) {
                        // Notify the user that the time slot is available
                        msg = "Great news! The time slot is available. I'll go ahead and schedule your meeting.";
                        publicAudioFileUrl = await getVoiceRespUrl(msg, this.AiAgentModel);
                        await this.twiml.play(publicAudioFileUrl);
                        this.conversationHistory.push({ role: "assistant", content: msg });
                        this.res.cookie('conversationHistory', JSON.stringify(this.conversationHistory));

                        const bookingResponse = await this.bookAppointment(this.AiAgentModel?.CalenderTool?.cal_api_key, bookingPayload);
                        console.log('Booking response:', bookingResponse);

                        msg = "Your meeting has been successfully booked. You'll receive a confirmation email shortly.";
                        publicAudioFileUrl = await getVoiceRespUrl(msg, this.AiAgentModel);
                        await this.twiml.play(publicAudioFileUrl);
                        this.conversationHistory.push({ role: "assistant", content: msg });
                        this.res.cookie('conversationHistory', JSON.stringify(this.conversationHistory));
                        this.res.clearCookie("bookingDetails");
                        return this.res.send(this.twiml.toString());

                    } else {
                        // Notify the user that the time slot is already booked
                        msg = "It looks like the time you selected is already booked. Could you please choose a different time?";
                        publicAudioFileUrl = await getVoiceRespUrl(msg, this.AiAgentModel);
                        await this.twiml.play(publicAudioFileUrl);
                        this.conversationHistory.push({ role: "assistant", content: msg });
                        this.res.cookie('conversationHistory', JSON.stringify(this.conversationHistory));
                        this.bookingDetails.stage = "handling";
                        this.res.cookie("bookingDetails", JSON.stringify(this.bookingDetails));
                        this.twiml.redirect({ method: "POST" }, "/api/respond");
                        return this.res.send(this.twiml.toString());
                    }

                } catch (err) {
                    console.error("Error occurred while booking the meeting:", err);
                    const msg = "Sorry, there was an error while booking your meeting. Please try again.";
                    const publicAudioFileUrl = await getVoiceRespUrl(msg, this.AiAgentModel);
                    await this.twiml.play(publicAudioFileUrl);
                    this.res.clearCookie("bookingDetails");
                    return this.res.send(this.twiml.toString());
                }

            }
            if(result.cancelled) {
                const msg = "Your meeting has been successfully cancelled. If you need to reschedule or have any other requests, feel free to let me know!";
                const publicAudioFileUrl = await getVoiceRespUrl(msg, this.AiAgentModel);
                await this.twiml.play(publicAudioFileUrl);
                this.res.clearCookie("bookingDetails");
                return this.res.send(this.twiml.toString());
            }

            this.twiml.gather({
                input: ["speech"],
                speechTimeout: "auto",
                speechModel: "experimental_conversations",
                enhanced: true,
                action: "/api/respond",
            })
            const publicAudioFileUrl = await getVoiceRespUrl(parsedMessage, this.AiAgentModel);
            this.twiml.play(publicAudioFileUrl);
            this.twiml.redirect({ method: "POST" }, "/api/respond");
            this.bookingDetails.stage = "handling";
            this.res.cookie("bookingDetails", JSON.stringify(this.bookingDetails));
            return this.res.send(this.twiml.toString());
        } catch (err) {
            console.error("Error occurred while parsing the name:", err);
            this.twiml.gather({
                input: ["speech"],
                speechTimeout: "auto",
                speechModel: "experimental_conversations",
                enhanced: true,
                action: "/api/respond",
            });
            const msg = "Sorry, I didn't quite catch that. Could you say it again for me?";
            const publicAudioFileUrl = await getVoiceRespUrl(msg, this.AiAgentModel);
            await this.twiml.play(publicAudioFileUrl);
            this.twiml.redirect({ method: "POST" }, "/api/respond");
            this.bookingDetails.stage = "handling";
            this.res.cookie("bookingDetails", JSON.stringify(this.bookingDetails));
            return this.res.send(this.twiml.toString());
        }
    }


}

module.exports = BookingHandler;


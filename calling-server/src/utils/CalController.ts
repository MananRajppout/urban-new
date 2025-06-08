import { Request, Response } from "express";
import AgentService from "../services/agent.service.js";

export const CalController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { agentId, Availabilityname, AvailabilityCalapiKey, AvailabilityCaleventTypeId, AvailabilityCaltimezone } = req.body;

    // 🛑 Validate input fields
    if (!agentId || !Availabilityname || !AvailabilityCalapiKey || !AvailabilityCaleventTypeId || !AvailabilityCaltimezone) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    // 🛑 Get the agent document
    const agentData = await AgentService.getAgentById(agentId);

    if (!agentData) {
      res.status(404).json({ error: "AI Agent not found" });
      return;
    }

    // ✅ Replace the entire array with only the latest entry
    const updatedCalendarTools = [
      { Availabilityname, AvailabilityCalapiKey, AvailabilityCaleventTypeId, AvailabilityCaltimezone }
    ];

    // ✅ Update the agent document in MongoDB
    const updatedAgent = await AgentService.updateAgentById(agentId, { calendar_tools: updatedCalendarTools });

    res.status(200).json({ message: "Calendar settings updated successfully", updatedAgent });
  } catch (error) {
    console.error("Error saving settings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




export const CalBookingController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { agentId, bookingName, bookingApiKey, bookingTypeId, bookingTimeZone } = req.body;

    // 🛑 Validate input fields
    if (!agentId || !bookingName || !bookingApiKey || !bookingTypeId || !bookingTimeZone) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    // 🛑 Get the agent document
    const agentData = await AgentService.getAgentById(agentId);

    if (!agentData) {
      res.status(404).json({ error: "AI Agent not found" });
      return;
    }

    // ✅ Replace the entire array with only the latest entry
    const updatedCalendarTools = [
      { bookingName, bookingApiKey, bookingTypeId, bookingTimeZone }
    ];

    // ✅ Update the agent document in MongoDB
    const updatedAgent = await AgentService.updateAgentById(agentId, { calender_booking_tool: updatedCalendarTools });

    res.status(200).json({ message: "Calendar settings updated successfully", updatedAgent });
  } catch (error) {
    console.error("Error saving settings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



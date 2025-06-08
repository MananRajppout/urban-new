import { formatAvailableSlots, getFormattedDate } from "../utils.js";


export const fetchAvailableSlots = async (calendar_tools: any) => {
    try {
        const startTime: string = getFormattedDate(
            0,
            calendar_tools.AvailabilityCaltimezone
        );
        const endTime: string = getFormattedDate(
            7,
            calendar_tools.AvailabilityCaltimezone
        );

        const url: string =
            `https://api.cal.com/v1/slots?apiKey=${calendar_tools.AvailabilityCalapiKey}` +
            `&eventTypeId=${calendar_tools.AvailabilityCaleventTypeId}` +
            `&startTime=${startTime}&endTime=${endTime}&timeZone=${encodeURIComponent(
                calendar_tools.AvailabilityCaltimezone
            )}`;

       
        const response: Response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
            const calRes: any = await response.json();
            let availableSlot = formatAvailableSlots(calRes.slots);
            return availableSlot;
        } else {
            throw new Error(`Error fetching slots: ${response.statusText}`);
        }
    } catch (error) {
        console.log({ error: (error as Error).message });
        return {
            error: (error as Error).message,success: false
        };
    }
}
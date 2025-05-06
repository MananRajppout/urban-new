import requests
from app_types.assistant_type import CalendarTool
from datetime import datetime, timedelta
import pytz
from services.api_service import get_request, post_request

base_url = "https://api.cal.com/v1"
def fetch_avaible_slots(calender_tool:CalendarTool):
    print("api_keyapi_keyapi_key")
    start_time = get_formatted_date(0,calender_tool.get('AvailabilityCaltimezone'))
    end_time = get_formatted_date(7,calender_tool.get('AvailabilityCaltimezone'))
    api_key = calender_tool.get('AvailabilityCalapiKey')
    event_id = calender_tool.get("AvailabilityCaleventTypeId")
    timezone = calender_tool.get("AvailabilityCaltimezone")
    url = f"{base_url}/slots?apiKey={api_key}&eventTypeId={event_id}&startTime={start_time}&endTime={end_time}&timeZone={timezone}"
    response = get_request(url=url)
    return response


def book_appointment_request(details: dict,api_key: str):
    url = f"{base_url}/bookings?apiKey={api_key}"
    res = post_request(url=url,json=details)
    return res



def get_formatted_date(days_later: int, time_zone: str) -> str:
    now_utc = datetime.utcnow()
    
    # Add the specified number of days
    future_utc = now_utc + timedelta(days=days_later)
    
    # Convert to target timezone
    tz = pytz.timezone(time_zone)
    future_local = future_utc.replace(tzinfo=pytz.utc).astimezone(tz)

    # Format to "YYYY-MM-DDTHH:MM:SS"
    return future_local.strftime("%Y-%m-%dT%H:%M:%S")
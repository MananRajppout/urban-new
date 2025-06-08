import mongoose, { Document } from "mongoose";
export type CalendarTool = {
  Availabilityname: { type: String; required: true };
  AvailabilityCalapiKey: { type: String; required: true };
  AvailabilityCaleventTypeId: { type: String; required: true };
  AvailabilityCaltimezone: { type: String; required: true };
};
export type CalenderBookingTool = {
  bookingName: { type: String; required: true };
  bookingApiKey: { type: String; required: true };
  bookingTypeId: { type: String; required: true };
  bookingTimeZone: { type: String; required: true };
};

export interface IAiAgent extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  name: string;
  base_prompt: string;
  chatgpt_model: string;
  STT_name: string;
  who_speaks_first: string;
  welcome_msg: string;
  twilio_phone_number?: string;
  plivo_phone_number?: string;
  voice_engine_name?: string;
  stt_engine_name?: string;
  voice_id: string;
  voice_name: string;
  call_transfer_prompt?: string;
  transfer_call_number?: string;
  calendar_tools: Array<CalendarTool>;
  calender_booking_tool: Array<CalenderBookingTool>;
  privacy_setting: "public" | "private";
  ambient_sound?: string;
  ambient_sound_volume: number;
  responsiveness: number;
  interruption_sensitivity: number;
  voice_speed: number;
  voice_temperature: number;
  reminder_interval: number;
  reminder_count: number;
  boosted_keywords?: string;
  fallback_voice_ids?: string;
  enable_backchannel: boolean;
  language: string;
  enable_speech_normalization: boolean;
  end_call_duration: number;
  created_time: Date;
  updated_time: Date;
  ambient_stability: number;
  ambient_similarity: number;
  elevenlabs_api_key: string;


  welcome_message_text: string,
  welcome_message_file: {
    public_url: string,
    publid_id: string
  },
  hang_up_prompt: string,
  silence_1_timeout: number
  silence_2_timeout: number
  silence_1_speech: string,
  silence_2_speech: string
}

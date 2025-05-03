import React from "react";
import Dropdown from "@/components/Widget/Dropdown";

export default function AdvancedSettings({
  advancedSettings,
  privacySettings,
  handleAdvancedChange,
  handleAdvancedBlur,
  handleDropdownAdvancedChange,
  handlePrivacyChange,
  isAdvancedChanged,
  isPrivacyChanged,
}) {
  return (
    <div className="voice-assistant-settings">
      <div className="privacy-settings">
        <div>
          <h3>Privacy Settings</h3>
          <p className="fade-text">Explore more in privacy documentation.</p>
          <div className="input-container">
            <label className="switch">
              <input
                type="checkbox"
                name="privacy_setting"
                checked={privacySettings.privacy_setting === 'private'}
                onChange={handlePrivacyChange}
              />
              <span className="slider"></span>
            </label>
            <p className="fade-text" style={{ margin: 0 }}>
              Opt-Out of Personal and Sensitive Data Storage
            </p>
          </div>
        </div>
      </div>

      <div className="advanced-settings">
        <h3>Advanced Settings</h3>
        <p>
          Explore more in <a href="#">API reference docs</a>
        </p>
        <div className="setting-item">
          <label htmlFor="ambient_sound">Ambient Sound</label>
          <Dropdown
            items={[{ name: "None", value: '' }, { name: "Cofee Shop", value: "cofee-shop" }]}
            placeholder={'select a sound'}
            style={{ backgroundColor: "rgba(85, 87, 104, 0.2)" }}
            currentValue={advancedSettings.ambient_sound}
            onSelect={(value) => handleDropdownAdvancedChange("ambient_sound", value)}
          />
        </div>
        <div className="setting-item">
          <label className="slider-label" htmlFor="ambient_sound_volume">
            Ambient Sound Volume ({advancedSettings.ambient_sound_volume})
          </label>
          <input
            className="range"
            id="ambient_sound_volume"
            type="range"
            name="ambient_sound_volume"
            value={advancedSettings.ambient_sound_volume}
            min="0"
            max="1"
            step="0.01"
            onChange={handleAdvancedChange}
          />
          <div className="range-labels">
            <span>Quiet</span>
            <span>Loud</span>
          </div>
        </div>
        <div className="setting-item">
          <label className="slider-label" htmlFor="responsiveness">
            Responsiveness ({advancedSettings.responsiveness})
          </label>
          <input
            className="range"
            id="responsiveness"
            type="range"
            name="responsiveness"
            value={advancedSettings.responsiveness}
            min="0"
            max="1"
            step="0.01"
            onChange={handleAdvancedChange}
          />
          <div className="range-labels">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>
        <div className="setting-item">
          <label className="slider-label" htmlFor="interruption_sensitivity">
            Interruption Sensitivity ({advancedSettings.interruption_sensitivity})
          </label>
          <input
            className="range"
            id="interruption_sensitivity"
            type="range"
            name="interruption_sensitivity"
            value={advancedSettings.interruption_sensitivity}
            min="0"
            max="1"
            step="0.01"
            onChange={handleAdvancedChange}
          />
          <div className="range-labels">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
        <div className="setting-item">
          <label className="slider-label" htmlFor="voice_speed">
            Voice Speed ({advancedSettings.voice_speed})
          </label>
          <input
            className="range"
            id="voice_speed"
            type="range"
            name="voice_speed"
            value={advancedSettings.voice_speed}
            min="0.5"
            max="2.0"
            step="0.05"
            onChange={handleAdvancedChange}
          />
          <div className="range-labels">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>
        <div className="setting-item">
          <label className="slider-label" htmlFor="voice_temperature">
            Voice Temperature ({advancedSettings.voice_temperature})
          </label>
          <input
            className="range"
            id="voice_temperature"
            type="range"
            name="voice_temperature"
            value={advancedSettings.voice_temperature}
            min="0"
            max="2"
            step="0.01"
            onChange={handleAdvancedChange}
          />
          <div className="range-labels">
            <span>Calm</span>
            <span>Emotional</span>
          </div>
        </div>
        <div className="setting-item">
          <label htmlFor="reminder_message_frequency">
            Reminder Message Frequency
          </label>
          <div className="reminder-frequency">
            <input
              id="reminder_message_frequency"
              type="number"
              name="reminder_interval"
              value={advancedSettings.reminder_interval}
              onChange={handleAdvancedChange}
            />
            <span>seconds, up to</span>
            <input
              id="reminder_message_limit"
              type="number"
              name="reminder_count"
              value={advancedSettings.reminder_count}
              onChange={handleAdvancedChange}
            />
            <span>times if there is no response.</span>
          </div>
        </div>
        <div className="setting-item">
          <label htmlFor="boosted_keywords">Boosted Keywords</label>
          <p className="fade-text">
            Provide a customized list of keywords to expand our models' vocabulary. (ex: Retail, Walmart)
          </p>
          <input
            id="boosted_keywords"
            type="text"
            name="boosted_keywords"
            value={advancedSettings.boosted_keywords}
            onChange={handleAdvancedChange}
            onBlur={handleAdvancedBlur}
          />
        </div>
        <div className="setting-item">
          <label htmlFor="fallback_voice_ids">Fallback Voice IDs</label>
          <p className="fade-text">
            If the current voice provider fails, switch the TTS to alternative providers' voice IDs. (ex: openai-Alloy, deepgram-Angus)
          </p>
          <input
            id="fallback_voice_ids"
            type="text"
            name="fallback_voice_ids"
            value={advancedSettings.fallback_voice_ids}
            onChange={handleAdvancedChange}
            onBlur={handleAdvancedBlur}
          />
        </div>
        <div className="setting-item">
          <label>Enable Backchannel (Beta)</label>
          <p className="fade-text">
            Enables the agent to use affirmations like "yeah" or "uh-huh" during conversations, indicating active listening and engagement.
          </p>
          <label className="switch">
            <input
              type="checkbox"
              name="enable_backchannel"
              checked={advancedSettings.enable_backchannel}
              onChange={handleAdvancedChange}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <label htmlFor="language">Language</label>
          <p className="fade-text">
            The language of the agent. <a href="#">docs</a>
          </p>
          <Dropdown
            items={[{ name: "en-US (English - US)", value: "en-US" }]}
            style={{ backgroundColor: "rgba(85, 87, 104, 0.2)" }}
            currentValue={advancedSettings.language}
            onSelect={(value) => handleDropdownAdvancedChange("language", value)}
          />
        </div>
        {/* <div className="setting-item">
          <label htmlFor="agent_level_webhook_url">Agent Level Webhook URL</label>
          <p className="fade-text">
            The webhook for agent to listen to call events. <a href="#">docs</a>
          </p>
          <input
            id="agent_level_webhook_url"
            type="text"
            name="agent_level_webhook_url"
            value={advancedSettings.agent_level_webhook_url}
            onChange={handleAdvancedChange}
          />
        </div> */}
        <div className="setting-item">
          <label>Enable Speech Normalization</label>
          <p className="fade-text">
            It converts text elements like numbers, currency, and dates into human-like spoken forms. <a href="#">docs</a>
          </p>
          <label className="switch">
            <input
              type="checkbox"
              name="enable_speech_normalization"
              checked={advancedSettings.enable_speech_normalization}
              onChange={handleAdvancedChange}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <label htmlFor="end_call_duration">End Call Setting</label>
          <p className="fade-text">
            End the call if the user has stayed silent for
            <span>
              <input
                id="end_call_duration"
                name="end_call_duration"
                value={advancedSettings.end_call_duration}
                onChange={handleAdvancedChange}
                type="number"
                style={{ width: "50px", padding: "8px", marginInline: "5px" }}
                placeholder="600"
              />
            </span>
            seconds
          </p>
        </div>
      </div>
    </div>
  );
}

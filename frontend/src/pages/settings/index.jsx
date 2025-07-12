import Layout from "@/components/layout/Layout";
import React, { useState, useEffect } from "react";
import { getSettings, updateSettings } from "@/lib/api/ApiSettings";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const Settings = () => {
  const [dailySummary, setDailySummary] = useState(false);
  const [callSummary, setCallSummary] = useState(false);
  const [summaryEmail, setSummaryEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current settings when component mounts
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getSettings();
      
      if (response.data && response.data.settings) {
        const { daily_summary, call_summary, summary_email } = response.data.settings;
        setDailySummary(daily_summary || false);
        setCallSummary(call_summary || false);
        setSummaryEmail(summary_email || "");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;

    // Validate email if any summary option is enabled
    if ((dailySummary || callSummary) && !summaryEmail) {
      toast.error("Please enter an email address to receive summaries.");
      return;
    }

    // Validate email format
    if (summaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(summaryEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setSaving(true);
      const response = await updateSettings(dailySummary, callSummary, summaryEmail);
      
      if (response.data && response.data.success) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error(response.message || "Failed to save settings. Please try again.");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
          <div className="absolute -z-10 top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-green/20 blur-[100px] animate-pulse-slow" />
          <div className="absolute -z-10 bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-brand-green/10 blur-[120px] animate-pulse-slow animation-delay-1000" />
          
          <div className="glass-panel p-8 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-brand-green mb-4" />
            <p className="text-foreground/70 text-lg">Loading settings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
        {/* Floating gradient orbs */}
        <div className="absolute -z-10 top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-green/20 blur-[100px] animate-pulse-slow" />
        <div className="absolute -z-10 bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-brand-green/10 blur-[120px] animate-pulse-slow animation-delay-1000" />
        
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="inline-block">Call Summary </span>
              <span className="inline-block text-gradient">Settings</span>
            </h1>
            <p className="text-xl text-foreground/70">
              Configure your call summary preferences and notification settings
            </p>
          </div>

          {/* Settings Panel */}
          <div className="glass-panel p-8 rounded-2xl border border-white/10">
            <div className="space-y-8">
              {/* Daily Summary Toggle */}
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-3">Daily Summary</h3>
                  <p className="text-foreground/70 text-base leading-relaxed">
                    We will send a daily call summary at 12:00 PM with all calls from the previous day. 
                    This helps you stay on top of your daily call activity and track important conversations.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-6">
                  <input
                    type="checkbox"
                    checked={dailySummary}
                    onChange={(e) => setDailySummary(e.target.checked)}
                    className="sr-only peer"
                    disabled={saving}
                  />
                  <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-green/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-green peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              {/* Call Summary Toggle */}
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-3">Call Summary for Each Call</h3>
                  <p className="text-foreground/70 text-base leading-relaxed">
                    Send a summary email immediately after each call is completed. 
                    Get instant insights and never miss important details from your conversations.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-6">
                  <input
                    type="checkbox"
                    checked={callSummary}
                    onChange={(e) => setCallSummary(e.target.checked)}
                    className="sr-only peer"
                    disabled={saving}
                  />
                  <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-green/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-green peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              {/* Email Input */}
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">Summary Email Address</h3>
                <p className="text-foreground/70 text-base mb-6 leading-relaxed">
                  Enter the email address where you want to receive call summaries. 
                  Make sure this email is regularly monitored for timely updates.
                </p>
                <input
                  type="email"
                  value={summaryEmail}
                  onChange={(e) => setSummaryEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-6 py-4 bg-white/5 text-white rounded-xl border border-white/20 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={saving}
                />
              </div>

              {/* Save Button */}
              <div className="pt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full px-8 py-4 bg-gradient-to-r from-brand-green to-brand-green/80 hover:from-brand-green/90 hover:to-brand-green/70 text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-green/50 text-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving Settings...
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;

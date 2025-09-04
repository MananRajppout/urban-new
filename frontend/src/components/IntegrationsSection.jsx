import React from "react";

const IntegrationsSection = () => {
  const integrations = [
    {
      name: "Cal.com",
      logo: "https://cal.com/android-chrome-512x512.png",
      description:
        "Seamlessly schedule appointments and manage bookings directly through your AI voice agents.",
    },
    {
      name: "Google Sheets",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Google_Sheets_logo_%282014-2020%29.svg/1498px-Google_Sheets_logo_%282014-2020%29.svg.png",
      description:
        "Run bulk outbound call campaigns by importing contact lists directly from Google Sheets.",
    },
    {
      name: "Email Services",
      logo: "https://cdn-icons-png.flaticon.com/512/5968/5968534.png",
      description:
        "Automatically send call summaries and analytics reports via email after each interaction.",
    },
    {
      name: "REST API",
      logo: "https://cdn-icons-png.flaticon.com/512/10239/10239709.png",
      description:
        "Connect to any custom application or service using our robust and well-documented API.",
    },
  ];

  // Create the mailto link with pre-filled subject and body
  const mailtoLink =
    "mailto:urbanchatai@gmail.com?subject=Requesting%20Custom%20Integration&body=Hello%20UrbanChat%20team,%0A%0AI'm%20interested%20in%20requesting%20a%20custom%20integration%20for%20your%20AI%20voice%20agent%20platform.%0A%0APlease%20contact%20me%20to%20discuss%20the%20details.%0A%0AThank%20you.";

  return (
    <section id="integrations" className="py-12 md:py-20 relative">
      <div className="absolute -z-10 top-1/3 left-1/4 w-64 h-64 rounded-full bg-brand-green/10 blur-[100px] animate-pulse-slow" />
      <div className="absolute -z-10 bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-brand-green/5 blur-[120px] animate-pulse-slow animation-delay-1000" />

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 md:mb-6">
            Seamless <span className="text-gradient">Integrations</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-foreground/70">
            Connect your AI voice agents with the tools and platforms you
            already use for a unified workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 max-w-5xl mx-auto">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="glass-panel rounded-xl p-4 md:p-6 hover:border-brand-green/30 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-green/0 via-brand-green/5 to-brand-green/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-move" />

              <div className="flex items-center mb-3 md:mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-lg p-2 flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <img
                    src={integration.logo}
                    alt={integration.name}
                    className="max-w-full max-h-full"
                  />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold">
                  {integration.name}
                </h3>
              </div>

              <p className="text-sm md:text-base text-foreground/70">
                {integration.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-16">
          <a
            href={mailtoLink}
            className="inline-block px-6 sm:px-8 md:px-10 py-3 md:py-4 rounded-full border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-black transition-all duration-300 font-semibold text-sm md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Request Custom Integrations
          </a>
          <p className="mt-4 text-sm md:text-lg text-foreground/70 max-w-2xl mx-auto px-4">
            Need a specific integration not listed above? Our team can build
            custom solutions tailored to your business needs. Contact us today!
          </p>
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;

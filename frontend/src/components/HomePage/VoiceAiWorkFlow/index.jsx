import "@/styles/HomePage/voice-ai-workflow.css";
import { Timeline } from "../../ui/timeline";
// import HeroLayoutBox from "./HeroLayoutBox"; // Import the HeroLayoutBox component
import Card from "./Card"; // Assuming Card component is needed for each timeline step

export default function VoiceAiWorkflow() {
  // Define the timeline data with specific content for each step

  const buildItems = [
    { text: "Pre-built Templates." },
    { text: "Pre-built Templates." },
    { text: "Bring your LLM" },
    { text: "Bring your LLM" },
    { text: "Tool Calls" },
  ];

  const testItems = [
    { text: "Interact with Your Agent" },
    { text: "Check Called Tools" },
    { text: "Save Test Cases for Future Use" },
  ];

  const deployItems = [
    { text: "Web App" },
    { text: "Mobile" },
    { text: "Telephony: Twilio, Vonage, SIP" },
  ];

  const monitorItems = [
    { text: "Sentiment Analysis" },
    { text: "Task Completion Status" },
    { text: "Latency Tracking" },
  ];




  const timelineData = [
    {
      title: "Step 1: Build",
      content: (
        <div
          className="timeline-step"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            marginBottom: "1rem", // Further reduced margin
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 2,
              gap: "0.5rem", // Added smaller gap between elements
            }}
          >
            <Card
              id="build"
              title="Build"
              subtitle="Build Workflows" // Simplified subtitle
              contentItem={buildItems}
              style={{
                padding: "0.5rem", // Reduced padding within Card
                fontSize: "0.9rem", // Decreased font size
              }}
            />
          </div>
          <div
            className="timeline-line"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "1px", // Line remains slim
              height: "60%", // Reduced height
              backgroundColor: "#ccc",
              zIndex: 1,
            }}
          ></div>
        </div>
      ),
    },
    
    {
      title: (
        <>
          Step 2: <br />
          <span style={{ display: "inline-block", marginTop: "0.25rem" }}>
            Test
          </span>
        </>
      ),
      content: (
        <div
          className="timeline-step"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem", // Reduced margin
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 2,
            }}
          >
            <Card
              id="test"
              title="Test"
              subtitle="Easily Build Workflows"
              contentItem={testItems} // Fixed to testItems
            />
          </div>
          <div
            className="timeline-line"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "1px",
              height: "80%",
              backgroundColor: "#ccc",
              zIndex: 1,
            }}
          ></div>
        </div>
      ),
    },
    {
      title: "Step 3: Deploy",
      content: (
        <div
          className="timeline-step"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem", // Reduced margin
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 2,
            }}
          >
            <Card
              id="deploy"
              title="Deploy"
              subtitle="Deploy Anywhere"
              contentItem={deployItems}
            />
          </div>
          <div
            className="timeline-line"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "1px",
              height: "80%",
              backgroundColor: "#ccc",
              zIndex: 1,
            }}
          ></div>
        </div>
      ),
    },
    {
      title: "Step 4: Monitor",
      content: (
        <div
          className="timeline-step"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem", // Reduced margin
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 2,
            }}
          >
            <Card
              id="monitor"
              title="Monitor"
              subtitle="Post-Call Analysis"
              contentItem={monitorItems}
            />
          </div>
        </div>
      ),
    },
  ];
  

  return (
    <div className="">
      {/* Desktop view */}
      <section className="hidden sm:block">
        <div className="hero ">
          <div className="hero-header ">
            <h2 className="primary-heading">
              Build AI Voice Agents
            </h2>
            <h2 className="subtitle ">
              Build and test complex workflows in a matter of minutes, <br />
              then deploy them via phone call, web call, or anywhere else.
            </h2>

           
            <div className="">
              <Timeline data={timelineData} /> 
            </div>
          </div>
        </div>
      </section>

      {/* Mobile view */}
      <section className="sm:hidden">
        {/* Mobile Timeline Layout */}
        <div className="mobile-timeline-container">
          <div className="mobile-card-container">
            {/* <HeroLayoutBox /> Optional Hero Layout Box for mobile view */}
          </div>

          {/* <Timeline data={timelineData} /> Pass the customized timeline data */}
        </div>
      </section>
    </div>
  );
}

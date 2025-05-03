import React from "react";
import MobileCard from "./MobileCard";

function MobileHeroLayout() {
  const ItemList = [
    { text: "Pre-built Templates." },
    { text: "Pre-built Templates." },
    { text: "Bring your LLM" },
    { text: "Bring your LLM" },
    { text: "Tool Calls" },
  ];
  return (
    <div className="m-5 flex flex-col items-center justify-center lg:hidden ">
      <div className="m-6">

        <h2 className="primary-heading">
          Build AI Voice agents
        </h2>
        <h2 className="subtitle">
          Build and test complex workflows in a matter of minutes, <br />
          then deploy them via phone call, web call, or anywhere else.
        </h2>
      </div>

      <MobileCard
        id="build"
        title="Build"
        subtitle="Easily Build Complex Workflows"
        contentItem={ItemList}
      />
      <MobileCard
        id="build"
        title="Test"
        subtitle="Easily Build Complex Workflows"
        contentItem={ItemList}
      />
      <MobileCard
        id="build"
        title="Deploy"
        subtitle="Easily Build Complex Workflows"
        contentItem={ItemList}
      />
      <MobileCard
        id="build"
        title="Monitor"
        subtitle="Easily Build Complex Workflows"
        contentItem={ItemList}
      />
    </div>
  );
}

export default MobileHeroLayout;

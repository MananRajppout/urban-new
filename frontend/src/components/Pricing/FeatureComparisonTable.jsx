import React from "react";
import { Check, X, Clock, Crown } from "lucide-react";

const FeatureComparisonTable = ({ plans, allFeatures }) => {
  const isPlanFeature = (plan, feature) => {
    if (plan.features.includes(feature)) return true;
    if (plan.comingSoon.includes(feature)) return "coming";
    return false;
  };

  return (
    <div className="glass-panel p-6 mb-10 overflow-hidden rounded-xl">
      <h2 className="text-xl font-medium text-white mb-6 flex items-center">
        <span className="text-gradient-teal mr-2">Features</span>
        Comparison
      </h2>

      <div className="overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-800">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider bg-black/60 w-1/3"
                  >
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.name}
                      scope="col"
                      className={`px-4 py-3 text-center text-sm font-medium uppercase tracking-wider w-1/6
                      ${
                        plan.isCurrentPlan
                          ? "text-accent-teal bg-accent-teal/5"
                          : "text-gray-300 bg-black/60"
                      }`}
                    >
                      {plan.name}
                      {plan.isCurrentPlan && (
                        <div className="inline-flex items-center rounded-full bg-yellow-500/90 px-2 py-0.5 text-xs font-medium text-black ml-2">
                          <Crown className="w-3 h-3 mr-1" />
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr className="bg-black/20">
                  <td className="px-4 py-3 text-sm font-medium text-white">
                    Message Credits
                  </td>
                  {plans.map((plan) => (
                    <td
                      key={`${plan.name}-messages`}
                      className={`px-4 py-3 text-center text-sm ${
                        plan.isCurrentPlan
                          ? "text-accent-teal font-semibold"
                          : "text-gray-300"
                      }`}
                    >
                      {plan.messages.toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr className="bg-black/40">
                  <td className="px-4 py-3 text-sm font-medium text-white">
                    Number of Chatbots
                  </td>
                  {plans.map((plan) => (
                    <td
                      key={`${plan.name}-chatbots`}
                      className={`px-4 py-3 text-center text-sm ${
                        plan.isCurrentPlan
                          ? "text-accent-teal font-semibold"
                          : "text-gray-300"
                      }`}
                    >
                      {plan.chatbots}
                    </td>
                  ))}
                </tr>

                <tr className="bg-black/20">
                  <td className="px-4 py-3 text-sm font-medium text-white">
                    Characters per Bot
                  </td>
                  {plans.map((plan) => (
                    <td
                      key={`${plan.name}-characters`}
                      className={`px-4 py-3 text-center text-sm ${
                        plan.isCurrentPlan
                          ? "text-accent-teal font-semibold"
                          : "text-gray-300"
                      }`}
                    >
                      {plan.characters}
                    </td>
                  ))}
                </tr>

                {/* Feature rows */}
                {allFeatures.map((feature, idx) => (
                  <tr
                    key={`feature-${idx}`}
                    className={idx % 2 === 0 ? "bg-black/40" : "bg-black/20"}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {feature}
                    </td>
                    {plans.map((plan, planIndex) => {
                      const status = isPlanFeature(plan, feature);
                      return (
                        <td
                          key={`${plan.name}-${feature}`}
                          className="px-4 py-3 text-center"
                        >
                          {status === true ? (
                            <div className="flex justify-center">
                              <div
                                className={`rounded-full p-1
                                ${
                                  planIndex === 0
                                    ? "bg-accent-teal/20"
                                    : planIndex === 1
                                    ? "bg-accent-purple/20"
                                    : "bg-accent-cyan/20"
                                }`}
                              >
                                <Check
                                  className={`w-5 h-4 pt-1 rounded-full
                                  ${
                                    planIndex === 0
                                      ? "text-accent-teal"
                                      : planIndex === 1
                                      ? "text-accent-purple"
                                      : "text-accent-cyan"
                                  }`}
                                />
                              </div>
                            </div>
                          ) : status === "coming" ? (
                            <div className="flex flex-col items-center justify-center">
                              <div className="rounded-full bg-gray-500/20 p-1">
                                <Clock className="w-5 h-4 pt-1 text-gray-500" />
                              </div>
                              <span className="text-xs text-gray-500 mt-1">
                                Soon
                              </span>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div className="rounded-full bg-gray-500/20 p-1">
                                <X className="w-5 h-4 pt-1 text-gray-500" />
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureComparisonTable;

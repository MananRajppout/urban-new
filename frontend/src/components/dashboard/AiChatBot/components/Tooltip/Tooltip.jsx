const CustomTooltip = ({ active, payload, label, activeMetric }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 backdrop-blur-lg border border-subtle-border">
        <p className="text-sm font-medium text-white mb-2">{label}</p>
        {activeMetric === "messages" && (
          <p className="text-sm text-purple-400">
            <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            Messages: {payload[0].value}
          </p>
        )}
        {activeMetric === "tokens" && (
          <p className="text-sm text-green-400">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Tokens: {payload[0].value.toLocaleString()}
          </p>
        )}
        {activeMetric === "sessions" && (
          <p className="text-sm text-blue-400">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            Sessions: {payload[0].value}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;

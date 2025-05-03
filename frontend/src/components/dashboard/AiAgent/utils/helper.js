import { dailyData, monthlyData, weeklyData } from ".";

export const getSentimentColor = (value, isSentiment) => {
  if (!isSentiment) return "text-white";

  const numValue = typeof value === "string" ? parseInt(value) : value;

  if (numValue >= 75) return "text-sentiment-positive";
  if (numValue >= 40) return "text-sentiment-neutral";
  return "text-sentiment-negative";
};

export const getChartData = (timeFrame) => {
  switch (timeFrame) {
    case "daily":
      return dailyData;
    case "weekly":
      return weeklyData;
    case "monthly":
      return monthlyData;
    default:
      return dailyData;
  }
};

export const getSentimentBadge = (sentiment) => {
  switch (sentiment) {
    case "positive":
      return "bg-sentiment-positive/20 text-sentiment-positive";
    case "neutral":
      return "bg-sentiment-neutral/20 text-sentiment-neutral";
    case "negative":
      return "bg-sentiment-negative/20 text-sentiment-negative";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
};

export const getStatusBadge = (status) => {
  switch (status) {
    case "completed":
      return "bg-accent-teal/20 text-accent-teal";
    case "missed":
      return "bg-sentiment-negative/20 text-sentiment-negative";
    case "transferred":
      return "bg-accent-purple/20 text-accent-purple";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
};

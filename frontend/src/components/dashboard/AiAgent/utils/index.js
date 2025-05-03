export const tooltips = {
  totalCalls:
    "Total number of calls made or received across all your AI agents.",
  avgCallDuration:
    "Average length of all calls, calculated as total call time divided by number of calls.",
  minutesUsed: "Total minutes consumed from your subscription plan.",
  minutesRemaining:
    "Remaining minutes available in your current billing cycle.",
  callsOverTime:
    "Percentage change in call volume compared to the previous period.",
  callsByAiAgent:
    "Number of calls handled by AI agents without human intervention.",
  avgCallDurationDetailed:
    "The mean duration of all calls, calculated by dividing total call time by the number of calls.",
  callsFromSameNumber:
    "Number of repeat calls from the same phone numbers, indicating potential follow-ups or continuing conversations.",
  uniqueCallers:
    "Count of distinct phone numbers that have called your system, representing your reach.",
  activeAiAgents:
    "Number of AI agents that have handled at least one call in the current period.",
};

export const dailyData = [
  { name: "00:00", calls: 5 },
  { name: "03:00", calls: 10 },
  { name: "06:00", calls: 8 },
  { name: "09:00", calls: 25 },
  { name: "12:00", calls: 35 },
  { name: "15:00", calls: 40 },
  { name: "18:00", calls: 20 },
  { name: "21:00", calls: 15 },
];

export const weeklyData = [
  { name: "Mon", calls: 65 },
  { name: "Tue", calls: 85 },
  { name: "Wed", calls: 120 },
  { name: "Thu", calls: 105 },
  { name: "Fri", calls: 90 },
  { name: "Sat", calls: 40 },
  { name: "Sun", calls: 35 },
];

export const monthlyData = [
  { name: "Week 1", calls: 320 },
  { name: "Week 2", calls: 380 },
  { name: "Week 3", calls: 420 },
  { name: "Week 4", calls: 390 },
];

export const recentCalls = [
  {
    id: "c12345",
    time: "Today, 15:23",
    callerId: "+1 (555) 123-4567",
    agent: "Emma Thompson",
    duration: "5:47",
    sentiment: "positive",
    status: "completed",
  },
  {
    id: "c12346",
    time: "Today, 14:12",
    callerId: "+1 (555) 987-6543",
    agent: "Michael Chen",
    duration: "3:22",
    sentiment: "neutral",
    status: "completed",
  },
  {
    id: "c12347",
    time: "Today, 11:05",
    callerId: "+1 (555) 456-7890",
    agent: "Sarah Davis",
    duration: "0:42",
    sentiment: "negative",
    status: "missed",
  },
  {
    id: "c12348",
    time: "Yesterday, 17:30",
    callerId: "+1 (555) 789-0123",
    agent: "James Wilson",
    duration: "8:15",
    sentiment: "positive",
    status: "completed",
  },
  {
    id: "c12349",
    time: "Yesterday, 10:18",
    callerId: "+1 (555) 234-5678",
    agent: "Emma Thompson",
    duration: "4:53",
    sentiment: "neutral",
    status: "transferred",
  },
];

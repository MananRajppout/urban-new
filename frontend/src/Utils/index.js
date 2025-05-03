export function timestampToCustomFormat(timestamp) {
  // Convert the raw timestamp to a JavaScript Date object
  const date = new Date(timestamp);

  // Create an array of month names
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Get the components for the edited format
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const dayOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][date.getUTCDay()];
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  // Format the date and time
  const editedFormat = `Edited on ${day} ${month} ${year}, ${dayOfWeek} at ${hours}:${
    minutes < 10 ? "0" : ""
  }${minutes} Clock`;

  return editedFormat;
}

export function timestampToDate(timestamp) {
  // Convert the raw timestamp to a JavaScript Date object
  const date = new Date(timestamp);

  // Create an array of month names
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Get the components for the edited format
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const dayOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const weekday = dayOfWeek[date.getDay()];
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  hours = String(date.getHours()).padStart(2, "0");

  // Format the date and time
  const editedFormat = `${day} ${month} ${year}, ${weekday} at ${hours}:${minutes} ${ampm} Clock`;

  return editedFormat;
}

export function isValidURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

export function getIsoTime(dateTime = new Date()) {
  return dateTime.toISOString().slice(0, 19);
}

export function getFormattedDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Adding 1 to month as it's zero-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDateAfter(days = 0) {
  const currentDate = new Date();
  const oneWeekAgoDate = new Date(
    currentDate.getTime() + days * 24 * 60 * 60 * 1000
  );
  return oneWeekAgoDate;
}

export function convertToCustomFormat(dateTimeString) {
  const date = new Date(dateTimeString);

  const year = date.getFullYear();
  const month = date.toLocaleString("en-US", { month: "long" });
  const day = date.getDate();
  const ordinalSuffix = getOrdinalSuffix(day);

  return `${month} ${day}${ordinalSuffix}, ${year}`;
}

function getOrdinalSuffix(day) {
  if (day >= 11 && day <= 13) {
    return "th";
  }
  const lastDigit = day % 10;
  switch (lastDigit) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

const tabs = [
  {
    tab: "chatbot",
    items: [],
  },
  {
    tab: "settings",
    items: [
      "chat-interface",
      "model",
      "security",
      "leads",
      "general",
      "notifications",
      "domain",
    ],
  },
  {
    tab: "dashboard",
    items: ["chat-history", "leads", "booking"],
  },
  {
    tab: "sources",
    items: ["files", "text", "website-link", "qa", "youtube"],
  },
  {
    tab: "integrates",
    items: [],
  },
  {
    tab: "embed-code",
    items: [],
  },
  {
    tab: "share",
    items: [],
  },
  {
    tab: "statistics",
    items: [],
  },
  {
    tab: "delete",
    items: [],
  },
];

export function getTabName(tabIndex) {
  if (tabIndex >= tabs.length || tabIndex < 0) return tabs[0].tab;
  return tabs[tabIndex].tab;
}

export function getSubTabName(tabName, subTabIndex) {
  let tabIndex = getTabIndex(tabName);

  const subTabItems = tabs[tabIndex].items;

  if (subTabIndex >= subTabItems.length || subTabIndex < 0)
    return subTabItems[0];
  return subTabItems[subTabIndex];
}

export function getTabIndex(tabName) {
  let tabIndex = 0;

  // find tab
  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].tab === tabName) {
      tabIndex = i;
      break;
    }
  }

  return tabIndex;
}

export function getSubTabIndex(tabName, subTabName) {
  let tabIndex = 0;

  // find tab
  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].tab === tabName) {
      tabIndex = i;
      break;
    }
  }

  let subTabIndex = 0;
  // find sub tab
  if (subTabName) {
    for (let i = 0; i < tabs[tabIndex].items.length; i++) {
      if (tabs[tabIndex].items[i] === subTabName) {
        subTabIndex = i;
        break;
      }
    }
  }

  return subTabIndex;
}

export function formatDateString(dateString) {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long", // Full month name (e.g., "June")
    day: "numeric", // Day of the month (e.g., "3")
    year: "numeric", // Full year (e.g., "2022")
  });

  return formattedDate.toUpperCase();
}

export function textToUrl(text) {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "");
}

export function replaceMarkdownLinksToTargetBlank(str) {
  // Regular expression to match Markdown links like [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  // Replace Markdown links with Markdown-formatted links that open in a new tab
  const replacedStr = str.replaceAll(
    markdownLinkRegex,
    '[$1]($2){target="_blank"}'
  );

  return replacedStr;
}

export function getDateString(date) {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  const formatter = new Intl.DateTimeFormat("en-CA", options); // 'en-CA' is used for ISO format
  return formatter.format(date);
}

export function getStartAndEndOfMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Start date of the month
  const startDate = new Date(year, month, 2);

  // End date of the month
  const endDate = new Date(year, month + 1, 1);

  return {
    startDate: startDate,
    endDate: endDate,
  };
}

export function getTimeString(dateStr) {
  const date = new Date(dateStr);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes; // add leading zero if minutes < 10

  const timeString = hours + ":" + minutes + " " + ampm;
  return timeString;
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// duration 10m 1h 1d 1w 1month
export function getTimeRange(duration) {
  const now = new Date(); // Current time
  let from, to;

  to = now; // "To" is always the current time

  switch (duration) {
    case "10m":
      from = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago
      break;
    case "1h":
      from = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
      break;
    case "1d":
      from = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
      break;
    case "1w":
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
      break;
    case "1month":
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 1 month ago
      break;
    default:
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

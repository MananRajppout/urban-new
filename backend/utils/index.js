// period: today, yesterday, this_week, this_month, this_year, last_year, custom
const dayjs = require("dayjs");

function buildChartData({ data, period, from, to }) {
  const now = dayjs();
  let seriesData = [];

  const generateSeriesData = (start, unit, length) => {
    return Array.from({ length }, (_, i) => {
      const current = start.add(i, unit);
      const count = data.filter((session) =>
        dayjs(session.created_time).isSame(current, unit)
      ).length;
      return { x: current.toISOString(), y: count };
    });
  };

  switch (period) {
    case "all": {
      if (data.length > 0) {
        const start = dayjs(data[0].created_time).startOf("month");
        const end = dayjs(data[data.length - 1].created_time);
        const totalDays = end.diff(start, "day") + 2;
        seriesData = generateSeriesData(start, "day", totalDays);
      }
      break;
    }
    case "today": {
      const startOfDay = now.startOf("day");
      const hoursGone = now.hour() + 1;
      seriesData = generateSeriesData(startOfDay, "hour", hoursGone);
      break;
    }

    case "yesterday": {
      const startOfYesterday = now.subtract(1, "day").startOf("day");
      const hoursInDay = 24;
      seriesData = generateSeriesData(startOfYesterday, "hour", hoursInDay);
      break;
    }

    case "this_week": {
      const startOfWeek = now.startOf("week");
      const daysGone = now.diff(startOfWeek, "day") + 1;
      seriesData = generateSeriesData(startOfWeek, "day", daysGone);
      break;
    }

    case "this_month": {
      const startOfMonth = now.startOf("month");
      const daysGone = now.date();
      seriesData = generateSeriesData(startOfMonth, "day", daysGone);
      break;
    }

    case "last_month": {
      const startOfLastMonth = now.subtract(1, "month").startOf("month");
      const daysInLastMonth = startOfLastMonth.daysInMonth();
      seriesData = generateSeriesData(startOfLastMonth, "day", daysInLastMonth);
      break;
    }

    case "this_year": {
      const startOfYear = now.startOf("year");
      const monthsGone = now.month() + 1;
      seriesData = generateSeriesData(startOfYear, "month", monthsGone);
      break;
    }

    case "last_year": {
      const startOfLastYear = now.subtract(1, "year").startOf("year");
      const monthsInYear = 12;
      seriesData = generateSeriesData(startOfLastYear, "month", monthsInYear);
      break;
    }

    case "custom": {
      const start = dayjs(from).startOf("day");
      const end = dayjs(to).startOf("day");
      const totalDays = end.diff(start, "day") + 1;
      seriesData = generateSeriesData(start, "day", totalDays);
      break;
    }

    default:
      throw new Error(`Unknown period: ${period}`);
  }

  return seriesData;
}

exports.buildChartData = buildChartData;

function periodToRange(period) {
  const now = dayjs();
  let from, to;
  switch (period) {
    case "all":
      // just ignore
      from = now;
      to = now;
      break;
    case "today":
      from = now.startOf("day");
      to = now.endOf("day");
      break;
    case "yesterday":
      from = now.subtract(1, "day").startOf("day");
      to = now.subtract(1, "day").endOf("day");
      break;
    case "this_week":
      from = now.startOf("week");
      to = now.endOf("week");
      break;
    case "this_month":
      from = now.startOf("month");
      to = now.endOf("month");
      break;
    case "last_month":
      from = now.subtract(1, "month").startOf("month");
      to = now.subtract(1, "month").endOf("month");
      break;
    case "this_year":
      from = now.startOf("year");
      to = now.endOf("year");
      break;
    case "last_year":
      from = now.subtract(1, "year").startOf("year");
      to = now.subtract(1, "year").endOf("year");
      break;
    default:
      throw new Error(`Unknown period: ${period}`);
  }

  return { from: from.toDate(), to: to.toDate() };
}

exports.periodToRange = periodToRange;

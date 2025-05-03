import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export function checkWrite(role) {
  return role === 1 || role === 2;
}

export function checkExport(role) {
  return role === 1 || role === 2 || role === 3;
}

export function checkDelete(role) {
  return role === 1;
}

export function checkInvite(role) {
  return role === 1 || role === 2;
}

export function checkEdit(role) {
  return role === 1 || role === 2;
}

export function checkAdmin(role) {
  return role === 1;
}
export const filters = [
  { name: "all", value: "all" },
  { name: "today", value: "today" },
  { name: "yesterday", value: "yesterday" },
  { name: "this month", value: "this_month" },
  { name: "last month", value: "last_month" },
  { name: "this year", value: "this_year" },
  { name: "last year", value: "last_year" },
  { name: "custom", value: "custom" },
];


export function justPhoneNumber(phoneNumberWithCode, iso) {
  // this phone number has country calling code without + sign
  // e.g. 919876543210 for India
  // e.g 14155552671 for US
  // return just phone number without country code
  if (iso === "IN") {
    return phoneNumberWithCode.slice(2);
  }
  if (iso === "US") {
    return phoneNumberWithCode.slice(1);
  }
  throw new Error("This country is not supported");
}

export const formatDuration = (durationInMinutes) => {
  if (!durationInMinutes || durationInMinutes <= 0) return "0 min";

  const totalSeconds = Math.floor(durationInMinutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let result = "";
  if (hours > 0) result += `${hours} hr `;
  if (minutes > 0) result += `${minutes} min `;
  if (seconds > 0) result += `${seconds} sec`;

  return result.trim() || "0 min";
};
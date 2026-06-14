import { differenceInDays, parseISO, format, isValid } from "date-fns";

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = parseISO(dateStr);
  if (!isValid(d)) return null;
  return differenceInDays(d, new Date());
}

export function expirationColor(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return "gray";
  if (days < 0) return "red";
  if (days <= 30) return "red";
  if (days <= 90) return "yellow";
  return "green";
}

export function doctorStatusColor(doctor) {
  const {
    credentialing_status,
    missing_docs_count,
    insurance_expiry,
    license_expiry,
  } = doctor;
  if (credentialing_status === "expired") return "red";
  if (missing_docs_count > 0) return "yellow";
  const insColor = expirationColor(insurance_expiry);
  const licColor = expirationColor(license_expiry);
  if (insColor === "red" || licColor === "red") return "red";
  if (insColor === "yellow" || licColor === "yellow") return "yellow";
  if (credentialing_status === "complete") return "green";
  return "blue";
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = parseISO(dateStr);
  if (!isValid(d)) return dateStr;
  return format(d, "MM/dd/yyyy");
}

export function urgencyLabel(days) {
  if (days === null) return "";
  if (days < 0) return "Expired";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}

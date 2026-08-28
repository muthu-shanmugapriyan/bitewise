export function formatMoney(value, currency = "INR") {
  const sym = currency === "INR" || currency === "₹" ? "₹" : `${currency} `;
  return `${sym}${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(dateString) {
  if (!dateString) return { day: "TODAY", full: "" };
  const d = new Date(`${dateString}T00:00:00`);
  return {
    day: d.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase(),
    full: d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).toUpperCase(),
  };
}

export function formatCalendarBadge(dateString) {
  if (!dateString) return { num: "--", mon: "" };
  const d = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(d.getTime())) return { num: "--", mon: "" };
  return {
    num: String(d.getDate()).padStart(2, "0"),
    mon: d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
  };
}

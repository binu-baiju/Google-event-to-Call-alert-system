/** Format ISO date to readable short form (e.g. "Feb 17, 1:30 PM"). */
export function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Format ISO date to relative time (e.g. "in 3 min"). */
export function formatRelative(iso: string) {
  const mins = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (mins <= 0) return "starting";
  if (mins === 1) return "in 1 min";
  return `in ${mins} min`;
}

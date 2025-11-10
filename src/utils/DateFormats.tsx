export const formatSmartDate = (isoDate: string): string => {
  const inputDate = new Date(isoDate);
  const now = new Date();

  // Remove time part for date-only comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thatDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());

  const diffDays = Math.floor((today.getTime() - thatDay.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  }

  const optionsDate: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  const optionsTime: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: true };

  return `${inputDate.toLocaleDateString("en-US", optionsDate)}, ${inputDate.toLocaleTimeString(
    "en-US",
    optionsTime
  )}`;
};


export const formatReadableDate = (isoString:any) => {
  if (!isoString) return '';

  const date = new Date(isoString);

  const options = {
    month: 'short',   // "Oct"
    day: 'numeric',   // "1"
    year: 'numeric',  // "2025"
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  // Example: "Oct 1, 2025, 11:30 AM"
  const formatted = date.toLocaleString('en-US', options);

  // Replace the comma before time with " at "
  return formatted.replace(',', ' at');
};

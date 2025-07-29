const formatDateTime = (date) => {
  // Always format in Israel’s time-zone
  const tz = 'Asia/Jerusalem';
  const optsDate = { timeZone: tz, day: '2-digit', month: '2-digit', year: 'numeric' };
  const optsTime = { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

  // Format the date, then swap any dots for slashes
  const displayDate = new Intl.DateTimeFormat('he-IL', optsDate)
                        .format(date)
                        .replaceAll('.', '/');   // 29/07/2025

  const displayTime = new Intl.DateTimeFormat('he-IL', optsTime).format(date); // 13:09:24

  return { displayDate, displayTime };
};

module.exports = formatDateTime;
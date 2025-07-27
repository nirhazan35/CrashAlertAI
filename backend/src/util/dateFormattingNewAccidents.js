const formatDateTime = (date) => {
  // Force formatting in Israel’s zone no matter where the server is
  const optsDate = { timeZone: 'Asia/Jerusalem', day: '2-digit',
                     month: '2-digit', year: 'numeric' };
  const optsTime = { timeZone: 'Asia/Jerusalem', hour: '2-digit',
                     minute: '2-digit', second: '2-digit',
                     hour12: false };

  const displayDate = new Intl.DateTimeFormat('he-IL', optsDate).format(date);
  const displayTime = new Intl.DateTimeFormat('he-IL', optsTime).format(date);

  return { displayDate, displayTime };
};

module.exports = formatDateTime;
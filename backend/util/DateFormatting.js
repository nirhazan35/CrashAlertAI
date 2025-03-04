const formatDateTime = (accidentDate) => {
    const date = new Date(accidentDate);
  
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();
  
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
  
    return {
      displayDate: `${day}/${month}/${year}`,
      displayTime: `${hours}:${minutes}:${seconds}`,
    };
  };
  
  module.exports = formatDateTime;
  
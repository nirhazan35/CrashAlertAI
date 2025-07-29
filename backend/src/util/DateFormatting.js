const formatDateTime = (accidentDate) => {
    console.log("in dataFormatting, accidentDate: ", accidentDate);
    
    const date = accidentDate;
  
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
  
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    displayDate= `${day}/${month}/${year}`,
    displayTime= `${hours}:${minutes}:${seconds}`,
    console.log("in dataFormatting, displayDate: ", displayDate);
    console.log("in dataFormatting, displayTime: ", displayTime);
    return {
      displayDate: `${day}/${month}/${year}`,
      displayTime: `${hours}:${minutes}:${seconds}`,
    };
  };
  
  module.exports = formatDateTime;
  
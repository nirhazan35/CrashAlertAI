import { useState, useEffect } from 'react';

export function useFilterLogs(initialLogs = []) {
  const [filters, setFilters] = useState({
    cameraId: '',
    location: '',
    startDate: null,
    endDate: null,
    severity: '',
    startTime: '',
    endTime: '',
  });
  const [filteredLogs, setFilteredLogs] = useState(initialLogs);

  // whenever the source logs change, reset the filtered set
  useEffect(() => {
    setFilteredLogs(initialLogs);
  }, [initialLogs]);

  const applyFilters = () => {
    const newFiltered = initialLogs.filter((log) => {
      // cameraId
      const matchesCamera =
        !filters.cameraId ||
        (log.cameraId || '')
          .toString()
          .toLowerCase() === filters.cameraId.toLowerCase();

      // location
      const matchesLocation =
        !filters.location ||
        (log.location || '')
          .toString()
          .toLowerCase() === filters.location.toLowerCase();

      // date range
      let matchesDate = true;
      if (filters.startDate && log.date) {
        const logDate = new Date(log.date);
        const sd = new Date(filters.startDate);
        sd.setHours(0, 0, 0, 0);
        matchesDate = logDate >= sd;
      }
      if (matchesDate && filters.endDate && log.date) {
        const logDate = new Date(log.date);
        const ed = new Date(filters.endDate);
        ed.setHours(23, 59, 59, 999);
        matchesDate = logDate <= ed;
      }

      // severity
      const matchesSeverity =
        !filters.severity ||
        (log.severity || '')
          .toString()
          .toLowerCase() === filters.severity.toLowerCase();

      // time range
      let matchesTime = true;
      if (filters.startTime && log.displayTime) {
        matchesTime = log.displayTime >= filters.startTime;
      }
      if (matchesTime && filters.endTime && log.displayTime) {
        matchesTime = log.displayTime <= filters.endTime;
      }

      return (
        matchesCamera &&
        matchesLocation &&
        matchesDate &&
        matchesSeverity &&
        matchesTime
      );
    });

    setFilteredLogs(newFiltered);
  };

  const clearFilters = () => {
    setFilters({
      cameraId: '',
      location: '',
      startDate: null,
      endDate: null,
      severity: '',
      startTime: '',
      endTime: '',
    });
    setFilteredLogs(initialLogs);
  };

  return {
    filters,
    setFilters,
    filteredLogs,
    applyFilters,
    clearFilters,
  };
}

// src/context/FilterContext.js
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
  } from 'react';
  import { useAccidentLogs } from './AccidentContext';
  import { useAuth } from '../authentication/AuthProvider';
  
  const FilterContext = createContext();

  
  export const FilterProvider = ({ children }) => {
    const { user } = useAuth();
    // 1. source logs
    const { accidentLogs } = useAccidentLogs();
    const logsToFilter = accidentLogs || [];
  
    // 2. camera & location data
    const [cameraData, setCameraData] = useState({
      cameras: [],
      locations: [],
    });
  
    // 3. filter criteria
    const [filters, setFilters] = useState({
      cameraId: '',
      location: '',
      startDate: null,
      endDate: null,
      severity: '',
      startTime: '',
      endTime: '',
    });
  
    // 4. derived, filtered logs
    const [filteredLogs, setFilteredLogs] = useState(logsToFilter);
  
    // fetch cameraData once
    useEffect(() => {
      let isMounted = true;
      const fetchCameraData = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_URL_BACKEND}/cameras/get-id_location`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user?.token}`,
              },
            }
          );
          const data = await response.json();
  
          if (data.success) {
            setCameraData({
              cameras: data.data.map((i) => i.cameraId) || [],
              locations: data.data.map((i) => i.location) || [],
            });
          } else {
            console.error('Error fetching camera data:', data);
            setCameraData({
              cameras: ['Camera 1', 'Camera 2', 'Camera 3', 'Camera 4'],
              locations: [
                'Parking Lot A',
                'Main Road',
                'Highway Junction',
                'Campus Entrance',
              ],
            });
          }
        } catch (err) {
          if (!isMounted) return;
          console.error('Error fetching camera data:', err);
          setCameraData({
            cameras: ['Camera 1', 'Camera 2', 'Camera 3', 'Camera 4'],
            locations: [
              'Parking Lot A',
              'Main Road',
              'Highway Junction',
              'Campus Entrance',
            ],
          });
        }
      };
      fetchCameraData();
      return () => {
        isMounted = false;
      };
    }, []);
  
    // whenever the source logs change, reset filteredLogs
    useEffect(() => {
      setFilteredLogs(logsToFilter);
    }, [logsToFilter]);
  
    // apply current filters to logsToFilter
    const applyFilters = () => {
      const newFiltered = logsToFilter.filter((log) => {
        // cameraId match
        const matchesCameraId =
          !filters.cameraId ||
          (log.cameraId || '')
            .toString()
            .toLowerCase() === filters.cameraId.toLowerCase();
  
        // location match
        const matchesLocation =
          !filters.location ||
          (log.location || '')
            .toString()
            .toLowerCase() === filters.location.toLowerCase();
  
        // date
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
  
        // time
        let matchesTime = true;
        if (filters.startTime && log.displayTime) {
          matchesTime = log.displayTime >= filters.startTime;
        }
        if (matchesTime && filters.endTime && log.displayTime) {
          matchesTime = log.displayTime <= filters.endTime;
        }
  
        return (
          matchesCameraId &&
          matchesLocation &&
          matchesDate &&
          matchesSeverity &&
          matchesTime
        );
      });
  
      setFilteredLogs(newFiltered);
    };
  
    // clear all filters
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
      setFilteredLogs(logsToFilter);
    };
  
    return (
      <FilterContext.Provider
        value={{
          cameraData,
          filters,
          setFilters,
          filteredLogs,
          applyFilters,
          clearFilters,
        }}
      >
        {children}
      </FilterContext.Provider>
    );
  };
  
  export const useFilter = () => {
    const ctx = useContext(FilterContext);
    if (!ctx) {
      throw new Error('useFilter must be used within a FilterProvider');
    }
    return ctx;
  };
  
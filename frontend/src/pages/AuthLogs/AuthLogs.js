import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../authentication/AuthProvider';
import './AuthLogs.css';

// Debounce utility function
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AuthLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  // Filter state
  const [filters, setFilters] = useState({
    username: '',
    type: '',
    result: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    ipAddress: '',
    browser: '',
    operatingSystem: ''
  });

  // Debounce filters to prevent excessive API calls
  const debouncedFilters = useDebounce(filters, 300);

  // Create query parameters from filters
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append('page', pagination.page);
    params.append('limit', pagination.limit);
    
    // Add filters to query params if they exist
    Object.entries(debouncedFilters).forEach(([key, value]) => {
      if (value && value.trim()) {
        // Special handling for "Unknown" values to include null/undefined values
        if (value === 'Unknown' && 
           (key === 'browser' || key === 'operatingSystem' || key === 'ipAddress')) {
          params.append(key, 'Unknown');
          // Add parameter to indicate we want to include null/undefined values
          params.append(`${key}IncludeNull`, 'true');
        } else {
          params.append(key, value);
        }
      }
    });
    
    return params.toString();
  }, [debouncedFilters, pagination.page, pagination.limit]);

  // Fetch logs with current filters and pagination
  const fetchLogs = useCallback(async () => {
    if (!user?.token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${process.env.REACT_APP_URL_BACKEND}/auth/logs?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch authentication logs');
      }

      const data = await response.json();
      
      if (data.success) {
        setLogs(data.data.logs);
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          pages: data.data.pagination.pages
        }));
      } else {
        throw new Error(data.message || 'Failed to fetch logs');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching auth logs:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.token, queryParams]);

  // Load logs when dependencies change
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset to first page when filter changes
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      username: '',
      type: '',
      result: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      ipAddress: '',
      browser: '',
      operatingSystem: ''
    });
    
    // Reset pagination to first page
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="auth-logs-container">
      <h1>Authentication Logs</h1>
      
      {/* Filter Form */}
      <div className="logs-filter-container">
        <div className="filter-grid">
          <div className="filter-group">
            <label>Username</label>
            <input 
              type="text" 
              name="username" 
              value={filters.username} 
              onChange={handleFilterChange} 
              placeholder="Filter by username"
            />
          </div>
          
          <div className="filter-group">
            <label>Action Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="Login">Login</option>
              <option value="Logout">Logout</option>
              <option value="Register">Register</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Result</label>
            <select name="result" value={filters.result} onChange={handleFilterChange}>
              <option value="">All Results</option>
              <option value="Success">Success</option>
              <option value="Failure">Failure</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>IP Address</label>
            <input 
              type="text" 
              name="ipAddress" 
              value={filters.ipAddress} 
              onChange={handleFilterChange} 
              placeholder="Filter by IP"
            />
          </div>
          
          <div className="filter-group">
            <label>Browser</label>
            <select name="browser" value={filters.browser} onChange={handleFilterChange}>
              <option value="">All Browsers</option>
              <option value="Chrome">Chrome</option>
              <option value="Firefox">Firefox</option>
              <option value="Safari">Safari</option>
              <option value="Edge">Edge</option>
              <option value="Internet Explorer">Internet Explorer</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Operating System</label>
            <select name="operatingSystem" value={filters.operatingSystem} onChange={handleFilterChange}>
              <option value="">All OS</option>
              <option value="Windows">Windows</option>
              <option value="MacOS">MacOS</option>
              <option value="Linux">Linux</option>
              <option value="Android">Android</option>
              <option value="iOS">iOS</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Start Date</label>
            <input 
              type="date" 
              name="startDate" 
              value={filters.startDate} 
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input 
              type="date" 
              name="endDate" 
              value={filters.endDate} 
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label>Start Time</label>
            <input 
              type="time" 
              name="startTime" 
              value={filters.startTime} 
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label>End Time</label>
            <input 
              type="time" 
              name="endTime" 
              value={filters.endTime} 
              onChange={handleFilterChange}
            />
          </div>
        </div>
        
        <div className="filter-actions">
          <button type="button" className="btn-reset" onClick={handleResetFilters}>Reset Filters</button>
        </div>
      </div>
      
      {/* Logs Table */}
      {loading ? (
        <div className="loading">Loading authentication logs...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : logs.length === 0 ? (
        <div className="no-logs">No authentication logs found</div>
      ) : (
        <div className="logs-table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Username</th>
                <th style={{ textAlign: 'center' }}>Date</th>
                <th style={{ textAlign: 'center' }}>Time</th>
                <th style={{ textAlign: 'center' }}>Action</th>
                <th style={{ textAlign: 'center' }}>Result</th>
                <th style={{ textAlign: 'center' }}>IP Address</th>
                <th style={{ textAlign: 'center' }}>Browser</th>
                <th style={{ textAlign: 'center' }}>OS</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index} className={log.result === 'Failure' ? 'failure-row' : ''}>
                  <td style={{ textAlign: 'center' }}>{log.username || 'Guest'}</td>
                  <td style={{ textAlign: 'center' }}>{log.displayDate || ''}</td>
                  <td style={{ textAlign: 'center' }}>{log.displayTime || ''}</td>
                  <td style={{ textAlign: 'center' }}>{log.type}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`result ${log.result.toLowerCase()}`}>
                      {log.result}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {(() => {
                      const ip = log.ipAddress || 'Unknown';
                      if (ip === '::1') return '127.0.0.1';
                      if (ip.startsWith('::ffff:')) return ip.slice(7);
                      return ip;
                    })()}
                  </td>
                  <td style={{ textAlign: 'center' }}>{log.browser || 'Unknown'}</td>
                  <td style={{ textAlign: 'center' }}>{log.operatingSystem || 'Unknown'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(1)} 
              disabled={pagination.page === 1}
            >
              First
            </button>
            <button 
              onClick={() => handlePageChange(pagination.page - 1)} 
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {pagination.page} of {pagination.pages} 
              (Total: {pagination.total} logs)
            </span>
            
            <button 
              onClick={() => handlePageChange(pagination.page + 1)} 
              disabled={pagination.page === pagination.pages}
            >
              Next
            </button>
            <button 
              onClick={() => handlePageChange(pagination.pages)} 
              disabled={pagination.page === pagination.pages}
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthLogs; 
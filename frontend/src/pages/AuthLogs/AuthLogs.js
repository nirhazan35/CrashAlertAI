import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../authentication/AuthProvider';
import './AuthLogs.css';

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

  // Fetch logs with current filters and pagination
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.page);
      queryParams.append('limit', pagination.limit);
      
      // Add filters to query params if they exist
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          // Special handling for "Unknown" values to include null/undefined values
          if (value === 'Unknown' && 
             (key === 'browser' || key === 'operatingSystem' || key === 'ipAddress')) {
            queryParams.append(key, 'Unknown');
            // Add parameter to indicate we want to include null/undefined values
            queryParams.append(`${key}IncludeNull`, 'true');
          } else {
            queryParams.append(key, value);
          }
        }
      });
      
      const response = await fetch(
        `${process.env.REACT_APP_URL_BACKEND}/auth/logs?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch authentication logs');
      }

      const data = await response.json();
      
      if (data.success) {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.message || 'Failed to fetch logs');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching auth logs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, user?.token]);

  // Load logs on component mount and when filters or pagination changes
  useEffect(() => {
    if (user?.token) {
      fetchLogs();
    }
  }, [user?.token, fetchLogs]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset to first page when filter changes
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Auto-apply filter change
    setTimeout(fetchLogs, 0);
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
    
    // Fetch logs with reset filters
    setTimeout(fetchLogs, 0);
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
                  <td style={{ textAlign: 'center' }}>{log.ipAddress || 'Unknown'}</td>
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
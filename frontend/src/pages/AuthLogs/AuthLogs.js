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

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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
                <th>Timestamp</th>
                <th>Username</th>
                <th>Action</th>
                <th>Result</th>
                <th>IP Address</th>
                <th>Browser</th>
                <th>OS</th>
                <th>Error Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className={log.result === 'Failure' ? 'failure-row' : ''}>
                  <td>{formatDate(log.timeStamp)}</td>
                  <td>{log.username}</td>
                  <td>{log.type}</td>
                  <td className={`result ${log.result.toLowerCase()}`}>{log.result}</td>
                  <td>{log.ipAddress}</td>
                  <td>{log.browser}</td>
                  <td>{log.operatingSystem}</td>
                  <td>{log.errorMessage || '-'}</td>
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
              &laquo; First
            </button>
            <button 
              onClick={() => handlePageChange(pagination.page - 1)} 
              disabled={pagination.page === 1}
            >
              &lt; Previous
            </button>
            <span className="page-info">
              Page {pagination.page} of {pagination.pages} 
              ({pagination.total} total records)
            </span>
            <button 
              onClick={() => handlePageChange(pagination.page + 1)} 
              disabled={pagination.page === pagination.pages}
            >
              Next &gt;
            </button>
            <button 
              onClick={() => handlePageChange(pagination.pages)} 
              disabled={pagination.page === pagination.pages}
            >
              Last &raquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthLogs; 
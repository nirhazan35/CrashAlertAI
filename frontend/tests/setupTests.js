// This file is needed for Jest configuration beyond what's in src/setupTests.js

// Import Jest DOM utilities for DOM testing
import '@testing-library/jest-dom';

// Add missing browser APIs in Node.js environment
if (typeof window !== 'undefined') {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock window.ResizeObserver
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })),
  });
}

// Mock console errors to keep test output clean
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    // Filter out specific React error messages that are expected during testing
    /Warning.*not wrapped in act/i.test(args[0]) ||
    /Warning.*A component is changing an uncontrolled input/i.test(args[0])
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Mock global fetch if not already mocked
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Setup environment variables commonly used in tests
process.env.REACT_APP_URL_BACKEND = 'http://localhost:8080'; 
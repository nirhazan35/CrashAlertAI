import { connectSocket, onNewAccident, onAccidentUpdate } from '../../services/socket';
import { io } from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client');

// We need to reset the module between tests to clear the socket variable
jest.mock('../../services/socket', () => {
  // Store the original module
  const originalModule = jest.requireActual('../../services/socket');

  // Return all exported functions but make them mockable
  return {
    __esModule: true,
    ...originalModule
  };
});

describe('Socket Service', () => {
  let mockSocket;
  let mockCallback;

  beforeEach(() => {
    // Clear the module cache to reset the socket variable
    jest.resetModules();

    // Create a mock socket object with all the needed event handlers
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    };

    // Reset the io mock and make it return our mockSocket
    io.mockReset();
    io.mockReturnValue(mockSocket);

    // Create a mock callback function
    mockCallback = jest.fn();

    // Set environment variable for testing
    process.env.REACT_APP_URL_BACKEND = 'http://test-backend.com';
  });

  afterEach(() => {
    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  describe('connectSocket', () => {
    it('should initialize socket with correct URL and auth token', () => {
      const testToken = 'test-auth-token';

      connectSocket(testToken);

      // Verify io was called with correct parameters
      expect(io).toHaveBeenCalledWith('http://test-backend.com', {
        auth: { token: testToken }
      });
    });

    it('should set up connect, connect_error, and disconnect event handlers', () => {
      connectSocket('test-token');

      // Verify all required event handlers were set up
      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });

    // Test console logs by mocking console methods
    it('should log appropriate messages on connection events', () => {
      // Mock console methods
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;

      console.log = jest.fn();
      console.error = jest.fn();

      connectSocket('test-token');

      // Extract the event handler functions
      const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
      const errorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error')[1];
      const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')[1];

      // Simulate events firing
      connectHandler();
      errorHandler({ message: 'Test error' });
      disconnectHandler();

      // Check if console methods were called with right messages
      expect(console.log).toHaveBeenCalledWith('Connected to Socket.IO server');
      expect(console.error).toHaveBeenCalledWith('Socket.IO connection error:', 'Test error');
      expect(console.log).toHaveBeenCalledWith('Disconnected from Socket.IO server');

      // Restore console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    });
  });

  describe('onNewAccident', () => {
    it('should throw error if socket is not initialized', () => {
      // Create a clean import of the module for this specific test
      jest.isolateModules(() => {
        const { onNewAccident } = require('../../services/socket');

        // Now this should throw since socket is undefined in the fresh module
        expect(() => {
          onNewAccident(mockCallback);
        }).toThrow('Socket not initialized. Call connectSocket first.');
      });
    });

    it('should register callback for new_accident event', () => {
      // First initialize the socket
      connectSocket('test-token');

      onNewAccident(mockCallback);

      // Verify event listener was set up
      expect(mockSocket.on).toHaveBeenCalledWith('new_accident', expect.any(Function));
    });

    it('should call provided callback when new_accident event occurs', () => {
      // Initialize socket
      connectSocket('test-token');

      // Register callback
      onNewAccident(mockCallback);

      // Extract the event handler function
      const eventHandler = mockSocket.on.mock.calls.find(call => call[0] === 'new_accident')[1];

      // Create test data
      const testData = { id: '123', location: 'Test Location' };

      // Simulate event firing
      eventHandler(testData);

      // Verify callback was called with the right data
      expect(mockCallback).toHaveBeenCalledWith(testData);
    });
  });

  describe('onAccidentUpdate', () => {
    it('should throw error if socket is not initialized', () => {
      // Create a clean import of the module for this specific test
      jest.isolateModules(() => {
        const { onAccidentUpdate } = require('../../services/socket');

        // Now this should throw since socket is undefined in the fresh module
        expect(() => {
          onAccidentUpdate(mockCallback);
        }).toThrow('Socket not initialized. Call connectSocket first.');
      });
    });

    it('should register callback for accident_update event', () => {
      // First initialize the socket
      connectSocket('test-token');

      onAccidentUpdate(mockCallback);

      // Verify event listener was set up
      expect(mockSocket.on).toHaveBeenCalledWith('accident_update', expect.any(Function));
    });

    it('should call provided callback when accident_update event occurs', () => {
      // Initialize socket
      connectSocket('test-token');

      // Register callback
      onAccidentUpdate(mockCallback);

      // Extract the event handler function
      const eventHandler = mockSocket.on.mock.calls.find(call => call[0] === 'accident_update')[1];

      // Create test data
      const testData = { id: '123', status: 'resolved' };

      // Simulate event firing
      eventHandler(testData);

      // Verify callback was called with the right data
      expect(mockCallback).toHaveBeenCalledWith(testData);
    });
  });
});
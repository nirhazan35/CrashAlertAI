import { connectSocket, disconnectSocket, onForceLogout, onNewAccident, onAccidentUpdate, onNotification } from '../../src/services/socket';

// Mock socket.io-client
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
  listeners: jest.fn((event) =>
    mockSocket.on.mock.calls
      .filter(call => call[0] === event)
      .map(call => call[1])
  ),
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket)
}));

describe('Socket Service', () => {
  let mockToken;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = 'test-token';
    process.env.REACT_APP_URL_BACKEND = 'http://localhost:8080';
  });

  afterEach(() => {
    delete process.env.REACT_APP_URL_BACKEND;
  });

  test('connectSocket establishes connection with correct parameters', () => {
    connectSocket(mockToken);
    
    const { io } = require('socket.io-client');
    expect(io).toHaveBeenCalledWith('http://localhost:8080', {
      auth: { token: mockToken }
    });
  });

  test('connectSocket sets up event listeners', () => {
    connectSocket(mockToken);
    
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('force_logout', expect.any(Function));
  });

  test('connectSocket handles missing token', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    connectSocket(null);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Cannot connect socket: No authentication token provided');
    const { io } = require('socket.io-client');
    expect(io).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test('disconnectSocket calls socket.disconnect and clears socket', () => {
    connectSocket(mockToken);
    disconnectSocket();
    
    expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
  });

  test('onForceLogout sets up event handler for force logout', () => {
    const mockHandler = jest.fn();
    const mockMessage = 'Session expired';
    
    connectSocket(mockToken);
    onForceLogout(mockHandler);
    
    // Simulate force logout event
    const forceLogoutHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'force_logout'
    )[1];
    forceLogoutHandler({ message: mockMessage });
    
    expect(mockHandler).toHaveBeenCalledWith(mockMessage);
  });

  test('onNewAccident sets up event handler for new accidents', () => {
    const mockHandler = jest.fn();
    const mockAccident = { id: '123', type: 'collision' };
    
    connectSocket(mockToken);
    onNewAccident(mockHandler);
    
    // Simulate new accident event
    const newAccidentHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'new_accident'
    )[1];
    newAccidentHandler(mockAccident);
    
    expect(mockHandler).toHaveBeenCalledWith(mockAccident);
  });

  test('onAccidentUpdate sets up event handler for accident updates', () => {
    const mockHandler = jest.fn();
    const mockUpdate = { id: '123', status: 'handled' };
    
    connectSocket(mockToken);
    onAccidentUpdate(mockHandler);
    
    // Simulate accident update event
    const updateHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'accident_update'
    )[1];
    updateHandler(mockUpdate);
    
    expect(mockHandler).toHaveBeenCalledWith(mockUpdate);
  });

  test('onNotification sets up event handler for notifications', () => {
    const mockHandler = jest.fn();
    const mockNotification = { type: 'alert', message: 'New accident detected' };
    
    connectSocket(mockToken);
    onNotification(mockHandler);
    
    // Simulate notification event
    const notificationHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'new_notification'
    )[1];
    notificationHandler(mockNotification);
    
    expect(mockHandler).toHaveBeenCalledWith(mockNotification);
  });

  test('event handlers throw error when socket is not initialized', () => {
    const mockHandler = jest.fn();
    
    // Ensure socket is null
    disconnectSocket();
    
    expect(() => onNewAccident(mockHandler)).toThrow('Socket not initialized. Call connectSocket first.');
    expect(() => onAccidentUpdate(mockHandler)).toThrow('Socket not initialized. Call connectSocket first.');
    expect(() => onNotification(mockHandler)).toThrow('Socket not initialized. Call connectSocket first.');
  });
}); 
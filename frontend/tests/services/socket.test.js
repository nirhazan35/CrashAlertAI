import { connectSocket, disconnectSocket, onForceLogout } from '../../src/services/socket';
import io from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  };
  return jest.fn(() => mockSocket);
});

describe('Socket Service', () => {
  let mockToken;
  let mockSocket;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = 'test-token';
    mockSocket = io();
    process.env.REACT_APP_URL_BACKEND = 'http://localhost:8080';
  });

  afterEach(() => {
    delete process.env.REACT_APP_URL_BACKEND;
  });

  test('connectSocket establishes connection with correct parameters', () => {
    connectSocket(mockToken);
    
    expect(io).toHaveBeenCalledWith('http://localhost:8080', {
      auth: {
        token: mockToken
      },
      transports: ['websocket', 'polling']
    });
  });

  test('connectSocket sets up event listeners', () => {
    connectSocket(mockToken);
    
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('notification', expect.any(Function));
  });

  test('disconnectSocket calls socket.disconnect', () => {
    connectSocket(mockToken);
    disconnectSocket();
    
    expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
  });

  test('onForceLogout sets up event handler for force logout', () => {
    const mockHandler = jest.fn();
    
    connectSocket(mockToken);
    onForceLogout(mockHandler);
    
    expect(mockSocket.on).toHaveBeenCalledWith('force_logout', mockHandler);
  });
}); 
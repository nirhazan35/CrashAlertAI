import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import LiveCameraPage from '../../src/pages/LiveCameraPage/LiveCameraPage';
import { AuthProvider } from '../../src/authentication/AuthProvider';
import { renderWithMantine } from '../utils/test-utils';

// Mock the modules
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn(() => ({
    user: { token: 'mock-token' },
  })),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

// Mock fetch API
global.fetch = jest.fn();

describe('LiveCameraPage Component', () => {
  const mockCameras = [
    {
      _id: '1',
      name: 'Camera1',
      location: 'Location1',
      status: 'active',
      ipAddress: '192.168.1.1'
    },
    {
      _id: '2',
      name: 'Camera2',
      location: 'Location2',
      status: 'inactive',
      ipAddress: '192.168.1.2'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockCameras })
    });
  });

  test('renders live camera page', async () => {
    renderWithMantine(
      <BrowserRouter>
        <LiveCameraPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/live camera feed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /grid/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /list/i })).toBeInTheDocument();
  });

  test('loads and displays cameras', async () => {
    renderWithMantine(
      <BrowserRouter>
        <LiveCameraPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Camera1')).toBeInTheDocument();
      expect(screen.getByText('Location1')).toBeInTheDocument();
      expect(screen.getByText('Camera2')).toBeInTheDocument();
      expect(screen.getByText('Location2')).toBeInTheDocument();
    });
  });

  test('toggles between grid and list view', async () => {
    renderWithMantine(
      <BrowserRouter>
        <LiveCameraPage />
      </BrowserRouter>
    );

    const listButton = screen.getByRole('button', { name: /list/i });
    fireEvent.click(listButton);

    await waitFor(() => {
      expect(screen.getByTestId('list-view')).toBeInTheDocument();
    });

    const gridButton = screen.getByRole('button', { name: /grid/i });
    fireEvent.click(gridButton);

    await waitFor(() => {
      expect(screen.getByTestId('grid-view')).toBeInTheDocument();
    });
  });

  test('expands camera view when clicked', async () => {
    renderWithMantine(
      <BrowserRouter>
        <LiveCameraPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Camera1')).toBeInTheDocument();
    });

    const expandButton = screen.getByTestId('expand-camera-1');
    fireEvent.click(expandButton);

    expect(screen.getByTestId('expanded-camera')).toBeInTheDocument();
    expect(screen.getByText('Camera1')).toBeInTheDocument();
  });

  test('handles error when loading cameras', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to load cameras'));

    renderWithMantine(
      <BrowserRouter>
        <LiveCameraPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load cameras/i)).toBeInTheDocument();
    });
  });
}); 
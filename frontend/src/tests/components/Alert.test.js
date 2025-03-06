import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Alert from "./Alert";
import { useAuth } from "../../authentication/AuthProvider";
import { useAccidentLogs } from "../../context/AccidentContext";

// Mock the hooks
jest.mock("../../authentication/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../context/AccidentContext", () => ({
  useAccidentLogs: jest.fn(),
}));

describe("Alert Component", () => {
  // Setup common test data
  const mockUser = { username: "testuser" };
  const mockAlert = {
    _id: "123",
    status: "pending",
    cameraId: "camera1",
    location: "Building A",
    displayDate: "2025-03-06",
    displayTime: "14:30",
    severity: "medium",
    description: "Test description",
    falsePositive: false,
    video: "test-video.mp4",
    assignedTo: "testuser",
  };

  const mockUpdateAccidentDetails = jest.fn();
  const mockUpdateAccidentStatus = jest.fn();
  const mockClearSelectedAlert = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    useAuth.mockReturnValue({ user: mockUser });
    useAccidentLogs.mockReturnValue({
      selectedAlert: mockAlert,
      updateAccidentDetails: mockUpdateAccidentDetails,
      updateAccidentStatus: mockUpdateAccidentStatus,
      clearSelectedAlert: mockClearSelectedAlert,
    });
  });

  test("renders 'No accident selected' when no alert is selected", () => {
    useAccidentLogs.mockReturnValue({
      selectedAlert: null,
      updateAccidentDetails: mockUpdateAccidentDetails,
      updateAccidentStatus: mockUpdateAccidentStatus,
      clearSelectedAlert: mockClearSelectedAlert,
    });

    render(<Alert />);
    expect(screen.getByText("No accident selected.")).toBeInTheDocument();
  });

  test("renders alert details when an alert is selected", () => {
    render(<Alert />);

    // Check if basic details are displayed
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.getByText("Camera ID:")).toBeInTheDocument();
    expect(screen.getByText("camera1")).toBeInTheDocument();
    expect(screen.getByText("Location:")).toBeInTheDocument();
    expect(screen.getByText("Building A")).toBeInTheDocument();
    expect(screen.getByText("Date:")).toBeInTheDocument();
    expect(screen.getByText("2025-03-06")).toBeInTheDocument();
    expect(screen.getByText("Time:")).toBeInTheDocument();
    expect(screen.getByText("14:30")).toBeInTheDocument();
    expect(screen.getByText("Severity:")).toBeInTheDocument();
    expect(screen.getByText("Description:")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  test("renders video element with correct source", () => {
    render(<Alert />);
    const videoElement = screen.getByText("Your browser does not support the video tag.").parentElement;
    expect(videoElement.tagName).toBe("VIDEO");
    expect(videoElement.querySelector("source").getAttribute("src")).toBe("test-video.mp4");
  });

  test("allows description editing when user is assigned to the alert", async () => {
    render(<Alert />);

    // Find and click the edit button
    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    // Check if textarea appears
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe("Test description");

    // Edit the description
    fireEvent.change(textarea, { target: { value: "Updated description" } });
    expect(textarea.value).toBe("Updated description");

    // Save the changes
    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    // Verify that updateAccidentDetails was called with correct args
    await waitFor(() => {
      expect(mockUpdateAccidentDetails).toHaveBeenCalledWith({
        accident_id: "123",
        description: "Updated description",
      });
    });
  });

  test("allows severity change when user is assigned to the alert", async () => {
    // Mock window.confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);

    render(<Alert />);

    // Find and change the severity dropdown
    const selectElement = screen.getByRole("combobox");
    fireEvent.change(selectElement, { target: { value: "high" } });

    // Verify that updateAccidentDetails was called with correct args
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith("Change severity from medium to high?");
      expect(mockUpdateAccidentDetails).toHaveBeenCalledWith({
        accident_id: "123",
        severity: "high",
      });
    });

    // Restore original window.confirm
    window.confirm = originalConfirm;
  });

  test("cancels description editing without saving", () => {
    render(<Alert />);

    // Find and click the edit button
    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    // Edit the description
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Cancelled change" } });

    // Cancel the changes
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    // Verify that updateAccidentDetails was not called
    expect(mockUpdateAccidentDetails).not.toHaveBeenCalled();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  test("toggles accident mark when button is clicked", async () => {
    // Mock window.confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);

    render(<Alert />);

    // Find and click the toggle button
    const toggleButton = screen.getByText("Mark As Not An Accident");
    fireEvent.click(toggleButton);

    // Verify that updateAccidentDetails was called with correct args
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith("Mark as not an accident?");
      expect(mockUpdateAccidentDetails).toHaveBeenCalledWith({
        accident_id: "123",
        falsePositive: true,
      });
    });

    // Restore original window.confirm
    window.confirm = originalConfirm;
  });

  test("marks accident as handled when button is clicked", async () => {
    // Mock window.confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);

    render(<Alert />);

    // Find and click the handle button
    const handleButton = screen.getByText("Mark As Handled");
    fireEvent.click(handleButton);

    // Verify that updateAccidentStatus and clearSelectedAlert were called correctly
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith("Mark this accident as handled?");
      expect(mockUpdateAccidentStatus).toHaveBeenCalledWith("123", "handled");
      expect(mockClearSelectedAlert).toHaveBeenCalled();
    });

    // Restore original window.confirm
    window.confirm = originalConfirm;
  });

  test("doesn't show edit controls when user is not assigned to the alert", () => {
    useAccidentLogs.mockReturnValue({
      selectedAlert: { ...mockAlert, assignedTo: "anotheruser" },
      updateAccidentDetails: mockUpdateAccidentDetails,
      updateAccidentStatus: mockUpdateAccidentStatus,
      clearSelectedAlert: mockClearSelectedAlert,
    });

    render(<Alert />);

    // Check if edit buttons are not present
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Mark As Not An Accident")).not.toBeInTheDocument();
    expect(screen.queryByText("Mark As Handled")).not.toBeInTheDocument();

    // Check if severity is displayed as text, not as a dropdown
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByText("medium")).toBeInTheDocument();
  });

  test("doesn't show 'Mark As Handled' button when status is already 'handled'", () => {
    useAccidentLogs.mockReturnValue({
      selectedAlert: { ...mockAlert, status: "handled" },
      updateAccidentDetails: mockUpdateAccidentDetails,
      updateAccidentStatus: mockUpdateAccidentStatus,
      clearSelectedAlert: mockClearSelectedAlert,
    });

    render(<Alert />);

    // Check if Mark As Handled button is not present
    expect(screen.queryByText("Mark As Handled")).not.toBeInTheDocument();
  });
});
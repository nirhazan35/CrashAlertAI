import { render, screen } from "@testing-library/react";
import App from "../App";
import { AuthProvider } from "../authentication/AuthProvider";

describe("App Component", () => {
  test("renders without crashing", () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );

    // Check for navigation element which is definitely present
    expect(screen.getByText("Navigation")).toBeInTheDocument();

    // Check for sidebar menu items
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Statistics")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Live Feed")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();

    // If you still want to check for loading state
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
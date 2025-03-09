import { render, screen } from "@testing-library/react";
import SidebarLayout from "../../components/sidebar/SidebarLayout";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../authentication/AuthProvider";
import * as AuthModule from "../../authentication/AuthProvider";

describe("SidebarLayout Component", () => {
  test("renders sidebar layout", () => {
    // Mock the useAuth hook
    jest.spyOn(AuthModule, "useAuth").mockReturnValue({
      user: { username: "testuser" },
      login: jest.fn(),
      logout: jest.fn(),
      // Add any other properties your auth context provides
    });

    render(
      <MemoryRouter>
        <SidebarLayout />
      </MemoryRouter>
    );

    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });
});
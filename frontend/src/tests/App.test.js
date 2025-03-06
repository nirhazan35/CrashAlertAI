import { render, screen } from "@testing-library/react";
import App from "../App";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../authentication/AuthProvider";

describe("App Component", () => {
  test("renders without crashing", () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });
});

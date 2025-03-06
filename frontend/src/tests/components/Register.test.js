import { render, screen, fireEvent } from "@testing-library/react";
import Register from "../../pages/Register/Register";
import { AuthProvider } from "../../authentication/AuthProvider";

describe("Register Component", () => {
  const renderComponent = () =>
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    );

  test("renders registration form", () => {
    renderComponent();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  test("allows inputting username, email, and password", () => {
    renderComponent();
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(usernameInput.value).toBe("testuser");
    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  test("displays error when registration fails", async () => {
    renderComponent();
    const registerButton = screen.getByText(/Register/i);
    fireEvent.click(registerButton);

    expect(await screen.findByText(/Failed to create user/i)).toBeInTheDocument();
  });
});

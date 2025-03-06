import { render, screen } from "@testing-library/react";
import SidebarLayout from "../../components/sidebar/SidebarLayout";
import { MemoryRouter } from "react-router-dom";

describe("SidebarLayout Component", () => {
  test("renders sidebar layout", () => {
    render(
      <MemoryRouter>
        <SidebarLayout />
      </MemoryRouter>
    );

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });
});

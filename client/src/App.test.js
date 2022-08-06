import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

jest.mock("./components/Layout", () => ({ children }) => <div>{children}</div>);
jest.mock("./components/RequireAuth", () => {
  const { Outlet } = require("react-router-dom");
  return () => <Outlet />;
});
jest.mock("./pages/Home", () => () => <h1>Home Page</h1>);
jest.mock("./pages/Login", () => () => <h1>Login Page</h1>);
jest.mock("./pages/Applications", () => () => <h1>Applications Page</h1>);
jest.mock("./pages/Job", () => () => <h1>Job Page</h1>);

describe("App routes", () => {
  it("renders home route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  it("renders login route", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});

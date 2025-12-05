import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth } from "../../test-utils/CommonMocks.js";
import ForgotPassword from "./ForgotPassword.js";
import axiosInstance from "../../config/axios-config.js";

mockAxios();
mockUseAuth();
mockReactQuery();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe('Forgot Password Component', () => {
  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={ queryClient }>
          <TolgeeProvider fallback={ "Loading tolgee..." } tolgee={ mockTolgee }>
            <ForgotPassword />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  }

  it('should render the component with required fields', () => {
    setup();
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it('should validate for email', async () => {
    setup();
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    const emailInput = screen.getByLabelText("Email Address");
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });
    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);
    expect(axiosInstance.post).toHaveBeenCalledWith(
      "api/v1/auth/request-reset-password",
      { email: "test@gmail.com" }
    );
  });
})

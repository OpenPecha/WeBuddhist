import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import PaginationComponent from "./PaginationComponent.js";

const mockHandlePageChange = vi.fn();
const mockSetPagination = vi.fn();

describe("PaginationComponent", () => {
  const pagination = { currentPage: 1, limit: 10 };
  const totalPages = 5;
  const user = userEvent.setup({ pointerEventsCheck: 0 });

  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.hasPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
  });

  const setup = (override: any = {}) => {
    render(
      <PaginationComponent
        pagination={override.pagination || pagination}
        totalPages={override.totalPages ?? totalPages}
        handlePageChange={mockHandlePageChange}
        setPagination={mockSetPagination}
      />,
    );
  };

  const getPaginationLinks = () => {
    const links = screen.getAllByRole("link");
    return {
      prevLink: screen.getByLabelText("Go to previous page"),
      nextLink: screen.getByLabelText("Go to next page"),
      allLinks: links,
    };
  };

  test("renders pagination buttons correctly", () => {
    setup();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  test("disables previous button on first page", () => {
    setup();
    const { prevLink } = getPaginationLinks();
    expect(prevLink).toHaveAttribute("aria-disabled", "true");
  });

  test("renders nothing when totalPages is 0", () => {
    const { container } = render(
      <PaginationComponent
        pagination={{ currentPage: 1, limit: 10 }}
        totalPages={0}
        handlePageChange={mockHandlePageChange}
        setPagination={mockSetPagination}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  test("disables next button on last page", () => {
    setup({ pagination: { currentPage: totalPages, limit: 10 } });
    const { nextLink } = getPaginationLinks();
    expect(nextLink).toHaveAttribute("aria-disabled", "true");
  });

  test("calls handlePageChange when clicking a page number", async () => {
    setup();
    await user.click(screen.getByText("3"));
    expect(mockHandlePageChange).toHaveBeenCalledWith(3);
  });

  test("calls handlePageChange when clicking next button", async () => {
    setup();
    const { nextLink } = getPaginationLinks();
    await user.click(nextLink);
    expect(mockHandlePageChange).toHaveBeenCalledWith(2);
  });

  test("calls handlePageChange when clicking previous button", async () => {
    setup({ pagination: { currentPage: 2, limit: 10 } });
    const { prevLink } = getPaginationLinks();
    await user.click(prevLink);
    expect(mockHandlePageChange).toHaveBeenCalledWith(1);
  });

  test("updates pagination when limit is changed", async () => {
    setup();
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    const option = await screen.findByText("20");
    await user.click(option);
    expect(mockSetPagination).toHaveBeenCalledWith({
      currentPage: 1,
      limit: 20,
    });
  });
});

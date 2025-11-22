import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import PaginationComponent from "./PaginationComponent.jsx";

const mockHandlePageChange = vi.fn();
const mockSetPagination = vi.fn();

describe("PaginationComponent", () => {
  const pagination = { currentPage: 1, limit: 10 };
  const totalPages = 5;

  const setup = () => {
    render(
      <PaginationComponent
        pagination={pagination}
        totalPages={totalPages}
        handlePageChange={mockHandlePageChange}
        setPagination={mockSetPagination}
      />
    );
  };

  const getPaginationButtons = () => {
    const buttons = screen.getAllByRole("button");
    return {
      prevButton: buttons[0],
      nextButton: buttons[buttons.length - 1],
      allButtons: buttons
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
    const { prevButton } = getPaginationButtons();
    expect(prevButton).toBeDisabled();
  });

  test("renders nothing when totalPages is 0", () => {
    const { container } = render(
      <PaginationComponent
        pagination={{ currentPage: 1, limit: 10 }}
        totalPages={0}
        handlePageChange={mockHandlePageChange}
        setPagination={mockSetPagination}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test("disables next button on last page", () => {
    render(
      <PaginationComponent
        pagination={{ currentPage: totalPages, limit: 10 }}
        totalPages={totalPages}
        handlePageChange={mockHandlePageChange}
        setPagination={mockSetPagination}
      />
    );
    const { nextButton } = getPaginationButtons();
    expect(nextButton).toBeDisabled();
  });

  test("calls handlePageChange when clicking a page number", async () => {
    setup();
    await userEvent.click(screen.getByText("3"));
    expect(mockHandlePageChange).toHaveBeenCalledWith(3);
  });

  test("calls handlePageChange when clicking next button", async () => {
    setup();
    const { nextButton } = getPaginationButtons();
    await userEvent.click(nextButton);
    expect(mockHandlePageChange).toHaveBeenCalledWith(2);
  });

  test("calls handlePageChange when clicking previous button", async () => {
    render(
      <PaginationComponent
        pagination={{ currentPage: 2, limit: 10 }}
        totalPages={totalPages}
        handlePageChange={mockHandlePageChange}
        setPagination={mockSetPagination}
      />
    );
    const { prevButton } = getPaginationButtons();
    await userEvent.click(prevButton);
    expect(mockHandlePageChange).toHaveBeenCalledWith(1);
  });

  test("updates pagination when limit is changed", async () => {
    setup();
    const select = screen.getByRole("combobox");
    await fireEvent.change(select, { target: { value: "20" } });
    expect(mockSetPagination).toHaveBeenCalledWith({ currentPage: 1, limit: 20 });
  });
});

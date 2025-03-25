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

  test("renders pagination buttons correctly", () => {
    setup();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  test("disables previous button on first page", () => {
    setup();
    expect(screen.getByText("Previous").parentElement?.parentElement).toHaveClass("page-item disabled");
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
    expect(screen.getByText("Next").parentElement?.parentElement).toHaveClass("page-item disabled");
  });

  test("calls handlePageChange when clicking a page number", async () => {
    setup();
    await userEvent.click(screen.getByText("3"));
    expect(mockHandlePageChange).toHaveBeenCalledWith(3);
  });

  test("calls handlePageChange when clicking next button", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
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
    await userEvent.click(screen.getByRole("button", { name: /previous/i }));
    expect(mockHandlePageChange).toHaveBeenCalledWith(1);
  });

  test("updates pagination when limit is changed", async () => {
    setup();
    const select = screen.getByRole("combobox");
    await fireEvent.change(select, { target: { value: "20" } });
    expect(mockSetPagination).toHaveBeenCalledWith({ currentPage: 1, limit: 20 });
  });
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import { SheetDeleteModal } from "./sheet_delete";

vi.mock("@tolgee/react", () => ({
  useTranslate: () => ({
    t: (key) => {
      const translations = {
        "sheet.delete_header": "Delete Sheet",
        "sheet.delete_warning_message": "Are you sure you want to delete this sheet? This action cannot be undone.",
        "sheet.delete_cancel": "Cancel",
        "sheet.delete_button": "Delete",
        "sheet.deleting.message": "Deleting...",
      };
      return translations[key] || key;
    },
  }),
}));

describe("SheetDeleteModal Component", () => {
  const mockOnClose = vi.fn();
  const mockOnDelete = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onDelete: mockOnDelete,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the modal when isOpen is true", () => {
    render(<SheetDeleteModal {...defaultProps} />);
    
    expect(screen.getByText("Delete Sheet")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to delete this sheet? This action cannot be undone.")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  test("does not render the modal when isOpen is false", () => {
    render(<SheetDeleteModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText("Delete Sheet")).not.toBeInTheDocument();
  });

  test("calls onClose when close button (×) is clicked", () => {
    render(<SheetDeleteModal {...defaultProps} />);
    
    const closeButton = screen.getByText("×");
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("calls onClose when Cancel button is clicked", () => {
    render(<SheetDeleteModal {...defaultProps} />);
    
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("calls onDelete when Delete button is clicked", () => {
    render(<SheetDeleteModal {...defaultProps} />);
    
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  test("displays loading state correctly when isLoading is true", () => {
    render(<SheetDeleteModal {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText("Deleting...")).toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  test("disables buttons when isLoading is true", () => {
    render(<SheetDeleteModal {...defaultProps} isLoading={true} />);
    
    const closeButton = screen.getByText("×");
    const cancelButton = screen.getByText("Cancel");
    const deleteButton = screen.getByText("Deleting...");
    
    expect(closeButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  test("renders with correct accessibility attributes", () => {
    render(<SheetDeleteModal {...defaultProps} />);
    
    const modal = screen.getByText("Delete Sheet").closest(".sheet-delete-modal-content");
    expect(modal).toBeInTheDocument();
    expect(modal.parentElement).toHaveClass("sheet-delete-modal-overlay");
  });
});

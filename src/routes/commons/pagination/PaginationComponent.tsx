import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaginationProps = {
  pagination: { currentPage: number; limit: number };
  totalPages: number;
  handlePageChange: (page: number) => void;
  setPagination: (pagination: { currentPage: number; limit: number }) => void;
};

const PaginationComponent: React.FC<PaginationProps> = ({
  pagination,
  totalPages,
  handlePageChange,
  setPagination,
}) => {
  if (totalPages === 0) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const isFirstPage = pagination.currentPage === 1;
  const isLastPage = pagination.currentPage === totalPages;

  const handleSelectChange = (value: string) => {
    setPagination({ currentPage: 1, limit: Number(value) });
  };

  const handleNav = (page: number) => {
    if (page < 1 || page > totalPages) return;
    handlePageChange(page);
  };

  return (
    <div className="flex flex-wrap justify-between mt-4 w-full items-center gap-4">
      <Pagination className="w-fit justify-center">
        <PaginationContent className="flex-wrap">
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-disabled={isFirstPage}
              className={isFirstPage ? "pointer-events-none opacity-50" : ""}
              onClick={(event) => {
                event.preventDefault();
                handleNav(pagination.currentPage - 1);
              }}
            />
          </PaginationItem>
          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === pagination.currentPage}
                onClick={(event) => {
                  event.preventDefault();
                  handleNav(page);
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              aria-disabled={isLastPage}
              className={isLastPage ? "pointer-events-none opacity-50" : ""}
              onClick={(event) => {
                event.preventDefault();
                handleNav(pagination.currentPage + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="flex w-fit items-center gap-2">
        <Select
          value={String(pagination.limit)}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger className="w-[90px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PaginationComponent;

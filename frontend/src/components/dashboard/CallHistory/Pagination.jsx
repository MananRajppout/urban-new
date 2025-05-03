import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  setCurrentPage,
}) => {
  const showingStart =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first, last, current and pages around current
    const pages = [1];

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if we're near the start
    if (currentPage <= 3) {
      endPage = Math.min(maxPagesToShow - 1, totalPages - 1);
    }

    // Adjust if we're near the end
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - maxPagesToShow + 2);
    }

    // Add ellipsis if needed
    if (startPage > 2) {
      pages.push("...");
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    // Add last page if not already included
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="py-0 px-6 flex items-center justify-between border-t border-subtle-border">
      <div className="flex items-center text-sm text-gray-400">
        <span>
          {totalItems === 0
            ? "No results"
            : `Showing ${showingStart}-${showingEnd} of ${totalItems} results`}
        </span>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center space-x-2">
          <button
            className="w-8 cursor-pointer h-8 flex items-center justify-center rounded-md glass-panel border border-subtle-border disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>

          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span key={`ellipsis-${index}`} className="text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={`page-${page}`}
                className={`border border-none cursor-pointer w-8 h-8 flex items-center justify-center rounded-md ${
                  page === currentPage
                    ? "bg-accent-teal text-black"
                    : "glass-panel border border-subtle-border text-gray-400 hover:text-white transition-colors"
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            )
          )}

          <button
            className="w-8 cursor-pointer h-8 flex items-center justify-center rounded-md glass-panel border border-subtle-border disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;

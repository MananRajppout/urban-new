
import React from 'react';
import {    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious} from '../ui/pagination';


const TransactionPagination = ({
  currentPage,
  totalPages,
  handlePageChange,
  className
}) => {
  return (
    <Pagination className={`justify-center md:justify-end ${className || ''}`}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => handlePageChange(currentPage - 1)}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>

        {(() => {
          const pageNumbers = [];

          // Always show first page
          pageNumbers.push(1);

          // Pages around current
          let startPage = Math.max(2, currentPage - 1);
          let endPage = Math.min(totalPages - 1, currentPage + 1);

          if (startPage > 2) pageNumbers.push('ellipsis-start');
          for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
          }
          if (endPage < totalPages - 1) pageNumbers.push('ellipsis-end');

          // Always show last page
          if (totalPages > 1) pageNumbers.push(totalPages);

          return Array.from(new Set(pageNumbers))?.map((pageNum, index) => {
            if (pageNum === 'ellipsis-start' || pageNum === 'ellipsis-end') {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <span className="px-2 py-2">...</span>
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  isActive={pageNum === currentPage}
                  onClick={() => handlePageChange(pageNum)}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          });
        })()}

        <PaginationItem>
          <PaginationNext
            onClick={() => handlePageChange(currentPage + 1)}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default TransactionPagination;

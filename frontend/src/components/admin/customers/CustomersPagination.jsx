'use client';

export default function CustomersPagination({data, handlePageChange}) {
  // Handle undefined or null data
  if (!data) {
    return null;
  }

  const { page = 1, totalPages = 1 } = data;

  // Validate page and totalPages are numbers
  const currentPage = typeof page === 'number' ? page : 1;
  const totalPageCount = typeof totalPages === 'number' ? totalPages : 1;

  // Don't render pagination if there's only one page or no pages
  if (totalPageCount <= 1) {
    return null;
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPageCount <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPageCount; i++) {
        pages.push(i);
      }
    } else {
      // Show limited pages with ellipsis
      if (currentPage <= 3) {
        // Show first 3 pages + last page
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        if (totalPageCount > 4) {
          pages.push('...');
        }
        pages.push(totalPageCount);
      } else if (currentPage >= totalPageCount - 2) {
        // Show first page + last 3 pages
        pages.push(1);
        if (totalPageCount > 4) {
          pages.push('...');
        }
        for (let i = totalPageCount - 2; i <= totalPageCount; i++) {
          pages.push(i);
        }
      } else {
        // Show first page + current page + surrounding pages + last page
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPageCount);
      }
    }
    
    return pages;
  };

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== '...' && pageNumber !== currentPage) {
      handlePageChange(pageNumber);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPageCount) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center mt-4">
      <nav className="flex items-center space-x-1">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage <= 1}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            currentPage <= 1
              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 bg-white border border-gray-300'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((pageNumber, index) => (
            <div key={index}>
              {pageNumber === '...' ? (
                <span className="px-3 py-2 text-sm text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => handlePageClick(pageNumber)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pageNumber === currentPage
                      ? 'bg-blue-600 text-white border border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 bg-white border border-gray-300'
                  }`}
                >
                  {pageNumber}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage >= totalPageCount}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            currentPage >= totalPageCount
              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 bg-white border border-gray-300'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>
  );
}

"use client"

import { cn } from "@/lib/utils"

type CustomPaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function CustomPagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className 
}: CustomPaginationProps) {
  if (totalPages <= 1) return null

  // Generate a range of pages to show (simplified for now)
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button 
        type="button" 
        aria-label="Previous" 
        className="mr-4 disabled:opacity-30 disabled:cursor-not-allowed group transition-all"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <svg width="9" height="16" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:-translate-x-0.5 transition-transform">
          <path d="M11 1L2 9.24242L11 17" stroke="#111820" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div className="flex gap-2 text-gray-500 text-sm md:text-base">
        {pages.map((page) => (
          <button 
            key={page}
            type="button" 
            onClick={() => onPageChange(page)}
            className={cn(
              "flex items-center justify-center active:scale-95 w-9 md:w-12 h-9 md:h-12 aspect-square rounded-md transition-all font-bold",
              currentPage === page 
                ? "bg-indigo-500 text-white" 
                : "bg-white border border-gray-200 hover:bg-gray-100/70"
            )}
          >
            {page}
          </button>
        ))}
      </div>

      <button 
        type="button" 
        aria-label="Next" 
        className="ml-4 disabled:opacity-30 disabled:cursor-not-allowed group transition-all"
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <svg width="9" height="16" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-0.5 transition-transform">
          <path d="M1 1L10 9.24242L1 17" stroke="#111820" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}

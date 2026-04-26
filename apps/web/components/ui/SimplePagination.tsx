"use client"

import { cn } from "@/lib/utils"

type SimplePaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className
}: SimplePaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div
      className={cn(
        "flex items-center justify-between w-full text-muted font-semibold text-xs uppercase tracking-wider",
        className
      )}
    >
      <button 
        type="button" 
        aria-label="prev"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="disabled:opacity-20 hover:scale-110 transition-transform text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-[var(--radius-sm)]"
      >
        <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.499 12.85a.9.9 0 0 1 .57.205l.067.06a.9.9 0 0 1 .06 1.206l-.06.066-5.585 5.586-.028.027.028.027 5.585 5.587a.9.9 0 0 1 .06 1.207l-.06.066a.9.9 0 0 1-1.207.06l-.066-.06-6.25-6.25a1 1 0 0 1-.158-.212l-.038-.08a.9.9 0 0 1-.03-.606l.03-.083a1 1 0 0 1 .137-.226l.06-.066 6.25-6.25a.9.9 0 0 1 .635-.263Z" fill="currentColor" fillOpacity="0.9" />
        </svg>
      </button>

      <span>Page {currentPage} of {totalPages}</span>

      <button 
        type="button" 
        aria-label="next"
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="disabled:opacity-20 hover:scale-110 transition-transform text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-[var(--radius-sm)]"
      >
        <svg className="rotate-180" width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.499 12.85a.9.9 0 0 1 .57.205l.067.06a.9.9 0 0 1 .06 1.206l-.06.066-5.585 5.586-.028.027.028.027 5.585 5.587a.9.9 0 0 1 .06 1.207l-.06.066a.9.9 0 0 1-1.207.06l-.066-.06-6.25-6.25a1 1 0 0 1-.158-.212l-.038-.08a.9.9 0 0 1-.03-.606l.03-.083a1 1 0 0 1 .137-.226l.06-.066 6.25-6.25a.9.9 0 0 1 .635-.263Z" fill="currentColor" fillOpacity="0.9" />
        </svg>
      </button>
    </div>
  )
}

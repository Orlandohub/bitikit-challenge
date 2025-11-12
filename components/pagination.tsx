"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
  pageWindow?: number;
}

const MIN_PAGE = 1;
const DEFAULT_PAGE_WINDOW = 3;

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  className,
  pageWindow = DEFAULT_PAGE_WINDOW,
}: PaginationProps) {
  const pages = useMemo(
    () =>
      buildPageWindow({
        currentPage,
        totalPages,
        windowSize: pageWindow,
      }),
    [currentPage, totalPages, pageWindow]
  );

  if (totalPages <= 1) {
    return null;
  }

  const handleChange = (page: number) => {
    if (page === currentPage || page < MIN_PAGE || page > totalPages) {
      return;
    }
    onPageChange(page);
  };

  return (
    <nav
      aria-label="Pagination"
      className={["flex items-center justify-center gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Button
        type="button"
        size="icon"
        variant="outline"
        aria-label="Previous page"
        disabled={currentPage === MIN_PAGE || isLoading}
        onClick={() => handleChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </Button>
      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          typeof page === "number" ? (
            <Button
              key={page}
              type="button"
              size="sm"
              variant={page === currentPage ? "default" : "outline"}
              disabled={page === currentPage || isLoading}
              onClick={() => handleChange(page)}
            >
              {page}
            </Button>
          ) : (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-muted-foreground"
              aria-hidden="true"
            >
              &hellip;
            </span>
          )
        )}
      </div>
      <Button
        type="button"
        size="icon"
        variant="outline"
        aria-label="Next page"
        disabled={currentPage === totalPages || isLoading}
        onClick={() => handleChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}

function buildPageWindow({
  currentPage,
  totalPages,
  windowSize,
}: {
  currentPage: number;
  totalPages: number;
  windowSize: number;
}): Array<number | "..."> {
  const pages: Array<number | "..."> = [];
  const clampedWindow = Math.max(1, Math.floor(windowSize));

  const start = Math.max(MIN_PAGE, currentPage - Math.floor(clampedWindow / 2));
  const end = Math.min(totalPages, start + clampedWindow - 1);

  if (start > MIN_PAGE) {
    pages.push(MIN_PAGE);
    if (start > MIN_PAGE + 1) {
      pages.push("...");
    }
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) {
      pages.push("...");
    }
    pages.push(totalPages);
  }

  return pages;
}

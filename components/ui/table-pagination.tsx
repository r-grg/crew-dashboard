"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface TablePaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onNext: () => void
  onPrev: () => void
  onGoTo: (page: number) => void
}

export function TablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onNext,
  onPrev,
  onGoTo,
}: TablePaginationProps) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...")
      acc.push(p)
      return acc
    }, [])

  return (
    <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
      <p className="text-sm text-zinc-500">
        {from}–{to} of {totalItems}
      </p>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={onPrev}
              className={`text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer ${
                page === 1 ? "pointer-events-none opacity-30" : ""
              }`}
            />
          </PaginationItem>

          {pageNumbers.map((p, i) =>
            p === "..." ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis className="text-zinc-600" />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  onClick={() => onGoTo(p as number)}
                  isActive={p === page}
                  className={`cursor-pointer ${
                    p === page
                      ? "bg-zinc-700 text-white border-zinc-600"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={onNext}
              className={`text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer ${
                page === totalPages ? "pointer-events-none opacity-30" : ""
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
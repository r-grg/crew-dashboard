import { useState, useMemo } from "react"

export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  // Reset to page 1 whenever the item list changes length (e.g. year filter)
  const safePage = Math.min(page, totalPages)

  const paginatedItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  )

  const goToPage = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)))
  const nextPage = () => goToPage(safePage + 1)
  const prevPage = () => goToPage(safePage - 1)

  return {
    paginatedItems,
    page: safePage,
    totalPages,
    totalItems: items.length,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  }
}
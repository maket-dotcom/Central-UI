import { useState, useMemo } from "react"

export type SortOrder = "asc" | "desc" | null

export interface SortConfig<T> {
  key: keyof T | null
  order: SortOrder
}

export function useTableSort<T>(
  items: T[],
  initialKey: keyof T | null = null,
  initialOrder: SortOrder = null
) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: initialKey,
    order: initialOrder,
  })

  const requestSort = (key: keyof T) => {
    let order: SortOrder = "asc"
    if (sortConfig.key === key && sortConfig.order === "asc") {
      order = "desc"
    } else if (sortConfig.key === key && sortConfig.order === "desc") {
      order = null
    }
    setSortConfig({ key: order ? key : null, order })
  }

  const sortedItems = useMemo(() => {
    if (!sortConfig.key || !sortConfig.order) {
      return items
    }

    return [...items].sort((a, b) => {
      const valA = a[sortConfig.key!]
      const valB = b[sortConfig.key!]

      if (valA === valB) return 0
      if (valA === undefined || valA === null) return 1
      if (valB === undefined || valB === null) return -1

      if (typeof valA === "number" && typeof valB === "number") {
        return sortConfig.order === "asc" ? valA - valB : valB - valA
      }

      const strA = String(valA).toLowerCase()
      const strB = String(valB).toLowerCase()
      return sortConfig.order === "asc"
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA)
    })
  }, [items, sortConfig])

  return { sortedItems, sortConfig, requestSort }
}

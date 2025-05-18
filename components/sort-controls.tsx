"use client"

import type React from "react"

import { useRouter } from "next/navigation"

interface SortControlsProps {
  currentSort: string
}

export function SortControls({ currentSort }: SortControlsProps) {
  const router = useRouter()

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = new URL(window.location.href)
    url.searchParams.set("sort", e.target.value)
    url.searchParams.set("page", "1")
    router.push(url.toString())
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <select className="text-sm border rounded-md px-2 py-1" value={currentSort} onChange={handleSortChange}>
        <option value="latest">Latest</option>
        <option value="oldest">Oldest</option>
      </select>
    </div>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface FeedTabsProps {
  isLoggedIn: boolean
}

export function FeedTabs({ isLoggedIn }: FeedTabsProps) {
  const pathname = usePathname()

  const tabs = [
    {
      name: "Global Feed",
      href: "/",
      active: pathname === "/",
    },
    ...(isLoggedIn
      ? [
          {
            name: "My Posts",
            href: "/my-posts",
            active: pathname === "/my-posts",
          },
        ]
      : []),
  ]

  return (
    <div className="border-b mb-8">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "py-4 px-1 border-b-2 text-sm font-medium",
              tab.active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300",
            )}
            aria-current={tab.active ? "page" : undefined}
          >
            {tab.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}

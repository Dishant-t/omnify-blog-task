import { createServerSupabaseClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { SortControls } from "@/components/sort-controls"
import { FeedTabs } from "@/components/feed-tabs"

export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string; sort?: string }
}) {
  const supabase = createServerSupabaseClient()
  const sp=await searchParams
  const page = Number.parseInt(sp.page || "1")
  const pageSize = 9
  const sortBy = sp.sort || "latest"

  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isLoggedIn = !!session?.user

  let query = supabase.from("posts").select(
    `
      id,
      title,
      content,
      created_at,
      profiles (
        id,
        username,
        full_name
      )
    `,
    { count: "exact" },
  )

  // Apply sorting
  if (sortBy === "oldest") {
    query = query.order("created_at", { ascending: true })
  } else {
    // Default to latest
    query = query.order("created_at", { ascending: false })
  }

  // Apply pagination
  query = query.range((page - 1) * pageSize, page * pageSize - 1)

  const { data: posts, count, error } = await query

  const totalPages = count ? Math.ceil(count / pageSize) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Blog Feed</h1>
          <p className="text-muted-foreground mt-1">Discover posts from all users</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <SortControls currentSort={sortBy} />
          {isLoggedIn && (
            <Link href="/new-post">
              <Button>Create New Post</Button>
            </Link>
          )}
        </div>
      </div>

      <FeedTabs isLoggedIn={isLoggedIn} />

      {error && <div className="p-4 bg-red-50 text-red-500 rounded-md">Error loading posts: {error.message}</div>}

      {posts && posts.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-muted-foreground">No posts yet</h2>
          {isLoggedIn ? (
            <div className="mt-4">
              <Link href="/new-post">
                <Button>Create Your First Post</Button>
              </Link>
            </div>
          ) : (
            <div className="mt-4">
              <Link href="/login">
                <Button variant="outline">Login to create a post</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts?.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`} className="block h-full">
            <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="mb-2">
                  <p className="text-sm font-medium">{post.profiles?.full_name || post.profiles?.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground line-clamp-4">
                  {post.content.length > 150 ? post.content.substring(0, 150) + "..." : post.content}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {page > 1 && (
              <Link
                href={`/?page=${page - 1}${sortBy ? `&sort=${sortBy}` : ""}`}
                className="px-3 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={`/?page=${pageNum}${sortBy ? `&sort=${sortBy}` : ""}`}
                className={`px-3 py-2 border rounded-md ${
                  pageNum === page ? "bg-primary text-primary-foreground" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {pageNum}
              </Link>
            ))}
            {page < totalPages && (
              <Link
                href={`/?page=${page + 1}${sortBy ? `&sort=${sortBy}` : ""}`}
                className="px-3 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

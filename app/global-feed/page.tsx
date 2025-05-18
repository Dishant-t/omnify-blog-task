import { createServerSupabaseClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { formatDistanceToNow } from "date-fns"
import { SortControls } from "@/components/sort-controls"

export default async function GlobalFeed({
  searchParams,
}: {
  searchParams: { page?: string; sort?: string }
}) {
  const supabase = createServerSupabaseClient()
  const page = Number.parseInt(searchParams.page || "1")
  const pageSize = 9
  const sortBy = searchParams.sort || "latest"

  let query = supabase.from("posts").select(
    `
      id,
      title,
      content,
      created_at,
      profiles (
        id,
        username,
        full_name,
      )
    `,
    { count: "exact" },
  )


  if (sortBy === "oldest") {
    query = query.order("created_at", { ascending: true })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  //pagination
  query = query.range((page - 1) * pageSize, page * pageSize - 1)

  const [{ data: posts, count, error }, { data: session }] = await Promise.all([query, supabase.auth.getSession()])

  const totalPages = count ? Math.ceil(count / pageSize) : 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Global Feed</h1>
          <p className="text-muted-foreground mt-1">Discover posts from all users</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <SortControls currentSort={sortBy} />
          {session?.user && (
            <Link href="/new-post">
              <Button>Create New Post</Button>
            </Link>
          )}
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-500 rounded-md">Error loading posts: {error.message}</div>}

      {posts && posts.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-muted-foreground">No posts yet</h2>
          {session?.user ? (
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
          <Card key={post.id} className="flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div>
                  <p className="text-sm font-medium">{post.profiles?.full_name || post.profiles?.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <CardTitle className="line-clamp-2">
                <Link href={`/posts/${post.id}`} className="hover:underline">
                  {post.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground line-clamp-4">
                {post.content.length > 150 ? post.content.substring(0, 150) + "..." : post.content}
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/posts/${post.id}`} className="text-sm text-primary hover:underline">
                Read more
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {page > 1 && (
              <Link
                href={`/global-feed?page=${page - 1}${sortBy ? `&sort=${sortBy}` : ""}`}
                className="px-3 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={`/global-feed?page=${pageNum}${sortBy ? `&sort=${sortBy}` : ""}`}
                className={`px-3 py-2 border rounded-md ${
                  pageNum === page ? "bg-primary text-primary-foreground" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {pageNum}
              </Link>
            ))}
            {page < totalPages && (
              <Link
                href={`/global-feed?page=${page + 1}${sortBy ? `&sort=${sortBy}` : ""}`}
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

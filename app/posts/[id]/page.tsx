import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()

  const { data: post, error } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      content,
      created_at,
      profiles (
        id,
        username,
        full_name
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !post) {
    notFound()
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isAuthor = session?.user?.id === post.profiles.id

  const date = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            ← Back to all posts
          </Button>
        </Link>
      </div>

      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center text-sm text-muted-foreground mb-8">
          <span>By {post.profiles.full_name || post.profiles.username}</span>
          <span className="mx-2">•</span>
          <span>{date}</span>

          {isAuthor && (
            <>
              <span className="mx-2">•</span>
              <Link href={`/posts/${post.id}/edit`} className="text-primary hover:underline">
                Edit post
              </Link>
            </>
          )}
        </div>

        <div className="whitespace-pre-wrap">
          {post.content.split("\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  )
}

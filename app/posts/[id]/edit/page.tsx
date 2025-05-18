"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function EditPost({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isAuthor, setIsAuthor] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    async function fetchPost() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        const { data: post, error } = await supabase
          .from("posts")
          .select("title, content, author_id")
          .eq("id", params.id)
          .single()

        if (error) {
          throw error
        }

        if (post.author_id !== session.user.id) {
          setIsAuthor(false)
          return
        }

        setIsAuthor(true)
        setTitle(post.title)
        setContent(post.content)
      } catch (error: any) {
        setError(error.message || "An error occurred while fetching the post")
      } finally {
        setInitialLoading(false)
      }
    }

    fetchPost()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      const { error: postError } = await supabase
        .from("posts")
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .eq("author_id", session.user.id)

      if (postError) {
        throw postError
      }

      router.push(`/posts/${params.id}`)
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred while updating the post")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return
    }

    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      const { error: deleteError } = await supabase
        .from("posts")
        .delete()
        .eq("id", params.id)
        .eq("author_id", session.user.id)

      if (deleteError) {
        throw deleteError
      }

      router.push("/")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred while deleting the post")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthor) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Unauthorized</CardTitle>
            <CardDescription>You do not have permission to edit this post.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Post</CardTitle>
          <CardDescription>Update your blog post</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-md">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your post title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content here..."
                className="min-h-[200px]"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <Button type="submit" disabled={loading} className="mr-2">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push(`/posts/${params.id}`)}>
                Cancel
              </Button>
            </div>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
              Delete Post
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

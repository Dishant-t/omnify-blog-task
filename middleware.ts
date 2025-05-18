import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check auth condition
  if (
    !session &&
    (req.nextUrl.pathname === "/new-post" ||
      (req.nextUrl.pathname.startsWith("/posts/") && req.nextUrl.pathname.endsWith("/edit")))
  ) {
    // Auth is required, redirect to login
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/new-post", "/posts/:path*/edit"],
}

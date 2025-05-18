"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const username = formData.get("username") as string
  const fullName = (formData.get("fullName") as string) || null

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    //Sign up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (authData.user) {
      //service role to bypass problems with policies
      const supabaseAdmin = createServerActionClient(
        {
          cookies: () => cookieStore,
        },
        {
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
      )

      const { error: profileError } = await supabaseAdmin.from("profiles").insert({
        id: authData.user.id,
        username,
        full_name: fullName,
      })

      if (profileError) {
        return { success: false, error: profileError.message }
      }

      //Sign in
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

      revalidatePath("/")
      return { success: true }
    }

    return { success: false, error: "Something went wrong during signup" }
  } catch (error: any) {
    return { success: false, error: error.message || "An error occurred during signup" }
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "An error occurred during login" }
  }
}

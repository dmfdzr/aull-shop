import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function getAdminUser() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function requireAdminUser() {
  const user = await getAdminUser()

  if (!user) {
    redirect("/admin/login")
  }

  return user
}

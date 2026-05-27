import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env"

export async function getAdminUser() {
  if (!getSupabaseUrl() || !getSupabasePublishableKey()) {
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

"use server"

import { redirect } from "next/navigation"
import { redirectWithFlash } from "@/lib/flash"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function signInAdminAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    redirectWithFlash("/admin/login", "error", "Email dan password wajib diisi.")
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirectWithFlash("/admin/login", "error", "Login gagal. Cek email dan password.")
  }

  redirect("/admin?status=success&message=Login%20berhasil.")
}

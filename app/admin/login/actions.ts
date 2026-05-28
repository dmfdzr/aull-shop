"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { redirectWithFlash } from "@/lib/flash"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const loginSchema = z.object({
  email: z.string().trim().email("Format email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
})

async function isRegisteredAdminEmail(email: string) {
  try {
    const supabaseAdmin = createSupabaseAdminClient()
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    if (error) {
      return null
    }

    return data.users.some(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    )
  } catch {
    return null
  }
}

export async function signInAdminAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    redirectWithFlash(
      "/admin/login",
      "error",
      parsed.error.issues[0]?.message ?? "Email dan password wajib diisi."
    )
  }

  const email = parsed.data.email.toLowerCase()
  const password = parsed.data.password
  const emailExists = await isRegisteredAdminEmail(email)

  if (emailExists === false) {
    redirectWithFlash(
      "/admin/login",
      "error",
      "Email admin belum terdaftar. Minta owner menambahkan akun di Supabase Auth."
    )
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const message =
      error.message.toLowerCase().includes("invalid login credentials") &&
      emailExists
        ? "Password salah. Coba lagi."
        : "Login gagal. Cek email, password, atau status akun admin."

    redirectWithFlash("/admin/login", "error", message)
  }

  redirect("/admin?status=success&message=Login%20berhasil.")
}

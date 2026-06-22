"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createRepositories } from "@/lib/db/repositories/factory";
import { signSession } from "@/lib/auth/session";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const { users } = createRepositories();
  const user = await users.findByUsername(username);

  if (!user || password !== "admin") {
    redirect("/login?error=invalid");
  }

  const token = await signSession({ name: user.name, role: user.role, department: user.department });
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}

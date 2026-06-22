import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/session";
import { createRepositories } from "@/lib/db/repositories/factory";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get("token")?.value);
  if (!session) redirect("/login");
  const { groups } = createRepositories();
  const groupItems = await groups.findAll();
  return <DashboardShell user={session} groups={groupItems}>{children}</DashboardShell>;
}

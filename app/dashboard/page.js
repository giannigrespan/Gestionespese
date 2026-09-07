import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Dashboard from "@/components/Dashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <Dashboard
      initialUser={{ id: user.id, name: user.name, email: user.email, family_id: user.familyId }}
    />
  );
}

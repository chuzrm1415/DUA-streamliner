import { auth } from "@/auth/auth.config";
import { redirect } from "next/navigation";
import { ProtectedLayoutTemplate } from "@/components/templates/ProtectedLayout";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return <ProtectedLayoutTemplate>{children}</ProtectedLayoutTemplate>;
}

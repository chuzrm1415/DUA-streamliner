import { redirect } from "next/navigation";
import { auth } from "@/auth/auth.config";

export default async function RootPage() {
  const session = await auth();
  if (session) {
    redirect("/protected/dashboard");
  } else {
    redirect("/auth/login");
  }
}

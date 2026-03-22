import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { AuthProvider } from "@/auth/auth.provider";
import { MUIProvider } from "@/lib/muiProvider";
import { QueryProvider } from "@/lib/queryProvider";
import { auth } from "@/auth/auth.config";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DUA Generator",
  description: "Automated DUA document generation system",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="es" className={ibmPlexSans.className}>
      <body>
        <AuthProvider session={session}>
          <MUIProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </MUIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

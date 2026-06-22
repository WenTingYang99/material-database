import type { Metadata } from "next";
import "@/app/globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "素材库",
  description: "DPCA material library",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}

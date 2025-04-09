"use client"

import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/app/login/components/auth-provider"
import { Toaster } from "@/components/ui/sonner"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Vicharcha - Connect, Communicate, Collaborate</title>
        <meta name="description" content="A modern platform for seamless communication" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

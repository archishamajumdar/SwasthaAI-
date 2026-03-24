import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import './animations.css'
import Navbar from '@/components/layout/navbar'
import Sidebar from '@/components/layout/sidebar'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SwasthyaAI Twin+ - Predictive Healthcare',
  description: 'AI-powered health predictions and digital twin technology for personalized preventative care',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0EA5A1' },
    { media: '(prefers-color-scheme: dark)', color: '#06B6D4' },
  ],
  userScalable: true,
}

import { AuthProvider } from '@/hooks/use-auth'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Navbar />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}

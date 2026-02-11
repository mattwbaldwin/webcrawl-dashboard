import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Webcrawl - The Internet is an Open World',
  description: 'Geocaching for the internet. Hide and find caches anywhere on the web.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

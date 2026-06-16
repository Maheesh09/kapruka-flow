import './globals.css'

export const metadata = {
  metadataBase: new URL('https://kapruka-flow.vercel.app'),
  title: 'Kapruka Flow — AI shopping, the Sri Lankan way',
  description: 'Chat with Flow, your AI shopping companion for Kapruka.com. Find the perfect gift, check delivery anywhere in Sri Lanka, and checkout — all in one conversation. English · සිංහල · தமிழ்.',
  openGraph: {
    title: 'Kapruka Flow — AI shopping, the Sri Lankan way',
    description: 'Find the perfect gift, check delivery, and checkout — all in one conversation.',
    url: 'https://kapruka-flow.vercel.app',
    siteName: 'Kapruka Flow',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Kapruka Flow — AI shopping, the Sri Lankan way' }],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FAF9FF',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Noto+Serif+Sinhala:ital,wght@0,400;1,400&family=Noto+Sans+Sinhala:wght@400;500;600&family=Noto+Sans+Tamil:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
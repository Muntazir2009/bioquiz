import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BioQuiz - Interactive Biology Learning',
  description: 'Learn biology through interactive quizzes and chat',
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

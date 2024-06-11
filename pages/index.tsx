import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function Index() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      Index Route
      <div>
        <button onClick={() => {}}>Log Out</button>
        <div>
          <Link href="/home">Go to Home Page</Link>
        </div>
      </div>
    </main>
  )
}

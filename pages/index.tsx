import { useFutureverse } from '@futureverse/react'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { useSignInHandler } from '../hooks'

const inter = Inter({ subsets: ['latin'] })

export default function Index() {
  useSignInHandler()

  const { logout, userSession } = useFutureverse()

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      Index Route
      {userSession != null && (
        <div>
          <button
            onClick={() => {
              logout()
            }}
          >
            Log Out
          </button>
          <div>
            <Link href="/home">Go to Home Page</Link>
          </div>
        </div>
      )}
    </main>
  )
}

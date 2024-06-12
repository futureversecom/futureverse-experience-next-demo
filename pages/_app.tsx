import '@/styles/globals.css'

import * as React from 'react'

import type { AppProps } from 'next/app'
import UserSessionProvider from './providers/userSessionProvider'
import WagmiProvider from './providers/wagmiProvider'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserSessionProvider>
      <WagmiProvider>
        <Component {...pageProps} />
      </WagmiProvider>
    </UserSessionProvider>
  )
}

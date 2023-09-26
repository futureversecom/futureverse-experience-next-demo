import '@/styles/globals.css'
import * as fvSdk from '@futureverse/experience-sdk'
import {
  FutureverseAuthClient,
  FutureverseProvider,
  UserState,
} from '@futureverse/react'
import type { AppProps } from 'next/app'

// In your app, keep this as an environment variable
const clientId = process.env.NEXT_PUBLIC_CLIENT_ID
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

if (clientId == null || walletConnectProjectId == null) {
  throw new Error(
    'Invariant violation: clientId or walletConnectProjectId are not defined!'
  )
}

const authClient = (() => {
  const client = new FutureverseAuthClient({
    clientId,
    environment:
      process.env.NODE_ENV === 'production'
        ? fvSdk.ENVIRONMENTS.production
        : fvSdk.ENVIRONMENTS.staging,
    redirectUri: 'http://localhost:3000/home',
  })
  client.addUserStateListener((userState) => {
    if (userState === UserState.SignedOut) {
      sessionStorage.setItem('fvAuthSilentLogin', 'disabled')
    }
  })
  return client
})()

export default function App({ Component, pageProps }: AppProps) {
  if (clientId == null || walletConnectProjectId == null) {
    throw new Error(
      'Invariant violation: clientId or walletConnectProjectId are not defined!'
    )
  }

  return (
    <FutureverseProvider
      stage='development'
      authClient={authClient}
      Web3Provider='wagmi'
      walletConnectProjectId={walletConnectProjectId}
    >
      <Component {...pageProps} />
    </FutureverseProvider>
  )
}

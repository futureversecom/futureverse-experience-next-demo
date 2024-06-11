import { Inter } from 'next/font/google'
import { useCallback, useState } from 'react'
import * as Wagmi from 'wagmi'
import * as sdk from '@futureverse/experience-sdk'
import { UserSessionContext } from './providers/userSessionProvider'
import * as React from 'react'

const inter = Inter({ subsets: ['latin'] })

const clientId = 'N8LvGuOdY5CeduNUGdUwB' // This is a test Client ID, preferably use your own
const accessToken = '80rEBd2wrPkd4KZg33JQGFN0ILK-_bry5GWSjtadJJL' // This is a test /manageclients Access Token, preferably use your own
const redirectUri = 'http://localhost:3000/callback' // Ensure this matches the redirect_uri defined on /manageclients
const identityProviderUri = 'https://login.futureverse.dev' // .dev -> DEV, .cloud -> STAGING, .app -> PRODUCTION
const authorizationEndpoint = `${identityProviderUri}/auth`
const tokenEndpoint = `${identityProviderUri}/token`

function parseJwt(token: string) {
  const [header, payload, signature] = token.split('.')

  if (!header || !payload) {
    throw new Error('Invalid JWT token')
  }

  const decodedHeader = JSON.parse(base64UrlDecode(header))
  const decodedPayload = JSON.parse(base64UrlDecode(payload))

  return {
    header: decodedHeader,
    payload: decodedPayload,
    signature,
  }
}

function generateRandomString(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function generateCodeVerifierAndChallenge() {
  const codeVerifier = generateRandomString(128)
  const buffer = new TextEncoder().encode(codeVerifier)
  const hashed = await sha256(buffer)
  const codeChallenge = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(hashed))
  )
  return { codeVerifier, codeChallenge }
}

function sha256(buffer: ArrayBuffer) {
  return crypto.subtle.digest('SHA-256', buffer)
}

function base64UrlEncode(str: string) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(str: string) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (str.length % 4)) % 4)
  const base64 = str + padding
  return atob(base64)
}

export default function Home() {
  const { data: signer } = Wagmi.useSigner()

  const context = React.useContext(UserSessionContext)

  if (!context) {
    throw new Error('useContext must be used within a UserSessionProvider')
  }

  const { userSession } = context

  const login = React.useCallback(async () => {
    console.log('login func')
    const { codeVerifier, codeChallenge } =
      await generateCodeVerifierAndChallenge()
    localStorage.setItem('code_verifier', codeVerifier)

    const state = generateRandomString(16)
    localStorage.setItem('state', state)

    const nonce = generateRandomString(16)
    localStorage.setItem('nonce', nonce)

    const params = {
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'openid',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      response_mode: 'query',
      prompt: 'login', // Use `none` to attempt silent authentication without prompting the user
      login_hint: 'email:',
      state,
      nonce,
    }

    const queryString = new URLSearchParams(params).toString()
    const url = `${authorizationEndpoint}?${queryString}`

    window.location.href = url
  }, [])

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      Home Route
      {userSession == null ? (
        <button
          onClick={() => {
            login()
          }}
        >
          Log In
        </button>
      ) : (
        <div className="flex flex-col space-y-12">
          <div>
            <p>User EOA: {userSession.eoa}</p>
            <p>User FuturePass: {userSession.futurepass}</p>
            <p>User Chain ID: {userSession.chainId}</p>

            <p>Signer: {signer?._isSigner ? `is available` : 'is undefined'}</p>
            <button
              className="mt-2 rounded-sm border border-white px-4 py-2"
              onClick={() => {}}
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

import {
  useFuturePassAccountAddress,
  useFutureverse,
  useTrnApi,
} from '@futureverse/react'
import { Inter } from 'next/font/google'
import { useCallback, useState } from 'react'
import * as wagmi from 'wagmi'
import * as fvSdk from '@futureverse/experience-sdk'
import { useTrnBalances, useTrnExtrinsic } from '@/hooks'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const { login, logout, userSession } = useFutureverse()
  const { data: futurepass } = useFuturePassAccountAddress()

  const { trnApi } = useTrnApi()
  const trnBalances = useTrnBalances()
  const { data: signer } = wagmi.useSigner()

  const { signAndSubmitStep, submitExtrinsic, estimatedFee } = useTrnExtrinsic({
    senderAddress: userSession?.eoa,
    extrinsic: trnApi
      ? trnApi.tx.system.remark('Hello, Futureverse!')
      : undefined,
  })

  const [extrinsicResult, setExtrinsicResult] = useState<{
    error?: string
    extrinsicId?: string
  }>()

  const onSubmitClick = useCallback(async () => {
    try {
      const result = await submitExtrinsic()

      setExtrinsicResult({ extrinsicId: result.extrinsicId })
    } catch (err: any) {
      setExtrinsicResult({ error: err.message })
    }
  }, [submitExtrinsic])

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
          <div className="flex flex-col space-y-4">
            {extrinsicResult?.error && (
              <p>Extrinsic error: {extrinsicResult.error}</p>
            )}
            {extrinsicResult?.extrinsicId && (
              <p>Extrinsic ID: {extrinsicResult.extrinsicId}</p>
            )}

            {!extrinsicResult && signAndSubmitStep && (
              <p>Sign and Submit step: {signAndSubmitStep}</p>
            )}

            {estimatedFee && (
              <p>
                Estimated fee:{' '}
                {fvSdk.renderCryptoAmount(
                  {
                    value: estimatedFee,
                    symbol: 'XRP',
                    decimals: 6,
                  },
                  { withSymbol: true }
                )}
              </p>
            )}

            <button
              className="mt-2 rounded-sm border border-white px-4 py-2"
              onClick={onSubmitClick}
            >
              Submit Extrinsic
            </button>
          </div>

          <div>
            <p>User EOA: {userSession.eoa}</p>
            <p>User FuturePass: {futurepass}</p>
            <p>User Chain ID: {userSession.chainId}</p>
            <p>
              User Balance:{' '}
              {trnBalances?.root
                ? fvSdk.renderCryptoAmount(
                    {
                      value: trnBalances.root,
                      symbol: 'ROOT',
                      decimals: 6,
                    },
                    { withSymbol: true }
                  )
                : 'loading'}
            </p>
            <p>
              User Balance:{' '}
              {trnBalances?.xrp
                ? fvSdk.renderCryptoAmount(
                    {
                      value: trnBalances.xrp,
                      symbol: 'XRP',
                      decimals: 6,
                    },
                    { withSymbol: true }
                  )
                : 'loading'}
            </p>
            <p>Signer: {signer?._isSigner ? `is available` : 'is undefined'}</p>
            <button
              className="mt-2 rounded-sm border border-white px-4 py-2"
              onClick={() => {
                logout()
              }}
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

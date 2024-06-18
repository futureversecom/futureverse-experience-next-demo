import * as fvSdk from '@futureverse/experience-sdk'
import {
  useAuthenticationMethod,
  useFuturePassAccountAddress,
  useTrnApi,
} from '@futureverse/react'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import * as wagmi from 'wagmi'

export function useTrnExtrinsic({
  senderAddress,
  extrinsic,
  feeOptions,
}: {
  senderAddress?: string
  extrinsic?: fvSdk.Extrinsic
  feeOptions?: {
    assetId: number
    slippage?: number
  }
}) {
  const { createTrnDispatcher } = useTrnApi()
  const { data: futurePassAccount } = useFuturePassAccountAddress()
  const authenticationMethod = useAuthenticationMethod()

  const { data: signer } = wagmi.useSigner()

  const [signAndSubmitStep, setSignAndSubmitStep] = useState<string>()
  // Optionally use this to display a QR code for XRPL user to scan
  const [_xamanData, setXamanData] = useState<{
    qrCodeImg: string
    deeplink: string
  }>()

  const [estimatedFee, setEstimatedFee] = useState<BigNumber>()

  const dispatcher = useMemo(() => {
    try {
      if (!futurePassAccount || !signer || !senderAddress)
        throw new Error(
          `${
            !futurePassAccount
              ? 'futurePassAccount'
              : !signer
                ? 'signer'
                : 'senderAddress'
          } was undefined`
        )

      return createTrnDispatcher({
        wrapWithFuturePass: fvSdk.addressEquals(
          senderAddress,
          futurePassAccount
        ),
        feeOptions: {
          assetId: feeOptions?.assetId ?? fvSdk.XRP_ASSET_ID,
          slippage: feeOptions?.slippage ?? 0.05,
        },
        wagmiOptions: {
          signer,
        },
        xamanOptions: {
          signMessageCallbacks: {
            onRejected: () => setSignAndSubmitStep(undefined),
            onCreated: createdPayload => {
              setXamanData({
                qrCodeImg: createdPayload.refs.qr_png,
                deeplink: createdPayload.next.always,
              })
              setSignAndSubmitStep('waitingForSignature')
            },
          },
        },
        onSignatureSuccess:
          authenticationMethod?.method === 'xaman'
            ? () => {
                setSignAndSubmitStep('submittingToChain')
              }
            : undefined,
      })
    } catch (err: any) {
      console.warn('Unable to create dispatcher:', err.message)
    }
  }, [
    authenticationMethod,
    createTrnDispatcher,
    futurePassAccount,
    senderAddress,
    signer,
    feeOptions,
  ])

  const submitExtrinsic = useCallback(async () => {
    if (!dispatcher || !extrinsic)
      throw new Error(
        `Unable to submit extrinsic: ${
          !dispatcher ? 'dispatcher' : 'extrinsic'
        } was undefined`
      )

    const result = await dispatcher.signAndSend(extrinsic)

    if (!result.ok)
      throw new Error(`Error submitting extrinsic: ${result.value.cause}`)

    return result.value
  }, [dispatcher, extrinsic])

  const estimateFee = useCallback(async () => {
    if (!dispatcher || !extrinsic)
      throw new Error(
        `Unable to submit extrinsic: ${
          !dispatcher ? 'dispatcher' : 'extrinsic'
        } was undefined`
      )

    const result = await dispatcher.estimate(extrinsic, feeOptions?.assetId)
    if (!result.ok)
      throw new Error(`Error estimating fee: ${result.value.cause}`)

    return BigNumber.from(result.value)
  }, [dispatcher, extrinsic, feeOptions])

  useEffect(() => {
    if (!extrinsic) return

    estimateFee()
      .then(setEstimatedFee)
      .catch(err => console.warn(err.message))
  }, [extrinsic, estimateFee])

  return {
    estimatedFee,
    signAndSubmitStep,
    submitExtrinsic,
  }
}

import { useFutureverse, useTrnApi } from '@futureverse/react'
import { ApiPromise } from '@polkadot/api'
import { BigNumber } from 'ethers'
import { useEffect, useState } from 'react'
import * as fvSdk from '@futureverse/experience-sdk'

export function useTrnBalances() {
  const { trnApi } = useTrnApi()
  const { userSession } = useFutureverse()

  const [balances, setBalances] = useState<{
    root: BigNumber
    xrp: BigNumber
  }>()

  const fetchRootBalance = async (api: ApiPromise, address: string) => {
    const account = await api.query.system.account(address)

    const { data } = account
    const maxFrozen = data.feeFrozen.gte(data.miscFrozen)
      ? data.feeFrozen
      : data.miscFrozen

    return BigNumber.from(data.free.sub(maxFrozen).toString())
  }

  const fetchAssetBalance = async (
    api: ApiPromise,
    address: string,
    assetId = fvSdk.XRP_ASSET_ID
  ) => {
    const account = await api.query.assets.account(assetId, address)

    if (account.isNone) return BigNumber.from(0)

    return BigNumber.from(account.unwrap().balance.toString())
  }

  useEffect(() => {
    if (!trnApi || !userSession?.eoa) return

    Promise.all([
      fetchRootBalance(trnApi, userSession.eoa),
      fetchAssetBalance(trnApi, userSession.eoa),
    ]).then(([rootBalance, xrpBalance]) => {
      setBalances({
        root: rootBalance,
        xrp: xrpBalance,
      })
    })
  }, [trnApi, userSession?.eoa])

  return balances
}

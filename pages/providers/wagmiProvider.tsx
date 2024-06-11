import * as sdk from '@futureverse/experience-sdk'
import { FutureverseConnector } from '@futureverse/experience-sdk/wagmi'

import * as Wagmi from 'wagmi'
import * as React from 'react'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { JsonRpcProvider } from '@ethersproject/providers'

import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { UserSessionContext } from './userSessionProvider'
import dynamic from 'next/dynamic'

// const FutureverseConnector = dynamic(
//   () => import('@futureverse/experience-sdk/wagmi').then(mod => mod.default),
//   {
//     ssr: false,
//   }
// )

interface WagmiProviderProps {
  children: React.ReactNode
}

export const WagmiProvider = (props: WagmiProviderProps): JSX.Element => {
  const context = React.useContext(UserSessionContext)

  if (!context) {
    throw new Error('useContext must be used within a UserSessionProvider')
  }

  const { userSession } = context

  const wagmiClient = React.useMemo(() => {
    const wagmiConfig = Wagmi.configureChains(
      [
        sdk.CHAINS.ETHEREUM.SEPOLIA,
        sdk.CHAINS.ETHEREUM.HOMESTEAD,
        sdk.CHAINS.TRN.PORCINI,
        sdk.CHAINS.TRN.MAINNET,
      ],
      [
        jsonRpcProvider({
          rpc: chain => ({
            http:
              chain.rpcUrls.public.http[0] ??
              sdk.resolveSupportedChainRpcHttpUrl(chain.id),
          }),
          priority: 0,
        }),
      ]
    )

    const environment = sdk.ENVIRONMENTS.preview

    return Wagmi.createClient({
      autoConnect: true,
      connectors: [
        new MetaMaskConnector({
          chains: wagmiConfig.chains,
          options: {
            shimDisconnect: true,
            // Allows selecting a different account when reconnecting to MetaMask
            UNSTABLE_shimOnConnectSelectAccount: true,
          },
        }),
        ...(userSession?.eoa == null || userSession.custodian !== 'fv'
          ? []
          : [
              new FutureverseConnector({
                chains: wagmiConfig.chains,
                options: {
                  user: {
                    // we reconstruct this to have only primitives in
                    // the hook input deps
                    eoa: userSession.eoa,
                    chainId: userSession.chainId,
                    custodian: userSession.custodian,
                    futurepass: userSession.futurepass,
                  },
                  environment,
                  getProvider(config) {
                    const chain =
                      config?.chainId == null
                        ? environment.chain
                        : (() => {
                            const chainId =
                              config.chainId ?? this.environment.chain.id
                            for (const chain of Object.values({
                              ...sdk.CHAINS.ETHEREUM,
                              ...sdk.CHAINS.TRN,
                            })) {
                              if (chain.id === chainId) return chain
                            }
                            throw new Error(
                              'Chain not supported; id=' + config.chainId
                            )
                          })()
                    return new JsonRpcProvider(
                      sdk.resolveSupportedChainRpcHttpUrl(chain.id) ??
                        chain.rpcUrls.default.http[0]
                    )
                  },
                },
              }),
            ]),
      ],
      // We can leave config provider as the general one as if the user is using WalletConnect the selected chains will be a subset of all chains
      provider: wagmiConfig.provider,
    })
  }, [userSession])

  return (
    <Wagmi.WagmiConfig client={wagmiClient}>{props.children}</Wagmi.WagmiConfig>
  )
}

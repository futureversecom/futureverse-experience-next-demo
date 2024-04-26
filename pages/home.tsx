import { useFutureverse, deriveAddressFromPublicKey } from '@futureverse/react';

import { Inter } from 'next/font/google';
import * as wagmi from 'wagmi';
import * as React from 'react';
const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const { login, logout, userSession, CONSTANTS } = useFutureverse();
  const account = wagmi.useAccount();
  const ethBalance = wagmi.useBalance({
    address: account.address,
  });
  const xrpBalanceOnTrn = wagmi.useBalance({
    address: account.address,
    chainId: CONSTANTS.CHAINS.TRN.id,
  });
  const { data: signer } = wagmi.useSigner();
  console.log(signer);

  const userRAddress = React.useMemo(() => {
    const publicKeyInSub = userSession?.user?.profile.sub.split(':')[1];
    if (publicKeyInSub) {
      return deriveAddressFromPublicKey(publicKeyInSub, 'xrpl');
    }

    return null;
  }, [userSession?.user?.profile.sub]);
  console.log(userSession?.user?.profile.sub, userRAddress);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      Home Route
      {userSession == null ? (
        <button
          onClick={() => {
            login();
          }}
        >
          Log In
        </button>
      ) : (
        <div>
          <p>User EOA: {userSession.eoa}</p>
          <p>User Chain ID: {userSession.chainId}</p>
          <p>User Balance: {ethBalance.data?.formatted ?? 'loading'} ETH</p>
          <p>User r-Address: {userRAddress}</p>
          <p>Signer: {signer?._isSigner ? `is available` : 'is undefined'}</p>
          <button
            onClick={() => {
              logout();
            }}
          >
            Log Out
          </button>
        </div>
      )}
    </main>
  );
}

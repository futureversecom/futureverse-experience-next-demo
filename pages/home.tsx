import {
  useFuturePassAccountAddress,
  useFutureverse,
  useTrnApi,
} from "@futureverse/react";
import { ApiPromise } from "@polkadot/api";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import * as wagmi from "wagmi";
import * as fvSdk from "@futureverse/experience-sdk";
import { BigNumber } from "ethers";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { login, logout, userSession } = useFutureverse();
  const { data: futurepass } = useFuturePassAccountAddress();

  const balances = useBalances();
  const { data: signer } = wagmi.useSigner();

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
          <p>User FuturePass: {futurepass}</p>
          <p>User Chain ID: {userSession.chainId}</p>
          <p>
            User Balance:{" "}
            {balances?.root
              ? fvSdk.renderCryptoAmount(
                  {
                    value: balances.root,
                    symbol: "ROOT",
                    decimals: 6,
                  },
                  { withSymbol: true }
                )
              : "loading"}
          </p>
          <p>
            User Balance:{" "}
            {balances?.xrp
              ? fvSdk.renderCryptoAmount(
                  {
                    value: balances.xrp,
                    symbol: "XRP",
                    decimals: 6,
                  },
                  { withSymbol: true }
                )
              : "loading"}
          </p>
          <p>Signer: {signer?._isSigner ? `is available` : "is undefined"}</p>
          <button
            style={{
              border: "1px solid white",
              padding: "2px 4px",
            }}
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

function useBalances() {
  const { trnApi } = useTrnApi();
  const { userSession } = useFutureverse();

  const [balances, setBalances] = useState<{
    root: BigNumber;
    xrp: BigNumber;
  }>();

  const fetchRootBalance = async (api: ApiPromise, address: string) => {
    const account = await api.query.system.account(address);

    const { data } = account;
    const maxFrozen = data.feeFrozen.gte(data.miscFrozen)
      ? data.feeFrozen
      : data.miscFrozen;

    return BigNumber.from(data.free.sub(maxFrozen).toString());
  };

  const fetchXrpBalance = async (api: ApiPromise, address: string) => {
    const account = await api.query.assets.account(fvSdk.XRP_ASSET_ID, address);

    if (account.isNone) return BigNumber.from(0);

    return BigNumber.from(account.unwrap().balance.toString());
  };

  useEffect(() => {
    if (!trnApi || !userSession?.eoa) return;

    Promise.all([
      fetchRootBalance(trnApi, userSession.eoa),
      fetchXrpBalance(trnApi, userSession.eoa),
    ]).then(([rootBalance, xrpBalance]) => {
      setBalances({
        root: rootBalance,
        xrp: xrpBalance,
      });
    });
  }, [trnApi, userSession?.eoa]);

  return balances;
}

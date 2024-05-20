import { useFutureverse, UserState } from "@futureverse/react";
import { useRouter } from "next/router";
import * as React from "react";
import * as wagmi from "wagmi";

export const FV_AUTH_SILENT_LOGIN_KEY = "fvAuthSilentLogin";
export const FV_AUTH_PREV_PATH_KEY = "fvAuthPrevPath";

export function useSignInHandler() {
  const { login, authClient } = useFutureverse();
  const { address: accountAddress } = wagmi.useAccount();
  const router = useRouter();

  React.useEffect(() => {
    const userStateChange = (userState: UserState) => {
      if (userState === UserState.SignedIn) {
        sessionStorage.setItem(FV_AUTH_SILENT_LOGIN_KEY, "enabled");
        const prevPath = sessionStorage.getItem(FV_AUTH_PREV_PATH_KEY);
        router.replace(prevPath ?? "/home");
      }
      if (userState === UserState.SignedOut) {
        const silentAuth = sessionStorage.getItem(FV_AUTH_SILENT_LOGIN_KEY);
        const isSilent = silentAuth !== "disabled";
        if (!isSilent) {
          sessionStorage.setItem(FV_AUTH_PREV_PATH_KEY, location.pathname);
          router.replace("/");
        }
        login(
          isSilent
            ? {
                loginMethod: {
                  type: "silent",
                  targetEOA: accountAddress ?? null,
                },
              }
            : undefined
        );
      }
      if (userState === UserState.SignInFailed) {
        router.replace("/");
        sessionStorage.setItem(FV_AUTH_SILENT_LOGIN_KEY, "disabled");
        login();
      }
    };
    authClient.addUserStateListener(userStateChange);
    return () => {
      authClient.removeUserStateListener(userStateChange);
    };
  }, [accountAddress, authClient, login, router]);
}

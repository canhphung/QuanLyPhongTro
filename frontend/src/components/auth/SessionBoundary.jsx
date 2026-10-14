import { Fragment, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useAccount from "../../hooks/useAccount";
import { clearPrivateData, setSessionAccount, SESSION_EXPIRED } from "../../utils/sessionState";
export default function SessionBoundary({ children }) {
  const client = useQueryClient();
  const account = useAccount();
  const previous = useRef(undefined);
  const identity = account.data === undefined ? undefined :
    account.data ? String(account.data.id) + ":" + [...(account.data.vaiTros ?? [])].sort().join(",") : null;
  useEffect(() => {
    if (identity === undefined) return;
    if (previous.current !== undefined && previous.current !== identity) void clearPrivateData(client, account.data?.id);
    previous.current = identity;
  }, [client, identity, account.data?.id]);
  useEffect(() => {
    const expire = () => {
      if (client.getQueryData(["auth", "me"])) void setSessionAccount(client, null);
    };
    window.addEventListener(SESSION_EXPIRED, expire);
    return () => window.removeEventListener(SESSION_EXPIRED, expire);
  }, [client]);
  return <Fragment key={identity ?? "guest"}>{children}</Fragment>;
}

let version = 0;
export const SESSION_EXPIRED = "qlpt:session-expired";
export const getSessionVersion = () => version;
export const advanceSessionVersion = () => ++version;
const isPrivate = (query) => query.queryKey[0] !== "auth";
export async function clearPrivateData(client, keepAccountId) {
  const oldPrivate = (query) => isPrivate(query) && (keepAccountId == null || query.queryKey[1] !== keepAccountId);
  advanceSessionVersion();
  await client.cancelQueries({ predicate: oldPrivate });
  client.removeQueries({ predicate: oldPrivate });
}
export async function setSessionAccount(client, account) {
  advanceSessionVersion();
  await client.cancelQueries();
  client.removeQueries({ predicate: isPrivate });
  client.getMutationCache().clear();
  client.setQueryData(["auth", "me"], account);
}

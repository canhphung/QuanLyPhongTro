export default function getErrorMessage(error, fallback) {
  const data = error.response?.data;

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (data && typeof data === "object") {
    const messages = Object.values(data).filter(
      (value) => typeof value === "string"
    );

    if (messages.length > 0) {
      return messages.join("\n");
    }
  }

  return fallback;
}
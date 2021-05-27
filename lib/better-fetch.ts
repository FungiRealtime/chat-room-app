export async function betterFetch<TData = unknown>(
  input: RequestInfo,
  init?: RequestInit | undefined,
  fallbackErrorMessage?: string
) {
  let response = await fetch(input, init);

  if (!response.ok) {
    // If the error returns a JSON response, it's more than likely
    // that it's an expected error which the API returns.
    let isExpectedError =
      response.headers.get("content-type") === "application/json";

    if (isExpectedError) {
      let { error } = await response.json();
      throw new Error(error);
    }

    throw new Error(fallbackErrorMessage ?? `Request to ${input} failed.`);
  }

  let data = await response.json();
  return data as TData;
}

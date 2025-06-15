import { CSRF_HEADER } from "./security/csrf";

export const getCsrfToken = async (): Promise<string> => {
  const res = await fetch("/api/csrf", { credentials: "include" });
  const data = await res.json();
  return data.token;
};

export const fetchWithCsrf = async (
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> => {
  // Only add CSRF token for non-GET requests
  if (init.method && init.method.toUpperCase() !== "GET") {
    const csrfToken = await getCsrfToken();
    console.log("Sending CSRF token:", csrfToken);
    init.headers = {
      ...(init.headers || {}),
      [CSRF_HEADER]: csrfToken,
    };
    init.credentials = "include"; // Ensure cookies are sent
  }
  return fetch(input, init);
};

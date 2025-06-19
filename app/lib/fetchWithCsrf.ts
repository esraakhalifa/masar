import { CSRF_HEADER } from "./security/csrf";

export const getCsrfToken = async (): Promise<string> => {
  try {
    const res = await fetch("/api/csrf", { 
      credentials: "include",
      cache: "no-store" // Ensure we always get a fresh token
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch CSRF token: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (!data.token) {
      throw new Error("CSRF token not found in response");
    }
    
    console.log("CSRF token retrieved successfully");
    return data.token;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    throw new Error("Failed to get CSRF token");
  }
};

export const fetchWithCsrf = async (
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> => {
  // Only add CSRF token for non-GET requests
  if (init.method && init.method.toUpperCase() !== "GET") {
    try {
      const csrfToken = await getCsrfToken();
      console.log("Sending CSRF token:", csrfToken);
      
      init.headers = {
        ...(init.headers || {}),
        [CSRF_HEADER]: csrfToken,
      };
      init.credentials = "include"; // Ensure cookies are sent
      
      const response = await fetch(input, init);
      
      // If we get a 403 (Forbidden) or 401 (Unauthorized), it might be a CSRF issue
      if (response.status === 403 || response.status === 401) {
        console.warn("Received 403/401 response, attempting to retry with fresh CSRF token");
        
        // Try to get a fresh CSRF token and retry once
        const freshCsrfToken = await getCsrfToken();
        console.log("Retrying with fresh CSRF token:", freshCsrfToken);
        
        init.headers = {
          ...(init.headers || {}),
          [CSRF_HEADER]: freshCsrfToken,
        };
        
        return fetch(input, init);
      }
      
      return response;
    } catch (error) {
      console.error("Error in fetchWithCsrf:", error);
      throw error;
    }
  }
  
  // For GET requests, just make the request without CSRF token
  return fetch(input, init);
};

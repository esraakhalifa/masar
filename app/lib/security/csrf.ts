export const generateCSRFToken = async (): Promise<string> => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const validateCSRFToken = (token: string | null, storedToken: string | null): boolean => {
  if (!token || !storedToken) return false;
  return token === storedToken;
};

// Standardized header name
export const CSRF_HEADER = 'X-CSRF-Token';
export const CSRF_COOKIE = 'csrf_token';

// Token rotation after successful use
export const rotateCSRFToken = async (response: Response): Promise<string> => {
  const newToken = await generateCSRFToken();
  response.headers.set('Set-Cookie', `${CSRF_COOKIE}=${newToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
  return newToken;
};

// Validate and rotate token in one operation
export const validateAndRotateCSRFToken = async (
  requestToken: string | null,
  storedToken: string | null,
  response: Response
): Promise<boolean> => {
  const isValid = validateCSRFToken(requestToken, storedToken);
  if (isValid) {
    await rotateCSRFToken(response);
  }
  return isValid;
}; 
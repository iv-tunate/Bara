export interface UserSession {
  userId: string;
  email: string;
  name: string;
  userType: string;
  accessToken: string;
  wrongLoginAttempts?: number;
}

const TOKEN_KEY = "bara_session";
const USER_ID_KEY = "bara_user_id";
const USER_TYPE_KEY = "bara_user_type";

export function setUserSession(session: UserSession): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(session));

    localStorage.setItem(USER_ID_KEY, session.userId);
    localStorage.setItem(USER_TYPE_KEY, session.userType);

    const sessionDetails = sessionStorage.getItem(TOKEN_KEY);
    console.log("User Session Details", sessionDetails);
  } catch (error) {
    console.error("Failed to store user session:", error);
  }
}

export function getUserSession(): UserSession | null {
  try {
    const sessionData = sessionStorage.getItem(TOKEN_KEY);
    if (!sessionData) return null;

    return JSON.parse(sessionData) as UserSession;
  } catch (error) {
    console.error("Failed to retrieve user session:", error);
    return null;
  }
}

export function getAccessToken(): string | null {
  const session = getUserSession();
  return session?.accessToken || null;
}

export function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

export function getUserType(): string | null {
  return localStorage.getItem(USER_TYPE_KEY);
}

export function isLoggedIn(): boolean {
  const session = getUserSession();
  if (!session?.accessToken) return false;

  return !isTokenExpired(session.accessToken);
}

export function clearUserSession(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_TYPE_KEY);
  } catch (error) {
    console.error("Failed to clear user session:", error);
  }
}

// export function isTokenExpired(token: string): boolean {
//   try {
//     const payload = JSON.parse(atob(token.split(".")[1]));
//     const currentTime = Math.floor(Date.now() / 1000);
//     return payload.exp < currentTime;
//   } catch {
//     return true;
//   }
// }

export function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return true;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );

    const payload = JSON.parse(atob(padded));
    const currentTime = Math.floor(Date.now() / 1000);

    if (!payload.exp) return true;

    return payload.exp < currentTime;
  } catch {
    return true;
  }
}

export function getAuthHeader(): Record<string, string> {
  const token = getAccessToken();
  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
}

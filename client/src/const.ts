import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Start the Manus OAuth login. Call this from an event handler or effect at the
// moment you want to navigate, e.g. `onClick={() => startLogin()}`.
export const startLogin = () => {
  const oauthPortalUrl = (import.meta.env.VITE_OAUTH_PORTAL_URL || "https://manus.im").replace(/\/$/, "");
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;

  // Do not fail silently when a Vercel build is missing its public OAuth setting.
  if (!appId) {
    const message = "O cadastro está temporariamente indisponível. Configure VITE_APP_ID no ambiente de deploy.";
    console.error("[Auth] VITE_APP_ID is missing. Configure it in the deployment environment.");
    window.alert(message);
    return;
  }

  const nonce = crypto.randomUUID();
  document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
  const state = encodeOAuthState({ redirectUri, nonce });

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  window.location.assign(url.toString());
};

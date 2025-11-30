// src/hooks/useToken.js
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useToken - Spotify PKCE token manager
 *
 * Exposes:
 *  - accessToken (string|null)
 *  - logInWithSpotify(): start PKCE login (redirects to Spotify)
 *  - refreshAccessToken(): attempts to refresh using saved refresh_token (returns token|null)
 *  - clearToken(): clear stored tokens and state
 *  - getToken(): read current token (null if expired)
 *  - setToken(token, ttlMs): store token manually (useful for tests)
 *
 * Important: mount this hook only once (usually inside a SessionProvider).
 */

const TOKEN_KEY = "token"; // JSON { value, expiry }
const REFRESH_KEY = "refresh_token";
const VERIFIER_KEY = "code_verifier";

const redirectUri = "http://127.0.0.1:3000/"; // adapt to your app
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const SCOPE = "user-read-private user-read-email";

/* --- helpers --- */
function generateRandomString(length = 64) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => possible[v % possible.length]).join("");
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64encode(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

/* --- hook --- */
export default function useToken() {
  // accessToken state for consumers
  const [accessToken, setAccessToken] = useState(() => {
    try {
      const itemStr = window.localStorage.getItem(TOKEN_KEY);
      if (!itemStr) return null;
      const item = JSON.parse(itemStr);
      if (!item?.value || !item?.expiry) {
        window.localStorage.removeItem(TOKEN_KEY);
        return null;
      }
      if (Date.now() > item.expiry) {
        window.localStorage.removeItem(TOKEN_KEY);
        return null;
      }
      return item.value;
    } catch {
      window.localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  });

  // stable code_verifier stored in a ref; only written to localStorage at redirect time
  const codeVerifierRef = useRef(window.localStorage.getItem(VERIFIER_KEY) || generateRandomString(64));

  // prevent duplicate exchanges (StrictMode/mounts)
  const exchangeInFlightRef = useRef(false);

  /* --- stable callbacks --- */

  const setToken = useCallback((token, ttlMs) => {
    if (!token) {
      window.localStorage.removeItem(TOKEN_KEY);
      setAccessToken(null);
      return;
    }
    const item = { value: token, expiry: Date.now() + ttlMs };
    window.localStorage.setItem(TOKEN_KEY, JSON.stringify(item));
    setAccessToken(token);
  }, []);

  const getToken = useCallback(() => {
    try {
      const itemStr = window.localStorage.getItem(TOKEN_KEY);
      if (!itemStr) return null;
      const item = JSON.parse(itemStr);
      if (!item?.value || !item?.expiry) {
        window.localStorage.removeItem(TOKEN_KEY);
        return null;
      }
      if (Date.now() > item.expiry) {
        window.localStorage.removeItem(TOKEN_KEY);
        setAccessToken(null);
        return null;
      }
      return item.value;
    } catch {
      window.localStorage.removeItem(TOKEN_KEY);
      setAccessToken(null);
      return null;
    }
  }, []);

  const clearToken = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    window.localStorage.removeItem(VERIFIER_KEY);
    setAccessToken(null);
    codeVerifierRef.current = null;
  }, []);

  const logInWithSpotify = useCallback(async () => {
    if (!CLIENT_ID) {
      console.error("REACT_APP_CLIENT_ID is not set.");
      return;
    }
    // stable verifier for this login attempt
    const verifier = codeVerifierRef.current || generateRandomString(64);
    codeVerifierRef.current = verifier;

    const hashed = await sha256(verifier);
    const codeChallenge = base64encode(hashed);

    // persist before redirect (so exchange can read it on redirect back)
    window.localStorage.setItem(VERIFIER_KEY, verifier);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: SCOPE,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    window.location.href = authUrl;
  }, []);

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = window.localStorage.getItem(REFRESH_KEY);
    if (!refreshToken || !CLIENT_ID) return null;

    try {
      const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
      });

      const resp = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        console.warn("Refresh token request failed:", resp.status, txt);
        clearToken();
        return null;
      }

      const json = await resp.json();
      if (json.access_token) {
        const ttlMs = (json.expires_in || 3600) * 1000;
        setToken(json.access_token, ttlMs);
        if (json.refresh_token) window.localStorage.setItem(REFRESH_KEY, json.refresh_token);
        return json.access_token;
      }
      return null;
    } catch (err) {
      console.error("Error refreshing access token:", err);
      clearToken();
      return null;
    }
  }, [clearToken, setToken]);

  /* --- PKCE exchange effect (runs on mount only) --- */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (!code) return; // nothing to do

    // if token already present, clean url and skip.
    if (getToken()) {
      urlParams.delete("code");
      urlParams.delete("state");
      const clean = window.location.pathname + (urlParams.toString() ? "?" + urlParams.toString() : "");
      window.history.replaceState({}, document.title, clean);
      return;
    }

    if (exchangeInFlightRef.current) {
      // already started an exchange this page lifecycle; skip
      return;
    }
    exchangeInFlightRef.current = true;

    const ac = new AbortController();

    (async () => {
      try {
        const codeVerifier = window.localStorage.getItem(VERIFIER_KEY) || codeVerifierRef.current;
        if (!codeVerifier) {
          console.error("Missing PKCE code_verifier for token exchange.");
          return;
        }

        const body = new URLSearchParams({
          client_id: CLIENT_ID,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        });

        const resp = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
          signal: ac.signal,
        });

        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          console.warn("Token exchange failed:", resp.status, txt);
          return;
        }

        const json = await resp.json();
        if (!json.access_token) {
          console.warn("Token exchange response missing access_token:", json);
          return;
        }

        // Save tokens
        const ttlMs = (json.expires_in || 3600) * 1000;
        setToken(json.access_token, ttlMs);
        if (json.refresh_token) window.localStorage.setItem(REFRESH_KEY, json.refresh_token);

        // cleanup verifier and URL
        window.localStorage.removeItem(VERIFIER_KEY);
        codeVerifierRef.current = null;

        urlParams.delete("code");
        urlParams.delete("state");
        const clean = window.location.pathname + (urlParams.toString() ? "?" + urlParams.toString() : "");
        window.history.replaceState({}, document.title, clean);

      } catch (err) {
        if (err.name === "AbortError") {
          console.debug("Token exchange aborted.");
        } else {
          console.error("Error during token exchange:", err);
        }
        // NOTE: do not set exchangeInFlightRef.current = false by default to avoid duplicates from StrictMode.
      }
    })();

    return () => {
      ac.abort();
      // do not reset exchangeInFlightRef here to avoid StrictMode duplicates
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run on mount only

  /* --- return stable API --- */
  return {
    accessToken,
    logInWithSpotify,
    refreshAccessToken,
    clearToken,
    getToken,
    setToken,
  };
}

// src/contexts/SessionContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate, useLocation } from "react-router-dom";
import useToken from "../hooks/useToken";

// import { get } from 'aws-amplify/api';

export const GUEST_PROFILE = {
    display_name: "Guest",
    id: "MaggleGuest",
    images: [
        {
            "height": 300,
            "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABa0lEQVR4Xu3V0QkAMAjE0Lr/0LV0inw8JwgJh3PfHZcxMIJkWnwQQVo9BIn1EESQmoEYjx8iSMxADMdCBIkZiOFYiCAxAzEcCxEkZiCGYyGCxAzEcCxEkJiBGI6FCBIzEMOxEEFiBmI4FiJIzEAMx0IEiRmI4ViIIDEDMRwLESRmIIZjIYLEDMRwLESQmIEYjoUIEjMQw7EQQWIGYjgWIkjMQAzHQgSJGYjhWIggMQMxHAsRJGYghmMhgsQMxHAsRJCYgRiOhQgSMxDDsRBBYgZiOBYiSMxADMdCBIkZiOFYiCAxAzEcCxEkZiCGYyGCxAzEcCxEkJiBGI6FCBIzEMOxEEFiBmI4FiJIzEAMx0IEiRmI4ViIIDEDMRwLESRmIIZjIYLEDMRwLESQmIEYjoUIEjMQw7EQQWIGYjgWIkjMQAzHQgSJGYjhWIggMQMxHAsRJGYghmMhgsQMxHAsRJCYgRiOhQgSMxDDWaY+juTHHe4vAAAAAElFTkSuQmCC",
            "width": 300
        },
        {
            "height": 64,
            "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABa0lEQVR4Xu3V0QkAMAjE0Lr/0LV0inw8JwgJh3PfHZcxMIJkWnwQQVo9BIn1EESQmoEYjx8iSMxADMdCBIkZiOFYiCAxAzEcCxEkZiCGYyGCxAzEcCxEkJiBGI6FCBIzEMOxEEFiBmI4FiJIzEAMx0IEiRmI4ViIIDEDMRwLESRmIIZjIYLEDMRwLESQmIEYjoUIEjMQw7EQQWIGYjgWIkjMQAzHQgSJGYjhWIggMQMxHAsRJGYghmMhgsQMxHAsRJCYgRiOhQgSMxDDsRBBYgZiOBYiSMxADMdCBIkZiOFYiCAxAzEcCxEkZiCGYyGCxAzEcCxEkJiBGI6FCBIzEMOxEEFiBmI4FiJIzEAMx0IEiRmI4ViIIDEDMRwLESRmIIZjIYLEDMRwLESQmIEYjoUIEjMQw7EQQWIGYjgWIkjMQAzHQgSJGYjhWIggMQMxHAsRJGYghmMhgsQMxHAsRJCYgRiOhQgSMxDDWaY+juTHHe4vAAAAAElFTkSuQmCC",
            "width": 64
        }
    ]
};


const SessionContext = createContext({
  isLoading: true,
  profile: null,
  accessToken: null,
  login: () => Promise.resolve(),
  logout: () => { },
});

export function SessionProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    accessToken,
    logInWithSpotify,
    refreshAccessToken,
    clearToken,
    getToken,
    setToken
  } = useToken();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Spotify profile when accessToken becomes available.
  useEffect(() => {
    let ac = new AbortController();

    if (!accessToken) {
      // No token: clear profile and finish loading
      setProfile(null);
      setIsLoading(false);
      return () => ac.abort();
    }

    setIsLoading(true);
    (async () => {
      try {
        if(profile === GUEST_PROFILE) {
          return
        }

        const res = await fetch("https://api.spotify.com/v1/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: ac.signal,
        });

        if (res.ok) {
          const p = await res.json();
          setProfile(p);
          console.log(p)
          setIsLoading(false);
          return;
        }

        // If unauthorized, attempt a refresh once
        if (res.status === 401) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            const r2 = await fetch("https://api.spotify.com/v1/me", {
              headers: { Authorization: `Bearer ${refreshed}` },
              signal: ac.signal,
            });
            if (r2.ok) {
              setProfile(await r2.json());
              setIsLoading(false);
              return;
            }
          }
        }

        // fallback: clear profile (guest)
        console.warn("Failed to fetch profile:", res.status);
        setProfile(null);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Profile fetch error:", err);
          setProfile(null);
        }
      } finally {
        setIsLoading(false);
      }
    })();

    return () => ac.abort();
  }, [accessToken, refreshAccessToken]);

  // Attempt a refresh/check on mount if no access token
  useEffect(() => {
    (async () => {
      if (!accessToken) {
        setIsLoading(true);
        const refreshed = await refreshAccessToken();
        // if refresh failed, navigate to login unless already there
        if (!refreshed && !location.pathname.startsWith("/login")) {
          navigate("/login", { replace: true });
        }
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  const login = useCallback(() => {
    clearToken();
    setProfile(null);
    return logInWithSpotify();
  }, [logInWithSpotify]);

  const logout = useCallback(() => {
    clearToken();
    setProfile(null);
    navigate("/login", { replace: true });
  }, [clearToken, navigate]);


const handleGuestLogin = useCallback(async () => {
  if (isLoading) return;
  setIsLoading(true);
  try {
    clearToken();
    setProfile(null);

    const res = await fetch("https://ik7oph0pw2.execute-api.us-east-2.amazonaws.com/dev/guest-token");
    
    if (!res.ok) throw new Error(`Failed to fetch guest token: ${res.status}`);
    
    const tokenData = await res.json();

    setProfile(GUEST_PROFILE);
    const ttlMs = (tokenData.expires_in || 3600) * 1000;
    setToken(tokenData.access_token, ttlMs);

    navigate("/guest/", { replace: true });
  } catch (err) {
    console.error("Failed to login as guest", err);
  } finally {
    setIsLoading(false);
  }
}, [clearToken, setToken, navigate, isLoading]);


  const value = useMemo(
    () => ({
      isLoading,
      profile,
      accessToken,
      login,
      logout,
      getToken, // optional: consumer can call to read raw token
      handleGuestLogin
    }),
    [isLoading, profile, accessToken, login, logout, getToken]
  );


  

  // show a loader while the provider decides authentication state
  if (isLoading) return <div style={{ padding: 40 }}>Loading…</div>;

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
export default SessionProvider;

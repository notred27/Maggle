
import { useState } from "react";
import useToken from './useToken.js';


export default function useSpotifyProfile() {
  const [profile, setProfile] = useState(null);
  const {setToken, getToken} = useToken();

  async function getProfile() {
    let accessToken = getToken();

    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    });

    const data = await response.json();
    setProfile(data);
  }

  return { profile, getProfile};
}
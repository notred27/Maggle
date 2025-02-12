
import { useState } from "react";


export default function useSpotifyProfile() {
  const [profile, setProfile] = useState(null);

  async function getProfile() {
    let accessToken = window.localStorage.getItem('token');

    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    });

    const data = await response.json();
    setProfile(data);
    console.log(data)
  }



  return { profile, getProfile};
}
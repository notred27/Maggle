
import { useState, useCallback} from "react";
import useToken from './useToken.js';

const GUEST_PROFILE = {
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

export default function useSpotifyProfile() {
  const [profile, setProfile] = useState(null);
  const { _ , getToken } = useToken();

  const getProfile = useCallback(async () => {
    try {
      const accessToken = getToken();
      if (!accessToken) {
        setProfile(null);
        return;
      }

      const res = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: 'Bearer ' + accessToken }
      });

      if (res.ok) {
        const p = await res.json();
        setProfile(p);
      } else {
        console.warn('Spotify profile fetch failed', res.status);
        setProfile(GUEST_PROFILE);
      }
    } catch (err) {
      console.error('Error fetching spotify profile', err);
      setProfile(GUEST_PROFILE);
    }
  }, [getToken]);


  return { profile, getProfile, setProfile };
}
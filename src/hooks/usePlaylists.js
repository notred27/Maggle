

import { useState, useCallback } from "react";

export default function usePlaylists(profile) {
  const [songDict, setSongDict] = useState({});
  const [searchItems, setSearchItems] = useState([]);
  const [userDict, setUserDict] = useState({});


  
  async function getUserInfo(userSet, accessToken) {
    const tmpUserDict = {};
    await Promise.all([...userSet].map(async (username) => {
      const userRequest = await fetch(`https://api.spotify.com/v1/users/${username}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const userDetails = await userRequest.json();
      if (userDetails.display_name) {
        tmpUserDict[username] = {
          name: userDetails.display_name,
          url: userDetails.images?.[0]?.url || null,
          profileUrl: userDetails.external_urls?.spotify
        };
      }
    }));
    return tmpUserDict;
  }


  const getPlaylists = useCallback(async () => {
    const songs = new Set();
    const accessToken = window.localStorage.getItem("token");

    const userSet = new Set()
    const playlistDict = {}

    

    const response = await fetch(`https://api.spotify.com/v1/users/${profile.id}/playlists`, {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    const playlists = await response.json();

    // Wait for all playlist track fetching to complete
    await Promise.all(playlists.items.map(async (p) => {

      try {
        playlistDict[p.name] = { url: p.images[0].url, songs: [], playlistUrl: p.external_urls.spotify }

      } catch {
        playlistDict[p.name] = { url: null, songs: [] }
      }

      const songList = await fetch(`https://api.spotify.com/v1/playlists/${p.id}/tracks`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      });

      const playlistSongs = await songList.json();

      playlistSongs.items.forEach((s) => {
        // console.log(s.added_by.id)
        const artists = s.track.artists.map((x) => x.name).join(", ");
        try {
          playlistDict[p.name].songs.push({ name: `${s.track.name} - ${artists}`, imgUrl: s.track.album.images[1]?.url || null, addedBy: s.added_by.id })
          songs.add(`${s.track.name} - ${artists}`)
          userSet.add(s.added_by.id)
        } catch (error) {
          console.error("Error processing track:", s, error);
        }
      });
    }));


    // Fetch the details of all users who have added a song to your playlists
    const userDict = await getUserInfo(userSet, accessToken);

    setUserDict(userDict)
    setSongDict(playlistDict);
    setSearchItems(Array.from(songs));
  }, [profile])


  return { songDict, searchItems, userDict, getPlaylists };
}

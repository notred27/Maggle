

import { useState, useCallback } from "react";

export default function usePlaylists(profile) {
  const [songDict, setSongDict] = useState({});
  const [searchItems, setSearchItems] = useState([]);
  const [userDict, setUserDict] = useState({});


  /**
   * Query Spotify's API for a list of different users
   * @param {*} userSet List of Spotify usernames
   * @param {*} accessToken API access token
   * @returns A dictionary with user names as keys containing names, profile links, and user image links
   */
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


  /**
   * Construct a dictionary of the user's playlists that contains info about their songs,
   * and who added the songs to those playlists. Also populates userDict.
   */
  const getPlaylists = useCallback(async () => {
    const accessToken = window.localStorage.getItem("token");

    const songs = new Set();   // Ensure each song is only added as a search key once
    const userSet = new Set(); // Ensure only one object is created for each unique Spotify profile
    const playlistDict = {};   // Dictionary of playlists by their names


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

      // Get info about each song on this playlist
      playlistSongs.items.forEach((s) => {
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

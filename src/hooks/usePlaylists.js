import useToken from './useToken.js';


import { useState, useCallback } from "react";

export default function usePlaylists(profile) {
  const [songDict, setSongDict] = useState({});
  const [searchItems, setSearchItems] = useState([]);
  const [userDict, setUserDict] = useState({});

  const [isLoaded, setIsLoaded] = useState(false);
  const {setToken, getToken} = useToken();

  /**
   * Query Spotify's API for a list of different users
   * @param {*} userSet List of Spotify usernames
   * @param {*} accessToken API access token
   * @returns A dictionary with user names as keys containing names, profile links, and user image links
   */
  async function getUserInfo(userSet, accessToken) {
    const tmpUserDict = {};
    await Promise.all([...userSet].map(async (username) => {
      const userRequest = await fetchWithRateLimit(`https://api.spotify.com/v1/users/${username}`, {
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
   * Helper function to introduce a delay
   */
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Helper function to fetch with automatic rate-limiting
   */
  async function fetchWithRateLimit(url, options, retryCount = 0) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        // Extract the 'Retry-After' header and wait before retrying
        const retryAfter = response.headers.get("Retry-After") || "1"; // Default to 1 second if missing
        const waitTime = parseInt(retryAfter, 10) * 1000; // Convert to ms
        console.warn(`Rate limit hit! Retrying after ${waitTime} ms...`);

        await delay(waitTime);
        return fetchWithRateLimit(url, options, retryCount + 1);
      }

      return response;
    } catch (error) {
      console.error("Error fetching data:", error);
      if (retryCount < 3) {
        await delay(1000); // Wait before retrying
        return fetchWithRateLimit(url, options, retryCount + 1);
      }
      throw error;
    }
  }



  /**
   * Create a queue of requests to fetch so the Spotify rate limit isn't hit
   * @param {*} urls List of URLs to fetch
   * @param {*} options Fetch options for requests
   * @param {*} batchSize Number of simultaneous requests to make
   * @param {*} delayMs Delay between batches
   * @returns 
   */
  async function fetchBatchWithRateLimit(urls, options, batchSize = 8, delayMs = 400) {
    const results = [];

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize).map(async url => {
          const d = await fetchWithRateLimit(url, options);
          return await d.json();
        }
      );

      // Fetch all requests in the current batch concurrently
      results.push(...(await Promise.all(batch)));

      // Introduce a delay before processing the next batch (avoids rate limits)
      if (i + batchSize < urls.length) await delay(delayMs);
    }

    return results;
  }


  /**
   * Construct a dictionary of the user's playlists that contains info about their songs,
   * and who added the songs to those playlists. Also populates userDict.
   */
  const getPlaylists = useCallback(async (profile) => {

    setIsLoaded(false);

    const accessToken = getToken() //window.localStorage.getItem("token");

    const songs = new Set();   // Ensure each song is only added as a search key once
    const userSet = new Set(); // Ensure only one object is created for each unique Spotify profile
    const playlistDict = {};   // Dictionary of playlists by their names

    // const name = "maggieg0731"


    const response = await fetchWithRateLimit(`https://api.spotify.com/v1/users/${profile}/playlists`, {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    const playlists = await response.json();


    // Store playlist metadata first
    playlists.items.forEach((p) => {
      try {
        playlistDict[p.name] = {
          url: p.images[0]?.url || null,
          songs: [],
          playlistUrl: p.external_urls.spotify,
        };
      } catch {
        playlistDict[p.name] = { url: null, songs: [] };
      }
    });

    // Create batch requests for fetching playlist tracks
    const playlistUrls = playlists.items.map(p => `https://api.spotify.com/v1/playlists/${p.id}/tracks`);
    const playlistTracksData = await fetchBatchWithRateLimit(playlistUrls, { headers: { Authorization: `Bearer ${accessToken}` } });


    // Process fetched playlist track data
    playlistTracksData.forEach((playlistData, index) => {
      playlistData.items.forEach((s) => {
        try {
          const p = playlists.items[index];

          const artists = s.track.artists.map((x) => x.name).join(", ");
          playlistDict[p.name].songs.push({
            name: `${s.track.name} - ${artists}`,
            imgUrl: s.track.album.images[1]?.url || null,
            addedBy: s.added_by.id,
          });
          songs.add(`${s.track.name} - ${artists}`);
          userSet.add(s.added_by.id);
        } catch (error) {
          console.error("Error processing track:", s, error);
        }
      });
    });


    // Fetch the details of all users who have added a song to your playlists
    const userDict = await getUserInfo(userSet, accessToken);

    setUserDict(userDict)
    setSongDict(playlistDict);
    setSearchItems(Array.from(songs));
    setIsLoaded(true);

    console.log(playlistDict)
  }, [profile])


  return { songDict, searchItems, userDict, getPlaylists, isLoaded};
}

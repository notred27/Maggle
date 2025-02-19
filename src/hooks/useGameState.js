

import { useState, useCallback, useRef, useEffect } from "react";
import { get } from 'aws-amplify/api';



export default function useGameState(songDict) {
  const targetSong = useRef(null);
  const targetPlaylist = useRef(null);
  const fixedPlaylist = useRef(null);

  const [gameState, setGameState] = useState({
    guesses: [],
    gameOver: false,
    score: 0,
    bestScore: parseInt(window.localStorage.getItem("bestStreak")) || 0,
    audioUrl: null,
    maxPlaybackLength: 1000,
    pbarValue: 0
  });


  /**
   * Set the user's score if the game is over.
   */
  useEffect(() => {
    //  Test if the game is over
    if (gameState.gameOver) {
      if (gameState.guesses[gameState.guesses.length - 1] === targetSong.current.name) {

        setGameState(prev => ({
          ...prev,
          score: prev.score + 1,
        }))

      } else {
        setGameState(prev => ({
          ...prev,
          score: 0,
        }))
      }
    }
  }, [gameState.gameOver, gameState.guesses])


  /**
   * Update the user's saved score if it beats local best score
   */
  useEffect(() => {
    if (gameState.score > gameState.bestScore) {
      setGameState(prev => ({
        ...prev,
        bestScore: prev.score,
      }))
      window.localStorage.setItem("bestStreak", gameState.score.toString());
    }
  }, [gameState.score, gameState.bestScore])


  /**
   * Fetch an audio URL from deezer's API
   * @param {*} query An object representing a song
   * @returns A string containing the song's URL
   */
  async function getAudioPreview(query) {
    try {


      const params = new URLSearchParams({ q: query.name });

      // Make the GET request
      // const response = await fetch(`https://api.deezer.com/search?${params.toString()}`);

      // Send a GET request to amplify API to act as a proxy since deezer doesn't have CORS set up
      const response = get({
        apiName: 'maggleAPI',
        path: `/proxy?${params.toString()}`,
      });

      const { body } = await response.response;


      const tracks = await body.json();

      if (!query.name.toLowerCase().includes(tracks.data[0].title_short.toLowerCase())) {
        console.error("Best result does not match target song. Skipping this song: ", query.name)
        return null;
      }

      if (tracks.data.length === 0) {
        console.error("No results were found. Skipping this song: ", query.name);
        return null;

      }


      return tracks.data[0].preview;

    } catch (error) {
      console.error("An error occurred when searching for this song. Skipping this song: ", query.name);

      return null;

      // throw new Error(`HTTP error! Status: ${response.status}`);
    }
  }


  /**
   * Randomly select an available song from the user's playlists, and get the audio. Also reset game values.
   */
  const chooseNewSong = useCallback(async () => {
    const playlistKeys = Object.keys(songDict);
    if (playlistKeys.length === 0) return;

    if (playlistKeys.length > 0) {
      const newPlaylist = fixedPlaylist.current || playlistKeys[Math.floor(Math.random() * playlistKeys.length)];
      targetPlaylist.current = newPlaylist;
      targetSong.current = songDict[newPlaylist].songs[Math.floor(Math.random() * songDict[newPlaylist].songs.length)];

      const previewUrl = await getAudioPreview(targetSong.current);

      // If preview is null, need to find a new song
      if (previewUrl === null) {
        chooseNewSong();
        return;
      }

      setGameState(prev => ({
        ...prev,
        gameOver: false,
        maxPlaybackLength: 1000,
        guesses: [],
        pbarValue: 0,
        audioUrl: previewUrl,
      }));
    }
  }, [songDict]);


  /**
   * Handle the logic for the next guess the user makes
   * @param submitRef The current reference to submit_ref
   * @param searchItems List of valid search terms
   */
  function nextGuess(submitRef, searchItems) {

    const val = submitRef !== null ? submitRef.value : "Skipped...";

    if (gameState.guesses.length < 5 && (searchItems.includes(val) || val === "Skipped...")) {
      setGameState(prev => ({
        ...prev,
        guesses: [...prev.guesses, val],
        maxPlaybackLength: (2 ** (prev.guesses.length + 1)) * 1000,
      }))

      if (gameState.guesses.length === 4 || val === targetSong.current.name) {
        setGameState(prev => ({
          ...prev,
          gameOver: true,
          maxPlaybackLength: 30000,
        }))
      }

      if (submitRef) {
        submitRef.value = "";
      }
    }
  }



  /**
   * Set the current value of the progress bar (thumb location)
   * @param {*} val Value to set the progress bar to (in range 0 to 1600)
   */
  const setPbarValue = (val) => {
    setGameState(prev => ({
      ...prev,
      pbarValue: val,
    }))
  }


  return { gameState, chooseNewSong, targetSong, targetPlaylist, fixedPlaylist, nextGuess, setPbarValue };
}



import { useState, useCallback, useRef, useEffect } from "react";

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


  useEffect(() => {
    // Update score if it beats local best score
    if (gameState.score > gameState.bestScore) {
      // setBestScore(gameState.score);
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
    const params = new URLSearchParams({ q: query.name });

    // Make the GET request
    const response = await fetch(`https://api.deezer.com/search?${params.toString()}`);
    // Parse and return the JSON response
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const tracks = await response.json();

    if(!query.name.toLowerCase().includes(tracks.data[0].title_short.toLowerCase())){
      console.error("Best result does not match target song. Skipping this song: ", query.name)
      return null;
    }

    if(tracks.data.length === 0) {
      console.error("No results were found. Skipping this song: ", query.name);
      return null;
    
    }


    console.log(tracks.data[0])

    return tracks.data[0].preview;
  }


  /**
   * Randomly select a song from the user's playlists, and get the audio. Also reset game values.
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
      if(previewUrl === null) {
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
   */
  function nextGuess(submitRef, searchItems) {
    const val = submitRef.value

    if (gameState.guesses.length < 5 && searchItems.includes(val)) {
      setGameState(prev => ({
        ...prev,
        guesses: [...prev.guesses, val],
        maxPlaybackLength: (2 ** (prev.guesses.length + 1)) * 1000,
      }))

      // setGuesses((prev) => [...prev, val]);
      // setMaxPlaybackLength((2 ** (guesses.length + 1)) * 1000)

      if (gameState.guesses.length === 4 || val === targetSong.current.name) {
        setGameState(prev => ({
          ...prev,
          gameOver: true,
          maxPlaybackLength: 30000,
        }))


        // setGameOver(true);
        // setMaxPlaybackLength(30000);
      }

      submitRef.value = "";
    }
  }


  function skipGuess() {
    if (gameState.guesses.length < 5) {
      // setGuesses([...guesses, "Skipped..."]);
      // setMaxPlaybackLength((2 ** (guesses.length + 1)) * 1000)

      setGameState(prev => ({
        ...prev,
        guesses: [...prev.guesses, "Skipped..."],
        maxPlaybackLength: (2 ** (prev.guesses.length + 1)) * 1000,
      }))
    }

    if (gameState.guesses.length === 4) {
      // setGameOver(true);
      // setMaxPlaybackLength(30000);

      setGameState(prev => ({
        ...prev,
        gameOver: true,
        maxPlaybackLength: 30000,
      }))

    }
  }


  const setPbarValue = (val) => {
    setGameState(prev => ({
      ...prev,
      pbarValue: val,
    }))
  }


  return { gameState, chooseNewSong, targetSong, targetPlaylist, fixedPlaylist, nextGuess, skipGuess, setPbarValue };
}

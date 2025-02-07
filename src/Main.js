import { useState, useRef, useEffect, useCallback } from 'react';
import SearchBar from './assets/SearchBar.js';
import PlayButton from './assets/PlayButton.js';
import Gameover from './Gameover';
import PlaylistSelect from './assets/PlaylistSelect.js';
import ProfileBadge from './assets/ProfileBadge.js'


import usePlaylists from './hooks/usePlaylists.js';
import useGameState from './hooks/useGameState.js';
import { useNavigate } from 'react-router-dom';


export default function Main() {
  const [profile, setProfile] = useState(null);
  const submit_ref = useRef(null);

  const { songDict, searchItems, userDict, getPlaylists } = usePlaylists(profile);
  const { gameState, chooseNewSong, targetSong, targetPlaylist, fixedPlaylist, nextGuess, skipGuess, setPbarValue } = useGameState(songDict);


  const [volume, setVolume] = useState(0.5);


  const [loading, setLoading] = useState(true);

  const nav = useNavigate();

  useEffect(() => {
    const accessToken = window.localStorage.getItem('token');

    if (!accessToken) {
      nav('/login'); // Redirect if no token
      // console.log("Error??")
      return;
    }

    async function fetchData() {
      await getProfile();
    }
    fetchData();
  }, [nav]);


  const updateDynamicGradient = useCallback(() => {

    const computedStyles = getComputedStyle(document.querySelector('body'));

    const dullAccent = computedStyles.getPropertyValue("--dull-accent-color").trim();
    const secondaryBtn = computedStyles.getPropertyValue("--secondary-btn-color").trim();
    const pageBg = computedStyles.getPropertyValue("--page-background-color").trim();


    let gradient = `linear-gradient(to right, ${dullAccent} 0% 6%, `;

    let lastPercent = 6.25;
    for (let i = 0; i < 4; i++) {
      gradient += `${secondaryBtn} ${lastPercent}% calc(${lastPercent}% + 2px),`
      let dynamicColor = i < gameState.guesses.length ? dullAccent : pageBg;
      gradient += `${dynamicColor} calc(${lastPercent}% + 2px) ${lastPercent + lastPercent}%, `;
      lastPercent += lastPercent
    }

    document.documentElement.style.setProperty("--dynamic-grad", `${gradient.substring(0, gradient.length - 2)})`);
  }, [gameState.guesses]);



  useEffect(() => {
    if (!loading && songDict && Object.keys(songDict).length > 0) {
      chooseNewSong();
    }
  }, [searchItems, chooseNewSong, songDict, loading]);



  // useEffect(() => {
  //   async function fetchData() {
  //     await getProfile();
  //   }
  //   fetchData();
  // }, []);


  useEffect(() => {
    if (profile) {
      getPlaylists(); // Call getPlaylists when profile is set
    }
  }, [profile, getPlaylists]);



  useEffect(() => {
    updateDynamicGradient();
  }, [gameState.guesses, updateDynamicGradient]);


  useEffect(() => {
    const observer = new MutationObserver(() => updateDynamicGradient());
    observer.observe(document.querySelector('body'), { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, [updateDynamicGradient]);


  async function getProfile() {
    let accessToken = window.localStorage.getItem('token');

    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    });

    const data = await response.json();
    setProfile(data);
    setLoading(false);
  }


  const renderedGuesses = Array(5).fill(null).map((_, i) => (
    <h4 key={i} className='guessText' style={{ color: gameState.guesses[i] === "Skipped..." ? "var(--dull-accent-color)" : "red" }}>
      {gameState.guesses[i] || "\u00A0"}
    </h4>
  ));



  if (loading) {
    return <div className="App"><h2>Loading...</h2></div>;
  }



  return (
    <div className="App">

      <header className='appHeader'>
        <span className='streakText'>
          Current Streak: {gameState.score}
          <br />
          Best Streak: {gameState.bestScore}
        </span>

        <h1 className='noselect'>Maggle!</h1>

        {profile !== null &&
          <ProfileBadge profileUrl={profile.images[1].url} displayName={profile.display_name} volume={volume} setVolume={setVolume} />
        }
      </header>



      {!gameState.gameOver && <div className='guessContainer' > {renderedGuesses} </div>}


      {!gameState.gameOver &&
        <div className='guessControlContainer'>

          <input id='trackProgress' type='range' value={gameState.pbarValue} min={0} max={1600} step={1} disabled />
          <div>

            <span className='submissionBar'>
              <span className='noselect'>0:{String(Math.floor(gameState.pbarValue / 100 + 0.1)).padStart(2, '0')}</span>

              {gameState.audioUrl && (
                <PlayButton
                  audioUrl={gameState.audioUrl}
                  volume={volume}
                  maxPlaybackLength={gameState.maxPlaybackLength}
                  inputVal={setPbarValue}
                />
              )}


              <span className='noselect'>0:{String(gameState.maxPlaybackLength / 1000).padStart(2, '0')}</span>
            </span>

            <SearchBar searchRef={submit_ref} items={searchItems} />

            <span className='submissionBar'>
              <button id='skipBtn' onClick={skipGuess}>Skip (+{gameState.maxPlaybackLength / 1000}s)</button>

              <PlaylistSelect songDict={songDict} fixedPlaylist={fixedPlaylist} chooseNewSong={chooseNewSong} />

              <button id='submitBtn' onClick={() => nextGuess(submit_ref.current, searchItems)}>Submit</button>
            </span>
          </div>

        </div>
      }

      {gameState.gameOver && <Gameover targetSong={targetSong} targetPlaylist={targetPlaylist} userDict={userDict} songDict={songDict} guesses={gameState.guesses} chooseNewSong={chooseNewSong} gameOver={gameState.gameOver} volume={volume} audio={gameState.audioUrl} />}
    </div>
  );
}


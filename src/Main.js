import { useState, useRef, useEffect, useCallback } from 'react';
import SearchBar from './assets/SearchBar.js';
import PlayButton from './assets/PlayButton.js';
import Gameover from './Gameover';
import PlaylistSelect from './assets/PlaylistSelect.js';
import ProfileBadge from './assets/ProfileBadge.js'




import usePlaylists from './hooks/usePlaylists.js';
import useGameState from './hooks/useGameState.js';
import { useParams, useNavigate, useLocation } from 'react-router-dom';


export default function Main() {
  // TODO: Take spotify profile API logic and move it to a higher hook that is created in the Login page. Then pass that hook to this when the data is received. 

  window.addEventListener('beforeunload', () => {
    localStorage.removeItem('token');
  });


  const { uid } = useParams();

  const location = useLocation();
  const profile = location.state?.profile;




  // console.log("OBJ: ", profile)

  const nav = useNavigate();

  // const [profile, setProfile] = useState(null);

  const [targetProfile, setTargetProfile] = useState(null);
  const { songDict, searchItems, userDict, getPlaylists, isLoaded } = usePlaylists(profile);
  const { gameState, chooseNewSong, targetSong, targetPlaylist, fixedPlaylist, nextGuess, setPbarValue } = useGameState(songDict);

  const submit_ref = useRef(null);
  const [volume, setVolume] = useState(0.5);




  useEffect(() => {
    if (targetProfile) {
      getPlaylists(targetProfile);

    }
  }, [targetProfile, getPlaylists])


  /**
    * Check if the user is logged in, and get their profile if they are.
    */
  useEffect(() => {
    const accessToken = window.localStorage.getItem('token');

    if (!accessToken) {


      if (uid) {
        nav(`/login/${uid}`);
        return;
      }


      nav('/login'); // Redirect if no token
      return;
    }

    // async function fetchData() {
    //   await getProfile();
    // }
    // fetchData();
  }, [nav]);


  /**
   * Get info about the user's songs after their info has been loaded.
   */
  useEffect(() => {
    if (profile) {

      // if (uid === "me") {
      //   setTargetProfile(profile.id);

      // } else {
      //   setTargetProfile(uid);

      // }

      setTargetProfile(profile.id);


      // getPlaylists(profile.id); // Call getPlaylists when profile is set
    }
  }, [profile, getPlaylists]);


  /**
   * Update the colors on the different sections of the progress
   * bar according to the current guess.
   */
  const updateDynamicGradient = useCallback(() => {
    const computedStyles = getComputedStyle(document.querySelector('body'));

    // Get the current colors of the theme css variables
    const dullAccent = computedStyles.getPropertyValue("--dull-accent-color").trim();
    const secondaryBtn = computedStyles.getPropertyValue("--secondary-btn-color").trim();
    const pageBg = computedStyles.getPropertyValue("--page-background-color").trim();

    let gradient = `linear-gradient(to right, ${dullAccent} 0% 6%, `;

    let lastPercent = 6.25; // Starting percentage of the gradient (100/(2^4))
    for (let i = 0; i < 4; i++) {
      gradient += `${secondaryBtn} ${lastPercent}% calc(${lastPercent}% + 2px),`;
      let dynamicColor = i < gameState.guesses.length ? dullAccent : pageBg;
      gradient += `${dynamicColor} calc(${lastPercent}% + 2px) ${lastPercent + lastPercent}%, `;
      lastPercent += lastPercent;
    }

    document.documentElement.style.setProperty("--dynamic-grad", `${gradient.substring(0, gradient.length - 2)})`);
  }, [gameState.guesses]);


  /**
   * Update the progress bar's colors when a new guess has been made.
   */
  useEffect(() => {
    updateDynamicGradient();
  }, [gameState.guesses, updateDynamicGradient]);


  /**
   * Update the profile bar's color when the theme changes.
   */
  useEffect(() => {
    const observer = new MutationObserver(() => updateDynamicGradient());
    observer.observe(document.querySelector('body'), { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [updateDynamicGradient]);


  /**
   * Choose a new song if all data has been fetched form Spotify (profile and playlists)
   */
  useEffect(() => {
    if (profile && songDict && Object.keys(songDict).length > 0) {
      chooseNewSong();
    }
  }, [searchItems, chooseNewSong, songDict, profile]);


  /**
   * Get the user's Spotify data when the site first loads (after auth)
   */
  // async function getProfile() {
  //   let accessToken = window.localStorage.getItem('token');

  //   const response = await fetch('https://api.spotify.com/v1/me', {
  //     headers: {
  //       Authorization: 'Bearer ' + accessToken
  //     }
  //   });

  //   const data = await response.json();
  //   setProfile(data);
  // }


  // Create HTML elements for each guess (and empty guesses)
  const renderedGuesses = Array(5).fill(null).map((_, i) => (
    <h4 key={i} className='guessText' style={{ color: gameState.guesses[i] === "Skipped..." ? "var(--dull-accent-color)" : "red" }}>
      {gameState.guesses[i] || "\u00A0"}
    </h4>
  ));


  // Return a dummy version of this page until the user's details have been received
  if (!profile) {
    return <div className="App"><h2>Loading...</h2></div>;
  }


  if (!isLoaded) {
    return <div className="App"><h2>Retrieving {targetProfile}'s Playlists...</h2></div>;

  }

  // Return the main page for the app
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
              <button id='skipBtn' onClick={() => nextGuess(null, searchItems)}>Skip (+{gameState.maxPlaybackLength / 1000}s)</button>

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


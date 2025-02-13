import { useState, useRef, useEffect, useCallback } from 'react';
import SearchBar from './assets/SearchBar.js';
import PlayButton from './assets/PlayButton.js';
import Gameover from './Gameover';
import PlaylistSelect from './assets/PlaylistSelect.js';
import ProfileBadge from './assets/ProfileBadge.js'




import usePlaylists from './hooks/usePlaylists.js';
import useGameState from './hooks/useGameState.js';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useToken from './hooks/useToken.js';
import useSpotifyProfile from './hooks/useSpotifyProfile';
import ProgressBar from './assets/ProgressBar.js';


export default function Main() {

  const { uid } = useParams();
  const { profile, getProfile } = useSpotifyProfile();

  const nav = useNavigate();

  const [targetProfile, setTargetProfile] = useState(null);
  const { songDict, searchItems, userDict, getPlaylists, isLoaded } = usePlaylists(profile);
  const { gameState, chooseNewSong, targetSong, targetPlaylist, fixedPlaylist, nextGuess, setPbarValue } = useGameState(songDict);
  const submit_ref = useRef(null);
  const [volume, setVolume] = useState(0.5);
  const { setToken, getToken } = useToken();


  /**
   * Get the correct playlists for when a target user changes
   */
  useEffect(() => {
    if (targetProfile) {
      getPlaylists(targetProfile);
    }
  }, [targetProfile, getPlaylists])


  /**
    * Check if the user is logged in, and get their profile if they are. Otherwise redirect to login if token has expired
    */
  useEffect(() => {
    if (!getToken()) {
      nav('/login'); // Redirect if no token, or if token expired
      return;
    }

    getProfile();

  }, [nav]);


  /**
   * Redirect when base user is not specified in the url (on initial redirect from login)
   */
  useEffect(() => {
    if (profile && uid === undefined) {
      nav(`/login/${profile.id}`);
      return;
    }

  }, [profile]);



  /**
   * Get info about the user's songs after their info has been loaded.
   */
  useEffect(() => {
    if (profile) {
      if (uid === profile.id) {
        setTargetProfile(profile.id);

      } else {
        setTargetProfile(uid);
      }

    }
  }, [profile, getPlaylists]);


 


  /**
   * Choose a new song if all data has been fetched form Spotify (profile and playlists)
   */
  useEffect(() => {
    if (profile && songDict && Object.keys(songDict).length > 0) {
      chooseNewSong();
    }
  }, [searchItems, chooseNewSong, songDict, profile]);





  // Create HTML elements for each guess (and empty guesses)
  const renderedGuesses = Array(5).fill(null).map((_, i) => (
    <h4 key={i} className='guessText' style={{ color: gameState.guesses[i] === "Skipped..." ? "var(--dull-accent-color)" : "red" }}>
      {gameState.guesses[i] || "\u00A0"}
    </h4>
  ));


  // Return a dummy version of this page until the user's details have been received
  if (!profile) {
    return <div className="App"><h2>Loading...</h2><div><button onClick={() => { setToken("", 0); nav("/login") }}>Logout</button></div></div>;
  }


  if (!isLoaded) {
    return <div className="App"><h2>Retrieving {targetProfile}'s Playlists...</h2><div><button onClick={() => { setToken("", 0); nav("/login") }}>Logout</button></div></div>;

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




      {!gameState.gameOver && <>


        <div className='guessControlContainer'>

          <div>
            <ProgressBar state={gameState} >

            
              <PlayButton
                audioUrl={gameState.audioUrl}
                volume={volume}
                maxPlaybackLength={gameState.maxPlaybackLength}
                inputVal={setPbarValue}
              />
            
            </ProgressBar>


            <SearchBar searchRef={submit_ref} items={searchItems} />

            <span className='submissionBar'>
              <button id='skipBtn' onClick={() => nextGuess(null, searchItems)}>Skip (+{gameState.maxPlaybackLength / 1000}s)</button>

              <PlaylistSelect songDict={songDict} fixedPlaylist={fixedPlaylist} chooseNewSong={chooseNewSong} />

              <button id='submitBtn' onClick={() => nextGuess(submit_ref.current, searchItems)}>Submit</button>
            </span>
          </div>

        </div>


      </>
      }

      {gameState.gameOver && <Gameover targetSong={targetSong} targetPlaylist={targetPlaylist} userDict={userDict} songDict={songDict} guesses={gameState.guesses} chooseNewSong={chooseNewSong} gameOver={gameState.gameOver} volume={volume} audio={gameState.audioUrl} />}
    </div>
  );
}


import { useState, useRef, useEffect, useMemo } from 'react';
import SearchBar from './assets/SearchBar.js';
import PlayButton from './assets/PlayButton.js';
import Gameover from './Gameover';
import PlaylistSelect from './assets/PlaylistSelect.js';




import usePlaylists from './hooks/usePlaylists.js';
import useGameState from './hooks/useGameState.js';
import { useParams, useNavigate } from 'react-router-dom';
import useSpotifyProfile from './hooks/useSpotifyProfile';
import ProgressBar from './assets/ProgressBar.js';

import { GUEST_PROFILE, useSession } from './contexts/SessionContext.js';


export default function Main() {

    const nav = useNavigate();


    const { profile, accessToken, logout } = useSession();

    const { uid } = useParams();
    // const [targetProfile, setTargetProfile] = useState(null);


    const { songDict, searchItems, userDict, getPlaylists, isLoaded } = usePlaylists(profile);
    const { gameState, chooseNewSong, targetSong, targetPlaylist, fixedPlaylist, nextGuess, setPbarValue } = useGameState(songDict);
    const submit_ref = useRef(null);
    const [volume, setVolume] = useState(0.5);


    /**
      * Check if the user is logged in. Otherwise redirect to login if token has expired
      */
    useEffect(() => {
        if (!accessToken) {
            nav('/login');
            return;
        }
    }, [nav]);


    /**
     * Redirect when base user is not specified in the url (on initial redirect from login)
     */
    useEffect(() => {
        if (uid === undefined) {
            nav(`/login`);
            return;
        }
    }, [profile, uid, nav]);



    /**
     * Get info about the user's songs after their info has been loaded.
     */
    // useEffect(() => {
    //     if (accessToken) {
    //         setTargetProfile(uid);
    //     }
    // }, [nav, uid]);



    /**
     * Get the correct playlists for when a target user changes
     */
    useEffect(() => {
        if (uid !== GUEST_PROFILE?.id) {
            getPlaylists(uid, accessToken);
        }
    }, [nav])




    /**
     * Choose a new song if all data has been fetched form Spotify (profile and playlists)
     */
    useEffect(() => {
        if (uid && songDict && Object.keys(songDict).length > 0) {
            chooseNewSong();
        }
    }, [searchItems, chooseNewSong, songDict, profile]);





    // Create HTML elements for each guess (and empty guesses)
    const renderedGuesses = useMemo(() =>
        Array(5).fill(null).map((_, i) => (
            <h4 key={i} className={`guessText ${gameState.guesses[i] === "Skipped..." ? "skippedGuess" : "incorrectGuess"}`} >
                {gameState.guesses[i] || "\u00A0"}
            </h4>
        )),
        [gameState.guesses]
    );

    // Return a dummy version of this page until the user's details have been received
    if (!profile) {
        return <div className="App"><h2>Loading...</h2><div><button onClick={() => logout()}>Logout</button></div></div>;
    }


    if (!isLoaded) {
        return <div className="App"><h2>Retrieving {uid}'s Playlists...</h2><div><button onClick={() => logout()}>Logout</button></div></div>;

    }

    // Return the main page for the app
    return (
        <>
            <span className='streakText'>
                Current Streak: {gameState.score}
                <br />
                Best Streak: {gameState.bestScore}
            </span>
            {!gameState.gameOver &&
                <>
                    <div className='guessContainer' style={{ flex: "1 1 auto" }}>
                        {renderedGuesses}
                    </div>

                    <div className='guessControlContainer' style={{ flex: "0 1 auto" }}>

                        <div style={{ maxWidth: "600px", width: "90vw", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
                            <ProgressBar state={gameState} >

                                {gameState.audioUrl &&
                                    <PlayButton
                                        audioUrl={gameState.audioUrl}
                                        volume={volume}
                                        maxPlaybackLength={gameState.maxPlaybackLength}
                                        inputVal={setPbarValue}
                                    />
                                }

                            </ProgressBar>


                            <SearchBar searchRef={submit_ref} items={searchItems} />

                            <div className='submissionBar' id='songSearchContainer'>
                                <button id='skipBtn' className='selectable' onClick={() => nextGuess(null, searchItems)}>SKIP <span style={{ fontSize: "x-small", fontWeight: "bold" }}>(+{gameState.maxPlaybackLength / 1000}s)</span></button>

                                <PlaylistSelect
                                    songDict={songDict}
                                    fixedPlaylist={fixedPlaylist}
                                    chooseNewSong={chooseNewSong}
                                />

                                <button id='submitBtn' className='selectable' onClick={() => nextGuess(submit_ref.current, searchItems)}>SUBMIT</button>
                            </div>
                        </div>

                    </div>


                </>
            }

            {gameState.gameOver && <Gameover targetSong={targetSong} targetPlaylist={targetPlaylist} userDict={userDict} songDict={songDict} guesses={gameState.guesses} chooseNewSong={chooseNewSong} gameOver={gameState.gameOver} volume={volume} audio={gameState.audioUrl} />}
        </>
    );
}


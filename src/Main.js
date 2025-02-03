import { useState, useRef, useEffect } from 'react';
import './App.css';
import SearchBar from './SearchBar';
import PlayButton from './PlayButton';
import Gameover from './Gameover';
import PlaylistSelect from './PlaylistSelect';
import ProfileBadge from './ProfileBadge.js'


export default function Main() {
  const [profile, setProfile] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const submit_ref = useRef(null);
  const [searchItems, setSearchItems] = useState([])

  const [songDict, setSongDict] = useState({});
  const [userDict, setUserDict] = useState({});


  const targetSong = useRef(null);
  const targetPlaylist = useRef(null);
  const fixedPlaylist = useRef(null);


  // Hooks for play button
  const [audioUrl, setAudioUrl] = useState(null); // State for the audio URL
  const [volume, setVolume] = useState(0.5);
  const [maxPlaybackLength, setMaxPlaybackLength] = useState(1000);


  const [pbarValue, setPbarValue] = useState(0);

  const [gameOver, setGameOver] = useState(false);




  const [bestScore, setBestScore] = useState(parseInt(window.localStorage.getItem("bestStreak")) | 0);
  const [score, setScore] = useState(0);



  useEffect(() => {
    getProfile();
  }, [])



  useEffect(() => {
    if (profile) {
      getPlaylists(); // Call getPlaylists when profile is set
    }
  }, [profile]);



  useEffect(() => {
    chooseNewSong();
  }, [searchItems])




  useEffect(() => {

    if (gameOver) {
      if (guesses[guesses.length - 1] === targetSong.current.name) {
        setScore((prevCount) => prevCount + 1);
      } else {
        setScore(0);
      }
    }

  }, [gameOver, guesses])


  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score); // Update React state
      window.localStorage.setItem("bestStreak", score.toString());
      // window.localStorage.setItem("bestScore", score + 1); // Persist in localStorage
    }
  }, [score])



  const updateDynamicGradient = () => {

    const computedStyles = getComputedStyle(document.querySelector('body'));
  
    const dullAccent = computedStyles.getPropertyValue("--dull-accent-color").trim();
    const secondaryBtn = computedStyles.getPropertyValue("--secondary-btn-color").trim();
    const pageBg = computedStyles.getPropertyValue("--page-background-color").trim();
    

    let gradient = `linear-gradient(to right, ${dullAccent} 0% 6%, `;

    let lastPercent = 6.25;
    for(let i = 0; i < 4; i++){
      gradient += `${secondaryBtn} ${lastPercent}% calc(${lastPercent}% + 2px),`
      let dynamicColor = i < guesses.length ? dullAccent : pageBg;
      gradient += `${dynamicColor} calc(${lastPercent}% + 2px) ${lastPercent + lastPercent}%, `;
      lastPercent += lastPercent
    }

      document.documentElement.style.setProperty("--dynamic-grad", `${gradient.substring(0, gradient.length - 2)})`);
  }


  useEffect(() => {
    updateDynamicGradient();
  }, [guesses]); 



  useEffect(() => {
    const observer = new MutationObserver(() => updateDynamicGradient());
    observer.observe(document.querySelector('body'), { attributes: true, attributeFilter: ["data-theme"] });
  
    return () => observer.disconnect();
  });

  
  async function chooseNewSong() {
    setGameOver(false);
    setMaxPlaybackLength(1000);
    setPbarValue(0);

    const playlistKeys = Object.keys(songDict);

    if (playlistKeys.length > 0) {

      let song;
      if (fixedPlaylist.current === null) {
        const newPlaylist = playlistKeys[Math.floor(Math.random() * playlistKeys.length)]
        targetPlaylist.current = newPlaylist;
        song = songDict[targetPlaylist.current].songs[Math.floor(Math.random() * songDict[targetPlaylist.current].songs.length)]

      } else {
        targetPlaylist.current = fixedPlaylist.current;
        song = songDict[fixedPlaylist.current].songs[Math.floor(Math.random() * songDict[fixedPlaylist.current].songs.length)]

      }

      targetSong.current = song;
      getAudioPreview(song);

      await setGuesses([]);
    }
  }

  async function getAudioPreview(query) {
    const params = new URLSearchParams({ q: query.name });

    console.log(`https://api.deezer.com/search?${params.toString()}`)

    // Make the GET request
    const response = await fetch(`https://api.deezer.com/search?${params.toString()}`);
    // Parse and return the JSON response
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const tracks = await response.json();
    console.log(tracks.data[0].preview)
    setAudioUrl(tracks.data[0].preview)

  }

 


  async function getProfile() {
    let accessToken = window.localStorage.getItem('token');

    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    });

    const data = await response.json();
    setProfile(data);
  }



  async function getPlaylists() {
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
    const playlistPromises = playlists.items.map(async (p) => {

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
    });

    // Wait for all promises 
    await Promise.all(playlistPromises);


    const tmpUserDict = {}

    const userPromises = Array.from(userSet).map(async (username) => {
      const userRequest = await fetch(`https://api.spotify.com/v1/users/${username}`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      });

      const userDetails = await userRequest.json();


      tmpUserDict[username] = { name: userDetails.display_name, url: userDetails.images[0].url, profileUrl: userDetails.external_urls.spotify }
    })


    await Promise.all(userPromises);

    setUserDict(tmpUserDict)
    setSongDict(playlistDict);
    setSearchItems(Array.from(songs));
  }






  function nextGuess() {
    const val = submit_ref.current.value

    if (guesses.length < 5 && searchItems.includes(val)) {

      setGuesses([...guesses, val]);
      setMaxPlaybackLength((2 ** (guesses.length + 1)) * 1000)

      if (guesses.length === 4 || submit_ref.current.value === targetSong.current.name) {
        setGameOver(true);
        setMaxPlaybackLength(30000);
      }

      submit_ref.current.value = "";
    }
  }


  function skipGuess() {
    if (guesses.length < 5) {
      setGuesses([...guesses, "Skipped..."]);
      setMaxPlaybackLength((2 ** (guesses.length + 1)) * 1000)

    }

    if (guesses.length === 4) {
      setGameOver(true);
      setMaxPlaybackLength(30000);

    }
  }


  let renderedGuesses = [];

  for (let i = 0; i < 5; i++) {
    if (i < guesses.length) {
      renderedGuesses.push(<h4 className='guessText' style={{ color: `${guesses[i] === "Skipped..." ? "var(--dull-accent-color)" : "red"}` }}>{guesses[i]}</h4>)
    } else {
      renderedGuesses.push(<h4 className='guessText'>&nbsp;</h4>)
    }
  }

  return (
    <div className="App">

      <header className='appHeader'>
          <span className='streakText'>
            Current Streak: {score}
            <br />
            Best Streak: {bestScore}
          </span>

          <h1 className='noselect'>Maggle!</h1>

          {profile !== null && 
            <ProfileBadge profileUrl={profile.images[1].url} displayName={profile.display_name} volume={volume} setVolume={setVolume}/>
          }
      </header>



      {!gameOver &&
        <div className='guessContainer' >
          {renderedGuesses}
        </div>
      }


      {!gameOver &&
        <div className='guessControlContainer'>

          <input id='trackProgress' type='range'  value={pbarValue} min={0} max={1600} step={1}  disabled />
          <div>

            <span className='submissionBar'>
              <span className='noselect'>0:{String(Math.floor(pbarValue / 100 + 0.1)).padStart(2, '0')}</span>
              <PlayButton audioUrl={audioUrl} volume={volume} maxPlaybackLength={maxPlaybackLength} inputVal={setPbarValue}/>
              <span className='noselect'>0:{String(maxPlaybackLength / 1000).padStart(2, '0')}</span>
            </span>

            <SearchBar searchRef={submit_ref} items={searchItems} />

            <span className='submissionBar'>
              <button id='skipBtn' onClick={skipGuess}>Skip (+{maxPlaybackLength / 1000}s)</button>

              <PlaylistSelect songDict={songDict} fixedPlaylist={fixedPlaylist} chooseNewSong={chooseNewSong} />

              <button id='submitBtn' onClick={nextGuess}>Submit</button>
            </span>
          </div>

        </div>
      }

      {gameOver &&  <Gameover targetSong={targetSong} targetPlaylist={targetPlaylist} userDict={userDict} songDict={songDict} guesses={guesses} chooseNewSong={chooseNewSong} gameOver={gameOver} volume={volume} audio={audioUrl} />}
    </div>
  );
}


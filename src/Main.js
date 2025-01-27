import { useState, useRef, useEffect } from 'react';
import './App.css';
import SearchBar from './SearchBar';
import { useNavigate } from 'react-router-dom';
import PlayButton from './PlayButton';
import speakerIcon from './icons/speaker-icon.png'


export default function Main() {
  const nav = useNavigate();
  const [profile, setProfile] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const submit_ref = useRef(null);
  const [searchItems, setSearchItems] = useState([])

  const [songDict, setSongDict] = useState({});

  const targetSong = useRef(null);

  // Hooks for play button
  const [audioUrl, setAudioUrl] = useState(""); // State for the audio URL
  const [volume, setVolume] = useState(0.5);
  const [maxPlaybackLength, setMaxPlaybackLength] = useState(1000);




  const [gameOver, setGameOver] = useState(false);

  


  const [bestScore, setBestScore] = useState(parseInt(window.localStorage.getItem("bestStreak")) | 0);
  const [score, setScore] = useState(0);


  function changeVolume(e) {
    setVolume(e.target.value); // Set volume from slider value (0-1)
  };

  useEffect(() => {
    getProfile();
  }, [])



  useEffect(() => {
    if (profile) {
      getPlaylists(); // Call getPlaylists when profile is set
    }
  }, [profile]);



  useEffect(() => {
    chooseNewSong()
  }, [searchItems])


 

  useEffect(() => {

    if (gameOver) {
      if (guesses[guesses.length - 1] === targetSong.current) {
        setScore((prevCount) => prevCount + 1);
      } else {
        setScore(0);
      }
    }



  }, [gameOver])


  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score); // Update React state
      window.localStorage.setItem("bestStreak", score.toString());
      // window.localStorage.setItem("bestScore", score + 1); // Persist in localStorage
    }
  }, [score])

  function chooseNewSong() {
    setGameOver(false);
    setMaxPlaybackLength(1000);

    if (searchItems.length > 0) {

      const song = searchItems[Math.floor(Math.random() * searchItems.length)]

      targetSong.current = song;
      getAudioPreview(song);

      setGuesses([]);
    }
  }

  async function getAudioPreview(query) {
    const params = new URLSearchParams({ q: query });

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

  function logout() {
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem("refresh_token");
    nav("/");
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
    const songs = {};
    const accessToken = window.localStorage.getItem("token");

    const response = await fetch(`https://api.spotify.com/v1/users/${profile.id}/playlists`, {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    const playlists = await response.json();

    // Wait for all playlist track fetching to complete
    const playlistPromises = playlists.items.map(async (p) => {
      const songList = await fetch(`https://api.spotify.com/v1/playlists/${p.id}/tracks`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      });

      const playlistSongs = await songList.json();

      // Process tracks for this playlist
      playlistSongs.items.forEach((s) => {
        const artists = s.track.artists.map((x) => x.name).join(", ");
        try {
          songs[`${s.track.name} - ${artists}`] = s.track.album.images[1]?.url || null;
        } catch (error) {
          console.error("Error processing track:", s, error);
        }
      });
    });

    // Wait for all promises 
    await Promise.all(playlistPromises);


    setSongDict(songs);
    setSearchItems(Object.keys(songs));
  }






  function nextGuess() {
    const val = submit_ref.current.value

    if (guesses.length < 5 && searchItems.includes(val)) {

      setGuesses([...guesses, val]);
      setMaxPlaybackLength((2 ** (guesses.length + 1)) * 1000)

      if (guesses.length === 4 || submit_ref.current.value === targetSong.current) {
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



  return (
    <div className="App">

      <header className='appHeader'>
        {profile !== null && <>
          <span className='streakText'>
            Current Streak: {score}

            <br />
            Best Streak: {bestScore}
          </span>

          <h1>Maggle!</h1>


          <span className='dropdownMenu'>
            <span className='profileBadge'>
              <img src={profile.images[1].url}  alt='spotifyProfileImg' />
              <h3>{profile.display_name}</h3>
            </span>
            
            <div className='dropdownContent'>
              <img src = {speakerIcon} alt = 'speaker' style={{width:"20px"}} />
              <input type='range' min="0" max="1" step="0.01" onChange={(e) => changeVolume(e)} value={volume} />
          
              <button onClick={logout}>Logout</button>
            </div>
          </span>
        </>

        }

      </header>



      {!gameOver && <>
        <div className='guessContainer' >

          {guesses.map(g => <h3 style={{ color: `${g === targetSong.current ? "green" : "red"}` }}>{g}</h3>)}

        </div>

        <br />

        <PlayButton audioUrl={audioUrl} volume={volume} maxPlaybackLength={maxPlaybackLength} />




        <SearchBar searchRef={submit_ref} items={searchItems} />


        <span className='submissionBar'> 
          <button onClick={skipGuess}>Skip (+{maxPlaybackLength / 1000}s)</button>
          <button onClick={nextGuess}>Submit</button>
        </span>




        <button onClick={chooseNewSong}>New Song</button>

      </>}

      {gameOver &&
        <>
          <h3>The song was:</h3>
          <img src={songDict[targetSong.current]} alt='albumCover' />
          <h2>{targetSong.current}</h2>


          <PlayButton audioUrl={audioUrl} volume={volume} maxPlaybackLength={maxPlaybackLength} />



          <button onClick={chooseNewSong}>New Song</button>

        </>
      }
    </div>
  );
}


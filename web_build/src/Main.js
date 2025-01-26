import { useState, useRef, useEffect } from 'react';
import './App.css';
import useSound from 'use-sound'
import SearchBar from './SearchBar';
import { useNavigate } from 'react-router-dom';



export default function Main() {
  const nav = useNavigate();
  const [profile, setProfile] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const submit_ref = useRef(null);
  const [searchItems, setSearchItems] = useState([])

  const [songDict, setSongDict] = useState({});

  const targetSong = useRef(null);

  const [audioUrl, setAudioUrl] = useState("https://cdnt-preview.dzcdn.net/api/1/1/8/2/e/0/82e60f2a537430569bdfcc6f590cafac.mp3?hdnea=exp=1737849874~acl=/api/1/1/8/2/e/0/82e60f2a537430569bdfcc6f590cafac.mp3*~data=user_id=0,application_id=42~hmac=35a955317071e56e24720d42fe7e979128c7891959bb9c7b7b36ddcc5358b4c8"); // State for the audio URL
  const [volume, setVolume] = useState(0.5);

  const [play, { stop, sound }] = useSound(audioUrl, { volume: volume }); // Initialize useSound
  const [isPlaying, setIsPlaying] = useState(false);


  const [gameOver, setGameOver] = useState(false);

  const timeoutRef = useRef(null);


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


  // Stop playing when the audioUrl changes
  useEffect(() => {
    if (sound) sound.stop();
    setIsPlaying(false);
  }, [audioUrl, sound]);


  useEffect(() => {

    if(gameOver) {
      if(guesses[guesses.length-1] === targetSong.current) {
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
    if (searchItems.length > 0) {

      const song = searchItems[Math.floor(Math.random() * searchItems.length)]

      targetSong.current = song;
      getAudioPreview(song);

      setGuesses([]);
    }
  }

  async function getAudioPreview(query) {
    const params = new URLSearchParams({ q: query });

    // Make the GET request
    const response = await fetch(`https://api.deezer.com/search?${params.toString()}`);

    // Parse and return the JSON response
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const tracks = await response.json();

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

      if (guesses.length === 4 || submit_ref.current.value === targetSong.current) {
        setGameOver(true);
      }

      submit_ref.current.value = "";
    }


  }


  function skipGuess() {
    if (guesses.length < 5) {
      setGuesses([...guesses, "Skipped..."]);
    }

    if (guesses.length === 4) {
      setGameOver(true);
    }
  }



  const handleToggle = () => {
    if (isPlaying) {
      stop(); // Stop the audio

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      play(); // Play the audio

      timeoutRef.current = setTimeout(() => {
        stop();
        setIsPlaying(false); // Update state to indicate the sound has stopped

      }, (2 ** guesses.length) * 1000); // 5000 ms = 5 seconds
    }
    setIsPlaying(!isPlaying); // Toggle the playing state
  };


  const handleFullToggle = () => {
    if (isPlaying) {
      stop(); // Stop the audio

    } else {
      play(); // Play the audio

    }
    setIsPlaying(!isPlaying); // Toggle the playing state
  };


  return (
    <div className="App">

      <header>
        {profile !== null &&
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>

            <img src={profile.images[1].url} style={{ width: "40px", height: "40px", borderRadius: "20px" }} alt='spotifyProfileImg' />
            <h3 style={{ margin: "0px", marginLeft: "10px" }}>{profile.display_name}</h3>
            <button onClick={logout}>Logout</button>


            Current Streak: {score} 

            <br/>
            Best Streak: {bestScore}
          </div>

          
        }

      </header>

      <h1>Maggle!</h1>

      {!gameOver && <>
      <div style={{ minHeight: "14em", height: "14em" }}>

        {guesses.map(g => <h3 style={{ color: `${g === targetSong.current ? "green" : "red"}` }}>{g}</h3>)}

      </div>

      <br />

      <SearchBar searchRef={submit_ref} items={searchItems} />

      <br />

      <span>
        <button onClick={skipGuess}>Skip</button>
        <button onClick={handleToggle} disabled={!audioUrl} >Play</button>
        <button onClick={nextGuess}>Submit</button>

        <button onClick={chooseNewSong}>New Song</button>

      </span>


      <input type='range' min="0" max="1" step="0.01" onChange={(e) => changeVolume(e)} value={volume} />
      </>}

      {gameOver &&
        <>
          <h3>The song was:</h3>
          <img src={songDict[targetSong.current]} alt='albumCover' />
          <h2>{targetSong.current}</h2>


          <button onClick={handleFullToggle} disabled={!audioUrl} >Play</button>
          <input type='range' min="0" max="1" step="0.01" onChange={(e) => changeVolume(e)} value={volume} />


          <button onClick={chooseNewSong}>New Song</button>

        </>
      }
    </div>
  );
}


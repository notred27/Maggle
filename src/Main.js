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
  const [audioUrl, setAudioUrl] = useState(null); // State for the audio URL
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

  async function chooseNewSong() {
    setGameOver(false);
    setMaxPlaybackLength(1000);

    if (searchItems.length > 0) {

      const song = searchItems[Math.floor(Math.random() * searchItems.length)]

      targetSong.current = song;
      getAudioPreview(song);

      await setGuesses([]);
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

    const userDict = new Set()
    const playlistDict = {}

    const response = await fetch(`https://api.spotify.com/v1/users/${profile.id}/playlists`, {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    const playlists = await response.json();

    // Wait for all playlist track fetching to complete
    const playlistPromises = playlists.items.map(async (p) => {

      try{
        playlistDict[p.name] ={ url: p.images[0].url, songs:[]}

      } catch {
        playlistDict[p.name] = { url: null, songs:[]}
      }

      const songList = await fetch(`https://api.spotify.com/v1/playlists/${p.id}/tracks`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      });

      const playlistSongs = await songList.json();

      // Process tracks for this playlist
      playlistSongs.items.forEach((s) => {
        userDict.add(s.added_by.id) 

        const artists = s.track.artists.map((x) => x.name).join(", ");
        try {
          songs[`${s.track.name} - ${artists}`] = s.track.album.images[1]?.url || null;
        } catch (error) {
          console.error("Error processing track:", s, error);
        }
      });


    //   playlistSongs.items.forEach((s) => {
    //     // console.log(s.added_by.id)
    //     const artists = s.track.artists.map((x) => x.name).join(", ");
    //     try {
    //       playlistDict[p.name].songs.push({name:`${s.track.name} - ${artists}`, imgUrl: s.track.album.images[1]?.url || null, addedBy: s.added_by.id})

    //     } catch (error) {
    //       console.error("Error processing track:", s, error);
    //     }
    //   });
    });

    // Wait for all promises 
    await Promise.all(playlistPromises);


    // Structure: list of songs, each contains a song name, a user reference (key), a playlist reference (key), and a preview url

    // playlist dict of name and image url
    // image dict of name and image url

    console.log(playlistDict)
    console.log(userDict)

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


  let z = [];

  for (let i = 0; i < 5; i++) {
    if (i < guesses.length) {
      z.push(<h4 className='guessText' style={{ color: `${guesses[i] === "Skipped..." ? "#74448c" : "red"}` }}>{guesses[i]}</h4>)
    } else {
      z.push(<h4 className='guessText'>&nbsp;</h4>)
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
              <img src={profile.images[1].url} alt='spotifyProfileImg' />
              <h3>{profile.display_name}</h3>
            </span>

            <div className='dropdownContent'>
              <img src={speakerIcon} alt='speaker' style={{ width: "20px" }} />
              <input type='range' min="0" max="1" step="0.01" onChange={(e) => changeVolume(e)} value={volume} />
              <br />
              <button onClick={logout}>Logout</button>
            </div>
          </span>
        </>

        }

      </header>



      {!gameOver && <>
        <div className='guessContainer' >

          {z}

        </div>


        <div className='guessControlContainer'>



          <span className='submissionBar'>
            <span>0:00</span>
            <PlayButton audioUrl={audioUrl} volume={volume} maxPlaybackLength={maxPlaybackLength} />
            <span>0:10</span>
          </span>

          <SearchBar searchRef={submit_ref} items={searchItems} />

          <span className='submissionBar'>
            <button id='skipBtn' onClick={skipGuess}>Skip (+{maxPlaybackLength / 1000}s)</button>
            <button id='submitBtn' onClick={nextGuess}>Submit</button>
          </span>


        </div>


        {/* <button onClick={chooseNewSong}>New Song</button> */}

      </>}

      {gameOver &&
        <div className='gameoverContainer'>
          <div style={{ width: "30vw" }}>

            <img style={{ height: "40vh" }} src={songDict[targetSong.current]} alt='albumCover' />
            <h3>{targetSong.current}</h3>

            <h4 style={{justifyContent:"center", alignItems:"center"}} >Added by <img style={{height:"25px", width:"25px", borderRadius:"15px"}} src={profile.images[1].url} alt='spotifyProfileImg' /> <b>{profile.display_name}</b> to (playlist name)</h4>


          </div>


          <div className='gameoverInfo'>

            {guesses[guesses.length - 1] === targetSong.current ?
              <h2>Congrats! You got it in {guesses.length} guesses!</h2>
              :
              <h2>Too bad, you didn't get this one :(</h2>
            }

            <div style={{display:"flex", flexDirection:"row"}}>
              {guesses.map(g => [
                <div className='guessTile' style={{backgroundColor:`${g === targetSong.current ? "green" : g === "Skipped..." ? "gray": "red"}`}}>&nbsp;<span>{g}</span></div>
              ])}
            </div>


            <h3>Add to playlist</h3>

            
            <PlayButton audioUrl={audioUrl} volume={volume} maxPlaybackLength={maxPlaybackLength} />


            <button id='retryBtn' onClick={chooseNewSong}>New Song</button>

          </div>

        </div>
      }
    </div>
  );
}


import useSound from "use-sound";
import { useEffect, useRef, useState } from "react";

export default function Gameover({ targetSong, targetPlaylist, userDict, songDict, guesses, chooseNewSong, gameOver, volume, audio }) {
  const resRef = useRef(0);
  const fadeOutTimeout = useRef(null); // Store timeout reference
  const [vol, setVol] = useState(volume); // Initial volume
  const [play, { stop, pause }] = useSound(audio, { volume: vol });


  const responses = [["Incredible! You got it in one try!",
    "You're a music wizard in the making! You got it in one!",
    "You nailed it on the first guess!",
    "One and done! You’ve got some serious music skills!",
    "Flawless! That was a perfect first try!"],

  ["Nice work! You got it in just 2 tries!",
    "Great ear! You figured it out in 2 tries!",
    "You're on fire! Just 2 tries and you got it!",
    "Almost perfect! 2 guesses to victory!",
    "Well played! Only 2 guesses to nail that song!"],

  ["You kept going and it paid off! 3 guesses and you got it!",
    "Great job! It took 3 tries, but you got there!",
    "After 3 guesses, you hit success!",
    "You were determined, and it paid off! You got it in 3 tries!",
    "Not bad! A solid 3 guesses to find the right song!"],

  ["That was a tough one, but you did it in 4 tries!",
    "You fought for it, and you got it in 4 guesses!",
    "Close call! But hey, a win is a win! 4 tries!",
    "You made it! 4 tries later, and the song is yours!",
    "That was a battle, but you conquered it in 4 tries!"],

  ["Phew! That was close, but you did it in 5 tries!",
    "Down to the wire! 5 guesses, but a victory nonetheless!",
    "That was a journey! But hey, a win is a win!",
    "Down to your last guess, but you pulled through!",
    "You took your time, but you got there in the end! 5 guesses!"],

  ["Too bad, you didn't get this one.",
    "Oops! That wasn’t it!",
    "Close, but not quite!",
    "Looks like this one slipped your mind.",
    "Almost! Better luck next round!"]]



  /**
   * Handle full preview playback. #TODO: Memoize/ callback play and pause so resRef will not change
   */
  useEffect(() => {
    if (gameOver) {
      resRef.current = Math.round(Math.random() * 4);
      play(); // Play full song preview on game over

      // Schedule fade-out after 28 seconds
      fadeOutTimeout.current = setTimeout(() => {
        fadeOut(); // Trigger fade-out function
      }, 25000);

    } else {
      pause(); // Stop when component is not rendered
    }

    return () =>{ stop(); clearTimeout(fadeOutTimeout.current); }// Ensure sound stops when component unmounts
  }, [gameOver, play, pause]);


  const fadeOut = () => {
    let fadeDuration = 5000; // 2 seconds fade-out
    let stepTime = 100; // Reduce volume every 100ms
    let steps = fadeDuration / stepTime;
    let volumeStep = vol / steps;

    let interval = setInterval(() => {
      setVol((prevVolume) => {
        if (prevVolume <= 0.05) {
          clearInterval(interval);
          stop(); // Stop playback when volume is almost zero
          return 0;
        }
        return prevVolume - volumeStep; // Decrease volume gradually
      });
    }, stepTime);
  };

  return (
    <div className='gameoverContainer'>
      <div className="gameOverAlbum">
        <img src={targetSong.current.imgUrl} alt='albumCover' />
        <h2>{targetSong.current.name.split(" - ")[0]}</h2>
        <h4>{targetSong.current.name.split(" - ")[1]}</h4>
      </div>


      <div className='gameoverInfo'>

        {guesses[guesses.length - 1] === targetSong.current.name ?
          <h2>{responses[guesses.length - 1][resRef.current]}</h2>
          :
          <h2>{responses[5][resRef.current]}</h2>
        }

        <div id="gameOverGuessContainer">
          {guesses.map((g, idx) => {

            if (g === targetSong.current.name) {
              return <div key={g + " " + idx} className='guessTile correctGuess' >✔️<span>{g}</span></div>

            } else if (g === "Skipped...") {
              return <div key={g + " " + idx} className='guessTile skippedGuess' >➖<span>{g}</span></div>

            } else {
              return <div key={g + " " + idx} className='guessTile incorrectGuess' >❌<span>{g}</span></div>

            }
          })}
        </div>

        {/* <h3>Add to playlist</h3> */}

        <h4 id="addedByTo">
          Added by&nbsp;
          <a href={userDict[targetSong.current.addedBy].profileUrl} target="_blank" className="addedByBadge selectable">
            <img src={userDict[targetSong.current.addedBy].url} alt='spotifyProfileImg' />
            <b>{userDict[targetSong.current.addedBy].name}</b>
          </a>

          &nbsp;to
          
          <br />
          <a href={songDict[targetPlaylist.current].playlistUrl} target="_blank" className="addedByBadge selectable">
            <img src={songDict[targetPlaylist.current].url} alt='spotifyPlaylistImg' /> 
            <b>{targetPlaylist.current}</b>
          </a>
        </h4>

        <button id='retryBtn' className="selectable" onClick={chooseNewSong}>New Song</button>
      </div>
    </div>
  )

}
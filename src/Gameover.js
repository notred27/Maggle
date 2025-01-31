import useSound from "use-sound";
import { useEffect } from "react";

export default function Gameover({targetSong, targetPlaylist,  userDict, songDict, guesses, chooseNewSong, gameOver, volume, audio}) {

  const [play, { stop, pause }] = useSound(audio, { volume: volume });

  useEffect(() => {
    if (gameOver) {
      play(); // Play sound when component is visible
    } else {
      pause(); // Pause or stop when component is hidden
    }

    return () => stop(); // Ensure sound stops when component unmounts
  }, [gameOver, play, pause]);

    return (
        <div className='gameoverContainer'>
            <div style={{ width: "30vw" }}>

                <img style={{ height: "40vh" }} src={targetSong.current.imgUrl} alt='albumCover' />
                <h3>{targetSong.current.name}</h3>

                <h4 style={{ justifyContent: "center", alignItems: "center" }} >Added by <a href={userDict[targetSong.current.addedBy].profileUrl} target="_blank" ><img style={{ height: "25px", width: "25px", borderRadius: "15px" }} src={userDict[targetSong.current.addedBy].url} alt='spotifyProfileImg' /> <b>{userDict[targetSong.current.addedBy].name}</b></a>  to

                    <br /> <a href={songDict[targetPlaylist.current].playlistUrl} target="_blank" ><img style={{ height: "25px", width: "25px", borderRadius: "2px" }} src={songDict[targetPlaylist.current].url} alt='spotifyPlaylistImg' /> <b>{targetPlaylist.current}</b></a></h4>


            </div>


            <div className='gameoverInfo'>

                {guesses[guesses.length - 1] === targetSong.current.name ?
                    <h2>Congrats! You got it in {guesses.length} guesses!</h2>
                    :
                    <h2>Too bad, you didn't get this one :(</h2>
                }

                <div style={{ display: "flex", flexDirection: "row" }}>
                    {guesses.map(g => [
                        <div className='guessTile' style={{ backgroundColor: `${g === targetSong.current.name ? "green" : g === "Skipped..." ? "gray" : "red"}` }}>&nbsp;<span>{g}</span></div>
                    ])}
                </div>


                {/* <h3>Add to playlist</h3> */}




                <button id='retryBtn' onClick={chooseNewSong}>New Song</button>

            </div>

        </div>
    )

}
import { useRef, useState } from "react";


export default function PlaylistSelect({ songDict, fixedPlaylist, chooseNewSong }) {
    const [isDropped, setIsDropped] = useState(false);
    const playlistMenuRef = useRef(null);

    function setFixedPlaylist(key) {
        fixedPlaylist.current = key;
        console.log(fixedPlaylist.current);
        setIsDropped(false);
        chooseNewSong();
    }

    const closeDropdown = (e)=>{
        if(isDropped && !playlistMenuRef.current?.contains(e.target)){
          setIsDropped(false)
        }
    }

    document.addEventListener('mousedown',closeDropdown)

    return (
        <div ref = {playlistMenuRef} style={{position:"relative"}}>

            {isDropped &&
                <div className='playlistSearchDropdown'>
                    <div className='playlistToggleItem' onClick={() => setFixedPlaylist(null)}>All playlists</div>
                    {Object.keys(songDict).map((k) => {
                        return <div className='playlistToggleItem' onClick={() => setFixedPlaylist(k)}><img src={songDict[k].url} alt="playlistIcon" />&nbsp;{k}</div>
                    })}

                </div>
            }

            <span onClick={() => setIsDropped((prev) => !prev)}>{fixedPlaylist.current !== null ? <div className='playlistToggleItem'><img src={songDict[fixedPlaylist.current].url} alt="playlistIcon" /> <b>{fixedPlaylist.current}</b></div> : <div className='playlistToggleItem'><b>All playlists</b></div>}</span>

        </div>


    )
}
import { useRef, useState } from "react";


export default function PlaylistSelect({ songDict, fixedPlaylist, chooseNewSong }) {
    const [isDropped, setIsDropped] = useState(false);
    const playlistMenuRef = useRef(null);

    /**
     * Select a playlist to choose songs from. Also selects a new song after it's triggered.
     * @param {*} key The name of the playlist, or 'null' for all songs
     */
    function setFixedPlaylist(key) {
        fixedPlaylist.current = key;
        setIsDropped(false);
        chooseNewSong();
    }

    /**
     * Close the popup menu if another HTML element is clicked.
     * @param {*} e HTML event
     */
    const closeDropdown = (e) => {
        if (isDropped && !playlistMenuRef.current?.contains(e.target)) {
            setIsDropped(false);
        }
    }

    // Trigger a popup check every time the mouse is clicked.
    document.addEventListener('mousedown', closeDropdown);

    return (
        <div id = "playlistSearchContainer" ref={playlistMenuRef} >

            {isDropped &&
                <div className='playlistSearchDropdown'>
                    <div className='playlistToggleItem' onClick={() => setFixedPlaylist(null)}>All playlists</div>
                    {Object.keys(songDict).map((k) => {
                        return <div key={k} className='playlistToggleItem' onClick={() => setFixedPlaylist(k)}><img src={songDict[k].url} alt="playlistIcon" />&nbsp;{k}</div>
                    })}
                </div>
            }

            <span onClick={() => setIsDropped((prev) => !prev)}>
                {fixedPlaylist.current !== null ?
                    <div className='playlistToggleItem'><img src={songDict[fixedPlaylist.current].url} alt="playlistIcon" /> <b>{fixedPlaylist.current}</b></div>
                    :
                    <div className='playlistToggleItem'><b>All playlists</b></div>}
            </span>
        </div>
    )
}
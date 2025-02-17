
import { useRef, useState } from 'react';
import ThemeOption from './ThemeOption.js';
import { useNavigate } from 'react-router-dom';

import darrow from './../icons/down.svg';
import uarrow from './../icons/up.svg';


export default function ProfileBadge({ profileUrl, displayName, volume, setVolume }) {
  const nav = useNavigate();
  const [isDropped, setIsDropped] = useState(false);
  const menuRef = useRef(null);


  /**
   * Change the volume of the website
   * @param {*} e input range representing volume
   */
  function changeVolume(e) {
    setVolume(e.target.value); // Set volume from slider value (0-1)
  }

  /**
   * Remove token and redirect to login when user logs out.
   */
  function logout() {
    window.localStorage.removeItem("token")
    nav("/login");
  }

  /**
  * Close the popup menu if another HTML element is clicked.
  * @param {*} e HTML event
  */
  const closeDropdown = (e) => {
    if (isDropped && !menuRef.current?.contains(e.target)) {
      setIsDropped(false);
    }
  }

  document.addEventListener('mousedown', closeDropdown);

  return (
    <span className='dropdownMenu' ref={menuRef}>
      <span className='profileBadge noselect selectable' onClick={() => setIsDropped((prev) => !prev)}>
        <img src={profileUrl} alt='spotifyProfileImg' />
        <h3 >{displayName}</h3>&nbsp;&nbsp;

        {isDropped ? <img id="dropImg" src={uarrow} alt='show menu' /> : <img id="dropImg" src={darrow} alt='hide menu' />}
      </span>

      {isDropped && <div className='dropdownContent'>


        <h4>Audio</h4>
        <input type='range' min="0" max="1" step="0.01" onChange={(e) => changeVolume(e)} value={volume} />
        <br />

        <h4>Theme</h4>
        <div className='theme-options'>
          <ThemeOption theme={"red"} />
          <ThemeOption theme={"purple"} />
          <ThemeOption theme={"blue"} />
          <ThemeOption theme={"green"} />
          <ThemeOption theme={"heardle"} />

        </div>


        <h4>Share your playlists!</h4>

        <button onClick={() => {navigator.clipboard.writeText(window.location.href)}}>Copy Link</button>

        <h4>Log Out</h4>
        <button onClick={logout}>Logout</button>

      </div>}
    </span>
  );
}
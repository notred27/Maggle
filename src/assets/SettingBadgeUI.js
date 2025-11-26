import gear from "./../icons/gear.svg"

import { useRef, useState } from 'react';

import ThemeOption from './ThemeOption.js';


export default function SettingBadgeUI({volume, setVolume }) {

    const [isDropped, setIsDropped] = useState(false);
    const settingsRef = useRef(null);


      /**
  * Close the popup menu if another HTML element is clicked.
  * @param {*} e HTML event
  */
  const closeDropdown = (e) => {
    if (isDropped && !settingsRef.current?.contains(e.target)) {
      setIsDropped(false);
    }
  }

  document.addEventListener('mousedown', closeDropdown);


    return (
        <div ref = {settingsRef}>

            <img src={gear} style={{ width: "40px" }} onClick={() => setIsDropped(!isDropped)} ></img>


            {isDropped && <div className='dropdownContent'>


                <h4>Audio</h4>
                {/* <input type='range' min="0" max="1" step="0.01" onChange={(e) => changeVolume(e)} value={volume} /> */}
                <br />

                <h4>Theme</h4>
                <div className='theme-options'>
                    <ThemeOption theme={"heardle"} />
                    <ThemeOption theme={"red"} />
                    <ThemeOption theme={"purple"} />
                    <ThemeOption theme={"blue"} />
                    <ThemeOption theme={"green"} />

                </div>



            </div>}


        </div>


    );
}
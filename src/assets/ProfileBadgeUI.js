import darrow from './../icons/down.svg';
import uarrow from './../icons/up.svg';
import { useState, useRef } from 'react';

export default function ProfileBadgeUI({ profile, children }) {
    const menuRef = useRef(null);

    const [isDropped, setDropped] = useState(false);


    /**
* Close the popup menu if another HTML element is clicked.
* @param {*} e HTML event
*/
    const closeDropdown = (e) => {
        if (isDropped && !menuRef.current?.contains(e.target)) {
            setDropped(false);
        }
    }

    document.addEventListener('mousedown', closeDropdown);


    return (

        <span className='dropdownMenu' ref={menuRef}>
            {profile ?
                <span className='profileBadge noselect selectable' onClick={() => setDropped(!isDropped)}>
                    <img src={profile.images[1].url || darrow} alt='spotifyProfileImg' />
                    <h3 >{profile.display_name}</h3>&nbsp;&nbsp;

                    {isDropped ? <img id="dropImg" src={uarrow} alt='show menu' /> : <img id="dropImg" src={darrow} alt='hide menu' />}

                </span>
                :
                <>
                    <button>Log In</button>

                </>

            }

            {isDropped && profile &&
                <div className='dropdownContent'>
                    {children}

                    
                </div>}
        </span>
    );
}
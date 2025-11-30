import { useSession } from './contexts/SessionContext.js';
import { GUEST_PROFILE } from './contexts/SessionContext.js';

import { useEffect } from 'react';

export default function Login({nav}) {

    const { profile, login, handleGuestLogin } = useSession();


    useEffect(() => {
            if (profile?.display_name !== GUEST_PROFILE.display_name && profile) {
                nav(`/user/${profile.id}`);
            }
        }, [profile, nav]);
    
    return (
        <div id='LandingPage' style={{ justifyContent: "center", display: "flex", flexDirection: "column", height: "100%" }}>
            <div>
                <span id='landingText'>
                    <h1>How well do you know <span style={{ fontWeight: "bold", fontStyle: "italic", textDecoration: "underline" }}>your own</span> playlists?</h1>
                    <p>Connect your Spotify account to <span style={{ fontWeight: "bold", fontStyle: "italic" }}>Maggle</span> and find out today!</p>
                </span>
                <div className="landingBtnContainer" >
                    <button id="SpotifyLoginLink" onClick={() => login()}>Sign In With Spotify <span style={{ fontSize: "x-small", fontWeight: "bold" }}>(BETA)</span></button>
                    <button id="GuestLoginLink" className='selectable' onClick={handleGuestLogin}>Continue As Guest</button>
                </div>
            </div>
        </div>
    );
}


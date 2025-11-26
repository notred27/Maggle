import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useToken from './hooks/useToken.js';
import { get } from 'aws-amplify/api';


export default function Login() {

  const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
  const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
  const AUTH_ENDPOINT = process.env.REACT_APP_AUTH_ENDPOINT;
  const RESPONSE_TYPE = "token";
  const TIMEOUT = 1800000;


  const { setToken, getToken } = useToken();
  const nav = useNavigate();
  const { uid } = useParams();

  const [storedUid, setStoredUid] = useState(localStorage.getItem("uid") || "");
  useEffect(() => {
    if (uid) {
      localStorage.setItem("uid", uid);
      setStoredUid(uid);
    }
  }, [uid]);



  /**
   * After redirect, try to extract and save the response token if auth was successful
   */
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = hashParams.get("access_token");

    if (token && !getToken()) {
      setToken(token, TIMEOUT);
      window.location.hash = ""; // Clear hash
    }
  }, [setToken]);



  /**
   * If you already have an auth token, go to the target user
   */
  useEffect(() => {
    if (getToken()) {

      if (storedUid) {
        window.localStorage.removeItem("uid");
        nav(`/${storedUid}`);
      } else {
        // nav(`/${profile.id}`);  // Redirect to logged-in user's page after profile has loaded
        nav(`/`);
      }
    }
  }, [nav, getToken]);


  async function loginAsGuest() {

    try {
      const op = get({
        apiName: 'maggleAPI',
        path: '/guest-token',
      });

      const { body } = await op.response;  // <-- This is correct
      const token = await body.json();

      setToken(token.access_token, TIMEOUT);
      nav('/guest/');
    } catch (err) {
      console.error("Failed to load guest token", err);
    }

  }


  /**
   * Clear the token on logout
   */
  const logout = () => {
    setToken("", 0);

  }


  return (<div>
    {!getToken() ?
      <div style={{minHeight:"100vh", justifyContent:"center", display:"flex", flexDirection:"column"}}>
        <div>
          <h1>Maggle!</h1>
          <h2>How well do you know your own playlists?</h2>
          <p>Connect your Spotify account and find out!</p>
          <br />
          <div style={{display:"flex", justifyContent:"center", flexWrap:"wrap"}}>

            <a id="SpotifyLoginLink" className='selectable' href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Sign In With Spotify</a>
            
            <button id="GuestLoginLink" className='selectable' onClick={loginAsGuest}>Continue As Guest</button>
          </div>
        </div>


      </div>
      :
      <>
        <h1>This user has not received authorization to use this app. Please contact the app's creator for access.</h1>
        <div>
          <button onClick={logout}>I understand</button>

        </div>
      </>
    }
  </div>);
}


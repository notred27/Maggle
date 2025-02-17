import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useToken from './hooks/useToken.js';


export default function Login() {
  const CLIENT_ID =  process.env.REACT_APP_CLIENT_ID;
  const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI; 
  const AUTH_ENDPOINT = process.env.REACT_APP_AUTH_ENDPOINT;
  const RESPONSE_TYPE = "token";
  const TIMEOUT = 3600000;


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



  /**
   * Clear the token on logout
   */
  const logout = () => {
    setToken("", 0);

  }


  return (<>
    {!getToken() ?
      <>
        <div>
          <h1>Maggle!</h1>
          <h3>How well do you know your own playlists? Connect your Spotify account and find out!</h3>
          <br />
          <a style={{ backgroundColor: "var(--primary-btn-color)", color: "var(--primary-text-color)", padding: "10px", borderRadius: "10px" }} href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login with Spotify</a>
        </div>

        <h3 style={{ width: "70vw", marginLeft: "auto", marginRight: "auto" }}>NOTICE: Due to technical difficulties (a.k.a. I do not want to pay for a backend server), you must have the "CORS Unblock" extension added and enabled to your browser in order to use this website. This extension can be downloaded <a href="https://chromewebstore.google.com/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino?hl=en">here</a>. Please make sure it is active (The "C" will be orange). Thank you! </h3>
      </>
      :
      <>
        <h1>This user has not received authorization to use this app. Please contact the app's creator for access.</h1>
        <div>
          <button onClick={logout}>I understand</button>

        </div>
      </>
    }
  </>);
}


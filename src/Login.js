import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useToken from './hooks/useToken.js';



export default function Login() {

  const CLIENT_ID = "fc40b34070264f1185c0ac9429b3f8c6";
  const REDIRECT_URI = "http://localhost:3000/login";   // Dev redirect
  // const REDIRECT_URI = "https://aws-deployment.dhqsr5m8z3m6j.amplifyapp.com/login";   // Deployment redirect
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const TIMEOUT = 3600000;


  const { setToken, getToken } = useToken();
  const nav = useNavigate();
  const { uid } = useParams();

  if (uid) {  // Store uid when first logging in if redirected
    window.localStorage.setItem("uid", uid);
  }


  /**
   * After redirect, try to extract and save the response token if auth was successful
   */
  useEffect(() => {
    const hash = window.location.hash;
    let token = getToken();

    if (!token && hash) {
      const tokenMatch = hash.substring(1).split("&").find(elem => elem.startsWith("access_token"));
      if (tokenMatch) {
        token = tokenMatch.split("=")[1];
        window.location.hash = ""; // Clear the hash and save the token (to browser)

        setToken(token, TIMEOUT);
      }
    }
  }, [setToken]);


  /**
   * If you already have an auth token, go to the target user
   */
  useEffect(() => {
    if (getToken()) {
      let uid = window.localStorage.getItem("uid");

      if (uid !== "") {
        window.localStorage.setItem("uid", "");
        nav(`/${uid}`);

      } else {
        nav(`/`);
      }
    }
  }, [nav])


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
          <button onClick={logout}>Logout</button>

        </div>
      </>
      }
  </>);
}


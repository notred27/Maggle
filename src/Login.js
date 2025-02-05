import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';



function LoginPage() {
  
  const [token, setToken] = useState("")
  const nav = useNavigate();

  const CLIENT_ID = "8fd502b5eb924a4187198525df2b4709"
  // const REDIRECT_URI = "http://localhost:3000"
  const REDIRECT_URI = "https://aws-deployment.dhqsr5m8z3m6j.amplifyapp.com/"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

      window.location.hash = ""
      window.localStorage.setItem("token", token)
      nav("/home");

    }

    setToken(token)


  }, [nav])


  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }



  return (<>

    {!token ?
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
        <h1>An error occurred. Please ensure that you log out.</h1>
        <button onClick={logout}>Logout</button>
      </>}

  </>);


}

export default LoginPage;

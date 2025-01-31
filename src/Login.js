import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';



function LoginPage() {


  const [token, setToken] = useState("")
  const nav = useNavigate();

  const CLIENT_ID = "fc40b34070264f1185c0ac9429b3f8c6"
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



  return <>

    {!token ?
      <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login
        to Spotify</a>
      : <button onClick={logout}>Logout</button>}

  </>;
}

export default LoginPage;

import Main from "./Main";
import Login from "./Login";
import { Routes, Route } from "react-router-dom";
import Guest from "./Guest";
import AppHeader from "./assets/AppHeader";

import useSpotifyProfile from "./hooks/useSpotifyProfile.js";

import { useNavigate } from "react-router-dom";

import { useEffect } from "react";

import useToken from "./hooks/useToken";


export default function AppRouter() {
  // Load user's preferred theme if one exists
  const savedTheme = window.localStorage.getItem('theme');
  if (savedTheme) {
    document.querySelector('body').setAttribute('data-theme', savedTheme);
  }

  const nav = useNavigate();


  const { profile, getProfile, setProfile } = useSpotifyProfile();
  const { setToken } = useToken();

  // const location = useLocation();
  // const hideHeader = location.pathname.startsWith("/login");

  // update useSpotifyProfile when access token is granted / page navigation changes
  useEffect(() => {
    getProfile();
  }, [nav, getProfile]);

  function logOut() {
    setToken("", 0);
    setProfile(null);
    nav("/login");
  }

  return (
    <div className="App">
        <AppHeader profile={profile} logOut={logOut} nav={nav}></AppHeader>
     
     <main style={{flex: "1 1 auto", display:"flex", flexDirection:"column"}}>

    
      <Routes>
        <Route path="/:uid?" element={<Main />} />
        <Route path="/guest/:uid?" element={<Guest />} />

        <Route path="/login/:uid?" element={<Login />} />
      </Routes>
       </main>

      <footer style={{flex: "0 1 40px"}}>
        {/* Made with React. */}
      </footer>
    </div>
  )
}
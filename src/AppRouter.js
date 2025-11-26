import Main from "./Main";
import Login from "./Login";
import { Routes, Route, useLocation } from "react-router-dom";
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

  const location = useLocation();
  const hideHeader = location.pathname.startsWith("/login");

  // update useSpotifyProfile when access token is granted / page navigation changes
  useEffect(() => {
    getProfile();
  }, [nav]);

  function logOut() {
    setToken("", 0);
    setProfile(null);
    nav("/login");
  }

  return (
    <div className="App">
      {!hideHeader &&
        <AppHeader profile={profile} logOut={logOut} nav={nav}></AppHeader>
    
      }

      
      <Routes>
        <Route path="/:uid?" element={<Main />} />
        <Route path="/guest/:uid?" element={<Guest />} />

        <Route path="/login/:uid?" element={<Login />} />
      </Routes>
    </div>
  )
}
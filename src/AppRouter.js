// src/AppRouter.jsx
import Main from "./Main";
import Login from "./Login";
import { Routes, Route } from "react-router-dom";
import Guest from "./Guest";
import AppHeader from "./assets/AppHeader";

import { useSession } from "./contexts/SessionContext"; // <-- use this
import { useNavigate } from "react-router-dom";

export default function AppRouter() {
  // theme code unchanged
  const savedTheme = window.localStorage.getItem("theme");
  if (savedTheme) {
    document.querySelector("body").setAttribute("data-theme", savedTheme);
  }

  const nav = useNavigate();

  const { profile, login, logout, accessToken } = useSession();

  return (
    <div className="App">
      <AppHeader profile={profile} logOut={logout} nav={nav} />

      <main style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", minHeight: "90vh" }}>
        <Routes>
          <Route path="/:uid?" element={<Main />} />
          <Route path="/user/:uid?" element={<Main />} />

          <Route path="/guest/:uid?" element={<Guest />} />
          <Route path="/login/:uid?" element={<Login  nav = {nav} />} />
          <Route path="/about" element={<Login />} />
        </Routes>
      </main>

      <footer style={{ flex: "0 1 40px", display: "flex", flexDirection: "column", textAlign: "left", padding: "40px", fontWeight: "bold", gap: "10px" }}>
        <a href="/about" style={{ color: "white", textDecoration: "none" }}>ABOUT</a>

        {profile === null ? (
          <a href="/login" style={{ color: "white", textDecoration: "none" }}>LOGIN</a>
        ) : (
          <a onClick={logout} href="/login" style={{ color: "white", textDecoration: "none" }}>LOGOUT</a>
        )}

        <a href="https://ko-fi.com/notred27" style={{ color: "white", textDecoration: "none" }}>SUPPORT US</a>
      </footer>
    </div>
  );
}

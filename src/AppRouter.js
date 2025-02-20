import Main from "./Main";
import Login from "./Login";
import {Routes, Route } from "react-router-dom";
import Guest from "./Guest";

export default function AppRouter() {
    // Load user's preferred theme if one exists
    const savedTheme = window.localStorage.getItem('theme');
    if(savedTheme) {
      document.querySelector('body').setAttribute('data-theme', savedTheme);
    }

    return (
        <div className="App">
          <Routes>
            <Route path="/:uid?" element={ <Main/> } />
            <Route path="/guest/:uid?" element={ <Guest/> } />

            <Route path="/login/:uid?" element={ <Login/> } />
          </Routes>
        </div>
      )
}
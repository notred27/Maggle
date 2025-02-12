import Main from "./Main";
import Login from "./Login";
import {Routes, Route } from "react-router-dom";


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
            <Route path="/login/:uid?" element={ <Login/> } />
          </Routes>
        </div>
      )
}
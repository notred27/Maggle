import Main from "./Main"

import Login from "./Login"
import {Routes, Route } from "react-router-dom"

export default function App() {
    return (
        <div className="App">
          <Routes>
            <Route path="/" element={ <Login/> } />
            <Route path="/home" element={ <Main/> } />

           
          </Routes>
        </div>
      )
}
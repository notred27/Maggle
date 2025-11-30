import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './AppRouter';
// import reportWebVitals from './reportWebVitals.js';

import { BrowserRouter } from "react-router-dom";

import './styles/index.css';
import './styles/themes.css';
import './styles/App.css';

import { Amplify } from 'aws-amplify';
import amplifyconfig from './amplifyconfiguration.json';

import SessionProvider from "./contexts/SessionContext";

Amplify.configure(amplifyconfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <SessionProvider>
    <AppRouter />

    </SessionProvider>
  </BrowserRouter>
);

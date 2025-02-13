



import { render, screen, act, fireEvent } from '@testing-library/react';
import Main from '../Main.js';
import useToken from '../hooks/useToken.js';


import { useNavigate } from 'react-router-dom';
import useSpotifyProfile from '../hooks/useSpotifyProfile.js';



test('Redirect to login if no token', () => {
    useSpotifyProfile.mockReturnValue({
        profile: null,
    });

    // Set function 
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);


    useToken.mockReturnValue({
        setToken: jest.fn(),
        getToken: jest.fn(() => ''),
    });

    render(
        <Main />
    );

    // Expect redirect to be called once
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(mockNavigate).toHaveBeenCalledTimes(1);

    // Expect page to show "Loading..."
    expect(screen.getByText(/Loading...?/i)).toBeInTheDocument();
});



test('Ensure user\'s playlists are fetched', () => {
    useSpotifyProfile.mockReturnValue({
        profile: {
            display_name: "michael",
            external_urls: {
              spotify: "https://open.spotify.com/user/jd76h9cddqc2heszq1eyjhl52"
            },
            followers: { href: null, total: 27 },
            id: "jd76h9cddqc2heszq1eyjhl52",
            images: [
              { height: 300, url: "https://i.scdn.co/image/ab6775700000ee8530cd5702d3183846f48ba522", width: 300 }
            ],
            type: "user",
            uri: "spotify:user:jd76h9cddqc2heszq1eyjhl52"
          },
          getProfile: jest.fn()
    })

    // Set function
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    useToken.mockReturnValue({
        setToken: jest.fn(),
        getToken: jest.fn(() => 'mock_token'),
    });

    render(
        <Main />
    );

    // Expect page to not redirect since a user is specified
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText(/Retrieving?/i)).toBeInTheDocument();
});

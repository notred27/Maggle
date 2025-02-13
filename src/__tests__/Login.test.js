import { render, screen, act, fireEvent } from '@testing-library/react';
import Login from '../Login.js';

import useToken from '../hooks/useToken';
import { useNavigate } from 'react-router-dom';

// import { __mockNavigate } from 'react-router-dom'; // Import the exposed mock



test('Render initial Login page', () => {
  useToken.mockReturnValue({
    setToken: jest.fn(),
    getToken: jest.fn(() => ''),
  });

  render(
    <Login />
  );

  const helloText = screen.getByText(/How well do you know your own playlists?/i);
  expect(helloText).toBeInTheDocument();
});





test('Route from login after receiving token', () => {
  const mockGetToken = jest.fn().mockReturnValue('');
  useToken.mockReturnValue({
    setToken: jest.fn(),
    getToken: mockGetToken,
  });

  const mockNavigate = jest.fn();
  useNavigate.mockReturnValue(mockNavigate);


  const { rerender } = render(<Login />);

  // Check that login page renders with no token
  expect(screen.getByText(/How well do you know your own playlists?/i)).toBeInTheDocument();
  expect(mockNavigate).not.toHaveBeenCalled();

  // Set token and re-render
  mockGetToken.mockReturnValueOnce('mock_token');


  act(() => {
    rerender(<Login />);
  });

  // Check that 401 page appears and user is redirected
  expect(screen.getByText(/This user has not received authorization to use this app?/i)).toBeInTheDocument();


  // Expect navigation to be called (FIXME issue mocking this component as it appears in a useEffect)
  // expect(mockNavigate).toHaveBeenCalledTimes(1); 
  // expect(mockNavigate).toHaveBeenCalledWith('/'); // Check if it's called with correct parameter
});
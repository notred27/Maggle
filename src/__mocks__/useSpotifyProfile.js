const useSpotifyProfile = jest.fn(() => ({
    profile: { display_name: "michael"},
    getProfile: jest.fn()
  }));

  
  export default useSpotifyProfile;
  
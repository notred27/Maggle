export default async function SpotifyAuth() {


    function generateCodeVerifier() {
        const randomValues = new Uint8Array(32); // 32 bytes = 256 bits
        window.crypto.getRandomValues(randomValues);

        // Convert to Base64 URL Safe string
        return Array.from(randomValues)
            .map((b) => String.fromCharCode(b))
            .join('')
            .replace(/[^a-zA-Z0-9-_~.]/g, '')
            .slice(0, 128); // Keep within max length
    }




    async function generateCodeChallenge(codeVerifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);

        // Hash the code verifier with SHA-256
        const digest = await window.crypto.subtle.digest('SHA-256', data);

        // Convert the hash to Base64 URL Safe string
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, ''); // Remove padding
    }






    // Step 1: Generate Code Verifier and Code Challenge
    const codeVerifier = generateCodeVerifier();
    generateCodeChallenge(codeVerifier).then((codeChallenge) => {
        // Step 2: Save Code Verifier to Local Storage (for later)
        localStorage.setItem('code_verifier', codeVerifier);

        // Step 3: Redirect to Spotify Authorization URL
        const clientId = "301072c99e12496bb1a015d902004008"; // Replace with your client ID
        const redirectUri = 'http://localhost:3000';
        const scopes = 'user-read-private user-read-email';

        const authUrl = `https://accounts.spotify.com/authorize?` +
            `client_id=${clientId}` +
            `&response_type=code` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&scope=${encodeURIComponent(scopes)}` +
            `&code_challenge=${codeChallenge}` +
            `&code_challenge_method=S256`;

        window.location.href = authUrl;
    });



    async function exchangeAuthorizationCodeForToken(authCode) {
        const codeVerifier = localStorage.getItem('code_verifier');
        const redirectUri = 'YOUR_REDIRECT_URI';
        const clientId = 'YOUR_SPOTIFY_CLIENT_ID';
      
        const body = new URLSearchParams({
          client_id: clientId,
          grant_type: 'authorization_code',
          code: authCode,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        });
      
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        });
      
        const data = await response.json();
        console.log('Access Token:', data.access_token);
        console.log('Refresh Token:', data.refresh_token);
      }
      




}
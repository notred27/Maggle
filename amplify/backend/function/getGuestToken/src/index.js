const https = require('https');
const querystring = require('querystring');

// .env vars
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

exports.handler = async (event) => {

  console.log(CLIENT_ID, CLIENT_SECRET)
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const data = querystring.stringify({
    grant_type: 'client_credentials',
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(tokenUrl, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        const parsedData = JSON.parse(responseData);
        if (res.statusCode === 200) {
          resolve({
            statusCode: 200,
            body: JSON.stringify({ access_token: parsedData.access_token }),
          });
        } else {
          reject({
            statusCode: res.statusCode,
            body: JSON.stringify({ error: parsedData.error, description: parsedData.error_description }),
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal Server Error', message: error.message }),
      });
    });

    req.write(data);
    req.end();
  });
};

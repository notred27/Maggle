const https = require('https');

exports.handler = async (event) => {
    console.log('Event received:', event);

    const { q } = event.queryStringParameters || {};
    if (!q) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({ message: 'Missing search query (q).' }),
        };
    }

    const deezerApiUrl = `https://api.deezer.com/search?q=${encodeURIComponent(q)}`;

    return new Promise((resolve, reject) => {
        https.get(deezerApiUrl, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',  
                        'Access-Control-Allow-Methods': 'GET',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    },
                    body: data,
                });
            });
        }).on('error', (err) => {
            console.error('Error fetching from Deezer:', err);
            reject({
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify({ message: 'Internal server error' }),
            });
        });
    });
};

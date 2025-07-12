process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch-commonjs');
 
const app = express();
const PORT = 4000;

app.use(cors());

app.get('/swagger', async (req, res) => {

const swaggerUrl = req.query.url;
if (!swaggerUrl) {
return res.status(400).json({ error: 'Missing "url" query parameter' }); H
}

try {
const response = await fetch(swaggerUrl);

if (!response.ok) {
throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
}

const contentType = response.headers.get('content-type');
if (!contentType || !contentType.includes('application/json')) { 
    throw new Error('Response is not JSON');
}
const data = await response.json();
res.json(data);
} catch (error) {
console.error('Error fetching Swagger JSON:, error.message');
res.status(500).json({ error: 'Failed to fetch Swagger data', details: error.message});
}
});

app.listen(PORT, () => {
 console.log(`Proxy server running at http://localhost:${PORT}`);
});
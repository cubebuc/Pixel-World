console.log('Server-side code running')

const express = require('express');

//Pixels
let pixels = [];

//Express
const app = express();
app.use(express.static('public'));
app.use(express.json());

app.listen(3000, () =>
{
    console.log("Listening on port localhost:3000");
});

app.get('/', (req, res) =>
{
    res.sendFile('index.html');
});

app.post('/addpixel', (req, res) =>
{
    let pixel = req.body.pixel;
    pixels.push(pixel);
    res.end();
});

app.post('/getpixels', (req, res) =>
{
    res.json({pixels: pixels});
});
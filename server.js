console.log('Server-side code running')

const express = require('express');
const { Pool, Client } = require('pg');

const PORT = process.env.PORT || 3000;

//Pixels
let pixels = [];

//Postgresql
const pool = new Pool
({
    connectionString: 'postgres://spfmmjliqvrzyq:8eda981e4ec3382a7b55ccbf81dc60b0cf041b2ba6f7253b31301fc10b856592@ec2-54-73-152-36.eu-west-1.compute.amazonaws.com:5432/dfo9psvno02irm',
    ssl: { rejectUnauthorized: false }
});
let query;

function initDb()   //Creates mandatory tables, if they do not exist
{
    query = `CREATE TABLE IF NOT EXISTS pixels (
        x integer,
        y integer,
        color varchar(7));`;
    pool.query(query);
}

async function loadPixels()
{
    query = {text: `SELECT * FROM pixels;`, rowMode: 'array'};
    let res = await pool.query(query);
    for(let pixel of res.rows)
    {
        pixels.push(pixel);
    }
}

function savePixel(pixel)
{
    let values = `${pixel[0]}, ${pixel[1]}, '${pixel[2]}'`;
    query = `INSERT INTO pixels(x, y, color) VALUES (${values});`;
    pool.query(query);
}

initDb();
loadPixels();

//Express
const app = express();
app.use(express.static('public'));
app.use(express.json());

app.listen(PORT, () =>
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
    savePixel(pixel);
    res.end();
});

app.post('/getpixels', (req, res) =>
{
    res.json({pixels: pixels});
});
console.log('Server-side code running')

const express = require('express');
const { Pool, Client } = require('pg');

const PORT = process.env.PORT || 3000;

//Pixels
let pixels = [];

//Postgresql
const pool = new Pool
({
    connectionString: 'postgres://opslpfln:e1BlKIBHNJ-xZSdlV-GuaAk6PniDqfks@hansken.db.elephantsql.com/opslpfln',
    ssl: { rejectUnauthorized: false }
});
let query;

function initDb()   //Creates mandatory tables, if they do not exist
{
    query = `CREATE TABLE IF NOT EXISTS pixels (
        x integer,
        y integer,
        color varchar(7));`;
    pool.query(query)
    .catch(e =>
    {
        //console.log(e);
    });;
}

async function loadPixels()
{
    query = {text: `SELECT * FROM pixels;`};
    pool.query(query)
    .then(res => 
    {
        for(let pixel of res.rows)
        {
            pixels.push(pixel);
        }
    })
    .catch(e =>
    {
        //console.log(e);
    });
}

function savePixel(pixel)
{
    let values = `${pixel.x}, ${pixel.y}, '${pixel.color}'`;
    query = `INSERT INTO pixels(x, y, color) VALUES (${values});`;
    pool.query(query)
    .catch(e =>
    {
        //console.log(e);
    });
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

app.post('/sendpixel', (req, res) =>
{
    let pixel = req.body.pixel;
    console.log(pixel);
    pixels.push(pixel);
    savePixel(pixel);
    res.end();
});

app.post('/getpixels', (req, res) =>
{
    res.json({pixels: pixels});
});
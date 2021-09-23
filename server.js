console.log('Server-side code running')

const express = require('express');
const { Pool } = require('pg');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const LOOP_INTERVAL = 1000;

const app = express();
app.use(express.static('public'));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', () =>
{
    console.log('User connected');
});

server.listen(PORT, () =>
{
    console.log('Listening on port localhost:3000');
});

//Pixels
let pixels = [];
let newPixels = [];

//Loop
function loop()
{
    console.log(pixels.length);
    if(newPixels.length > 0)
    {
        saveNewPixels();
    }
}

setInterval(loop, LOOP_INTERVAL);

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
        console.log(e);
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
        console.log(e);
    });
}

function saveNewPixels()
{
    query = `INSERT INTO pixels(x, y, color) VALUES `;
    for(let pixel of newPixels)
    {
        query += `(${pixel.x}, ${pixel.y}, '${pixel.color}'),`;
    }
    query = query.substring(0, query.length - 1) + `;`;
    //console.log(query);
    pool.query(query)
    .catch(e =>
    {
        console.log(e);
    });
    newPixels = [];
}

initDb();
loadPixels();

//Express
app.get('/', (req, res) =>
{
    res.sendFile('index.html');
});

app.post('/addpixel', (req, res) =>
{
    let pixel = req.body.pixel;
    newPixels.push(pixel);
    pixels.push(pixel);
    io.emit('pixel', pixel);
    res.end();
});

app.post('/getpixels', (req, res) =>
{
    res.json({pixels: pixels});
});
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let pixels = [];

window.addEventListener('resize', resizeCanvas);
document.addEventListener('click', onClick);

onLoad();

async function onLoad()
{
    resizeCanvas();
    await getPixels();
    drawAllPixels();
}

function resizeCanvas()
{
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    drawAllPixels();
}

function drawPixel(pixel)
{
    const PIXEL_SIZE = 10;
    x = pixel[0] - pixel[0] % PIXEL_SIZE;
    y = pixel[1] - pixel[1] % PIXEL_SIZE;
    
    context.fillStyle = pixel[2];
    context.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
}

function drawAllPixels()
{
    for(let pixel of pixels)
    {
        drawPixel(pixel);
    }
}

function onClick(e)
{
    let x = e.clientX;
    let y = e.clientY;
    let color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    let pixel = [x, y, color];
    drawPixel(pixel);
    sendPixel(pixel);
}

function sendPixel(pixel)
{
    fetch('/addpixel', 
    {
        method: 'POST',
        headers: 
        {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({pixel})
    }).catch(function(err)
    {
        console.error(err);
    });
}

async function getPixels()
{
    let res = await fetch('/getpixels', 
    {
        method: 'POST',
        headers: 
        {
            'Content-Type': 'application/json'
        }
    }).catch(function(err)
    {
        console.error(err);
    });
    let data = await res.json();
    pixels = data.pixels;
}
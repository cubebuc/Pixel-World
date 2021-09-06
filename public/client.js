const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const LOOP_INTERVAL = 100;
const MIN_PIXEL_SIZE = 5;
const MAX_PIXEL_SIZE = 100;
let pixelSize = 10;
let offsetX = 0;
let offsetY = 0;
let pixels = [];

window.addEventListener('resize', resizeCanvas);
document.addEventListener('click', onClick);
document.addEventListener('wheel', onWheel);
document.addEventListener('keydown', onKeyDown);

onLoad();
setInterval(loop, LOOP_INTERVAL);

async function onLoad()
{
    resizeCanvas();
    await getPixels();
    drawAllPixels();
}

async function loop()
{ 
    await getPixels();
    drawAllPixels();
}

function onClick(e)
{
    let x = (e.clientX - e.clientX % pixelSize - offsetX) / pixelSize;
    let y = (e.clientY - e.clientY % pixelSize - offsetY) / pixelSize;
    let color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    let pixel = [x, y, color];
    drawPixel(pixel);
    sendPixel(pixel);
}

function onWheel(e)
{
    console.log(e.deltaY);
    if(e.deltaY > 0 && pixelSize > MIN_PIXEL_SIZE)
    {
        pixelSize -= 5;
    }
    else if(e.deltaY < 0 && pixelSize < MAX_PIXEL_SIZE)
    {
        pixelSize += 5;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawAllPixels();
}

function onKeyDown(e)
{
    if(e.code == 'ArrowLeft')
    {
        offsetX -= 10;
    }
    if(e.code == 'ArrowRight')
    {
        offsetX += 10;
    }
    if(e.code == 'ArrowUp')
    {
        offsetY -= 10;
    }
    if(e.code == 'ArrowDown')
    {
        offsetY += 10;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
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
    x = pixel[0] * pixelSize + offsetX;
    y = pixel[1] * pixelSize + offsetY;
    context.fillStyle = pixel[2];
    context.fillRect(x, y, pixelSize, pixelSize);
}

function drawAllPixels()
{
    for(let pixel of pixels)
    {
        drawPixel(pixel);
    }
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
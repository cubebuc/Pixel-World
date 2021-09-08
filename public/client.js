const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const LOOP_INTERVAL = 100;

const PIXEL_SIZES = [1, 2, 5, 10, 20, 40, 70, 100, 150, 200];
let pixelSizeIndex = 3;
let pixelSize = 10;

let offsetX = 0;
let offsetY = 0;

let lmbDown = false;
let rmbDown = false;

let lastPixelPos;

let pixels = [];

window.addEventListener('resize', resizeCanvas);
document.addEventListener("contextmenu", e => e.preventDefault());

document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mouseup', onMouseUp);
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('wheel', onWheel);

document.addEventListener('touchstart', onTouchStart);
document.addEventListener('touchend', onTouchEnd);
document.addEventListener('touchmove', onTouchMove);

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
    redrawCanvas()
}

function onMouseDown(e)
{
    if(e.button == 0)   //Left mouse button
    {
        lmbDown = true;
        let pos = getPixelPos(e.clientX, e.clientY);
        let color = getRandomColor();
        let pixel = {x: pos.x, y: pos.y, color: color};
        lastPixelPos = pos;
        drawPixel(pixel);
        sendPixel(pixel);
    }
    else if(e.button == 2)  //Right mouse button
    {
        rmbDown = true;
    }
}

function onMouseUp(e)
{
    if(e.button == 0)  //Left mouse button
    {
        lmbDown = false;
    }
    else if(e.button == 2)  //Right mouse button
    {
        rmbDown = false;
    }
}

function onMouseMove(e)
{
    if(lmbDown)
    {
        let pos = getPixelPos(e.clientX, e.clientY);
        if(JSON.stringify(pos) !== JSON.stringify(lastPixelPos))
        {
            onMouseDown(e);
        }
    }
    if(rmbDown)
    {
        offsetX += e.movementX;
        offsetY += e.movementY;
        redrawCanvas()
    }
}

function onWheel(e)
{
    let prevX = window.innerWidth / pixelSize;
    let prevY = window.innerHeight / pixelSize;

    if(e.deltaY > 0 && pixelSizeIndex > 0)
    {
        pixelSizeIndex--;
    }
    else if(e.deltaY < 0 && pixelSizeIndex < PIXEL_SIZES.length - 1)
    {
        pixelSizeIndex++;
    }
    pixelSize = PIXEL_SIZES[pixelSizeIndex];

    let nowX = window.innerWidth / pixelSize;
    let nowY = window.innerHeight / pixelSize;
    let indexX = prevX / nowX;
    let indexY = prevY / nowY;
    offsetX *= indexX;
    offsetY *= indexY;

    redrawCanvas()
}

function onTouchStart(e)
{

}

function onTouchEnd(e)
{
    
}

function onTouchMove(e)
{
    
}

function redrawCanvas()
{
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

function getRandomColor()
{
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function getPixelPos(realX, realY)
{
    let x = (realX - realX % pixelSize - offsetX + offsetX % pixelSize) / pixelSize;
    let y = (realY - realY % pixelSize - offsetY + offsetY % pixelSize) / pixelSize;
    return {x: x, y: y};
}

function drawPixel(pixel)
{
    x = pixel.x * pixelSize + offsetX - offsetX % pixelSize;
    y = pixel.y * pixelSize + offsetY - offsetY % pixelSize;
    context.fillStyle = pixel.color;
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
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const LOOP_INTERVAL = 100;
let ongoingTouches = [];

const PIXEL_SIZES = [1, 2, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200];

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

document.addEventListener('touchstart', onTouchStart, {passive: false});
document.addEventListener('touchend', onTouchEnd, {passive: false});
document.addEventListener('touchmove', onTouchMove, {passive: false});

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
    redrawCanvas();
}

function onMouseDown(e)
{
    if(e.button == 0)   //Left mouse button
    {
        lmbDown = true;
        let pos = getPixelPos(e.clientX, e.clientY);
        let color = getRandomColor();
        let pixel = {x: pos.x, y: pos.y, color: color};
        addPixel(pixel);
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
    e.preventDefault();
    let touches = e.changedTouches;
    for(let touch of touches)
    {
        ongoingTouches.push({id: touch.identifier, x: touch.clientX, y: touch.clientY});
    }

    if(ongoingTouches.length == 1)
    {
        let touch = ongoingTouches[0];
        let pos = getPixelPos(touch.x, touch.y);
        let color = getRandomColor();
        let pixel = {x: pos.x, y: pos.y, color: color};
        addPixel(pixel);
    }
}

function onTouchEnd(e)
{
    e.preventDefault();
    let touches = e.changedTouches;
    for(let touch of touches)
    {
        let index = ongoingTouches.findIndex(t => t.id == touch.identifier);
        ongoingTouches.splice(index, 1);
    }
}

function onTouchMove(e)
{
    e.preventDefault();
    let touches = e.changedTouches;

    if(ongoingTouches.length == 1)
    {
        let touch;
        for(let t of touches)
        {
            if(t.identifier == ongoingTouches[0].id)
            {
                touch = t;
            }
        }

        let pos = getPixelPos(touch.clientX, touch.clientY);
        if(JSON.stringify(pos) !== JSON.stringify(lastPixelPos))
        {
            let color = getRandomColor();
            let pixel = {x: pos.x, y: pos.y, color: color};
            addPixel(pixel);
        }
    }
    else if(ongoingTouches.length == 2)
    {

    }
    else if(ongoingTouches.length == 3)
    {
        for(let touch of touches)
        {
            let t = ongoingTouches.find(t => t.id == touch.identifier);
            let deltaX = t.x - t.clientX;
            let deltaY = t.y - t.clientY; 
            offsetX += deltaX / 10;
            offsetY += deltaY / 10;
        }
        redrawCanvas()
    }
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

function addPixel(pixel)
{
    pixels.push(pixel);
    drawPixel(pixel);
    sendPixel(pixel);
    lastPixelPos = {x: pixel.x, y: pixel.y};
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
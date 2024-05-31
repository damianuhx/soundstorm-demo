function fullscreen(canvas){
    console.log(canvas);
    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    }
    else if(canvas.webkitRequestFullScreen) {
        canvas.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
    else if (canvas.mozRequestFullScreen) {
        canvas.mozRequestFullScreen();
    }
    else {
        console.log('Fullscreen is not supported');
    }
}

/* Close fullscreen */
function closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    }
  }

function directionh(x, y)
{
    x=herox-x;
    y=heroy-y;

    angle =  Math.atan2(y, x);

    return (angle);
}

function rgbToHex(R,G,B) {return '0x'+toHex(R)+toHex(G)+toHex(B)}

function toHex(n) {
    n = parseInt(n,10);
    if (isNaN(n)) return "00";
    n = Math.max(0,Math.min(n,255));
    return "0123456789ABCDEF".charAt((n-n%16)/16)
        + "0123456789ABCDEF".charAt(n%16);
}



function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function direction (x1,y1,x2,y2)
{
    x=x1-x2;
    y=y1-y2;
    angle =  Math.atan2(y, x);
    return (angle);
}   
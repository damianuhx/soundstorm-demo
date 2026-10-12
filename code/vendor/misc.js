function fullscreen(canvas){
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
    var exit;
    if (document.fullscreenElement && document.exitFullscreen) {
      exit = document.exitFullscreen;
    } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) { /* Safari */
      exit = document.webkitExitFullscreen;
    } else if (document.msFullscreenElement && document.msExitFullscreen) { /* IE11 */
      exit = document.msExitFullscreen;
    }
    if (!exit){return;}
    try {
      var result = exit.call(document);
      if (result && typeof result.catch === 'function'){
        result.catch(function ignoreFullscreenExit() {});
      }
    } catch (error) {
      // Esc can leave fullscreen between the element check and the exit call.
    }
  }

function directionh(x, y)
{
    x=herox-x;
    y=heroy-y;

    var angle =  Math.atan2(y, x);

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
    var x=x1-x2;
    var y=y1-y2;
    var angle =  Math.atan2(y, x);
    return (angle);
}   

function random(max)
{
    let returnvalue =  Math.floor(Math.random()*max+1);
    if (returnvalue>max || returnvalue<0){
        return max;
    }
    else{
        return returnvalue
    }
}

function xyz2hex(input){
    return rgbToHex(input.x, input.y, input.z)
}

//INITIALIZE
function onReady()
{
    var renderwidth = 1920;
    var renderheight = 1080;

    

    //fit canvas size to width or height of the window (the one limiting the canvas first)
    if (window.screen.width<1920 || window.screen.height<1080){
        if (9*window.screen.width<16*window.screen.height){
            renderwidth=window.screen.width;
            renderheight=window.screen.width*9/16;
        }
        else{
            renderwidth=window.screen.height*16/9;
            renderheight=window.screen.height;
        }
    }


    renderer = PIXI.autoDetectRenderer(renderwidth, renderheight, { /*view: canvas, */resolution: 1, /*forceCanvas: true,*/ forceFXAA: true});
    //renderer = PIXI.CanvasRenderer(1920, 1080, { /*view: canvas, */resolution: 1 , /*forceCanvas: true*/ forceFXAA: true});
    renderer.background.color = 0x000000;
    if (renderheight>renderwidth){
        renderer.view.style.height = '100% !important';
    }
    else{
        renderer.view.style.width = '100% !important';
    }



    document.body.appendChild(renderer.view);
    canvas=document.getElementsByTagName("canvas");




    stats = new Stats();
    requestAnimationFrame(update);

    setStage();
    
    
    //Set event listeners for controls
    function getKeyDown(e){
        if ((e.keyCode == 27 || e.keyCode == 13)) {
            fullscreen(canvas[0]);
        }
        if(e.keyCode == 80){keys.pause=1;}

        if(e.keyCode == 38){keys.up.key=1;} //38
        if(e.keyCode == 40){keys.down.key=1;} //40
        if(e.keyCode == 37){keys.left.key=1;} //37
        if(e.keyCode == 39){keys.right.key=1;} //39
        if(e.keyCode == 17){keys.shoot.key=1;} //17 78
        if(e.keyCode == 18){keys.shield.key=1;} //77

        if(e.keyCode == 87){keys.up.alt=1;} //38
        if(e.keyCode == 83){keys.down.alt=1;} //40
        if(e.keyCode == 65){keys.left.alt=1;} //37
        if(e.keyCode == 68){keys.right.alt=1;} //39
        if(e.keyCode == 78){keys.shoot.alt=1;} //17 78
        if(e.keyCode == 32){keys.shoot.alt2=1;} //17 78
        if(e.keyCode == 77){keys.shield.alt=1;} //77
        if(e.keyCode == 77){keys.shield.alt=1;} //77
    }
    function getKeyUp(e){
        if(e.keyCode == 80){keys.pause=0;}

        if(e.keyCode == 38){keys.up.key=0;} //38
        if(e.keyCode == 40){keys.down.key=0;} //40
        if(e.keyCode == 37){keys.left.key=0;} //37
        if(e.keyCode == 39){keys.right.key=0;} //39
        if(e.keyCode == 17){keys.shoot.key=0;} //17 78
        if(e.keyCode == 18){keys.shield.key=0;} //77

        if(e.keyCode == 87){keys.up.alt=0;} //38
        if(e.keyCode == 83){keys.down.alt=0;} //40
        if(e.keyCode == 65){keys.left.alt=0;} //37
        if(e.keyCode == 68){keys.right.alt=0;} //39
        if(e.keyCode == 78){keys.shoot.alt=0;} //17 78
        if(e.keyCode == 32){keys.shoot.alt2=0;} //17 78
        if(e.keyCode == 77){keys.shield.alt=0;} //77
        if(e.keyCode == 77){keys.shield.alt=0;} //77
        if(e.keyCode == 48){debug=0;}
    }
    function getMouseDown(e){
        keys.shoot.mouse=1;
    }
    function getMouseUp(e){
        keys.shoot.mouse=0;
    }

    document.addEventListener("keydown", getKeyDown);
    document.addEventListener("keyup", getKeyUp); 
    document.addEventListener("mousedown", getMouseDown); 
    document.addEventListener("touchstart", getMouseDown); 
    document.addEventListener("mouseup", getMouseUp); 



    window.onfocus = function () {
        pause=0;
        if (!pauseactive)
        {
            endpause();
        }

    }; //unpause: play playing, delta time=time, pause = 0
	window.onblur = function () {
        pause=1;
        if (!pauseactive){
            startpause();
        }
        
    }; //pause stop playing, pause = 1

    resize();
}


function setStage(){
    if (typeof stage == 'object'){stage.destroy();}
    stage = new PIXI.Container();
    stage.x=(1-screensize)*960;
    stage.y=(1-screensize)*540;
    stage.scale.x=screensize;
    stage.scale.y=screensize;
    

    //create container and add to stage


    background = new PIXI.Container();
    stage.addChild(background);


    backlayer = new PIXI.Container();
    stage.addChild(backlayer);
    container = new PIXI.Container();
    stage.addChild(container);
    particlelayer = new PIXI.ParticleContainer();
    stage.addChild(particlelayer);
    frontlayer = new PIXI.Container();
    stage.addChild(frontlayer);
    textlayer = new PIXI.Container();
    stage.addChild(textlayer);
    
    stage.filters=[
        globalfilters.shockwave,
        globalfilters.twist,
    ];
}
//adjust the canvas to the screen size
function resize()
{

    var width= 1920;
    var height = 1080;

    maxX = width;
    minX = 0;
    maxY = height;
    minY = 0;


    stats.domElement.style.left = "0px";
    stats.domElement.style.top = "0px";

    renderer.resize(width, height);
}


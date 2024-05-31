$(document).ready(onReady)

var invincible=0;
var nobullets=0;  //default: 0
var startstage=0; //default: 0

var stagecount=0; //defalt: 0
var actcount=1; //default: 1

var skipscene=0;
var scene=0; //defalt: 0
var cantdie=0;
var gamepad=1;
var gamepadindex=0;
var screensize=1;
var inputcontrol = getCookie('inputcontrol'); // key, mouse or touch
var hard = 0;
var done = 0;
var idletime = 0;
var aicounter=0;
var aidelete=0;

var hero;

menuposition=[1, 1, 1, 1];
menuselected=[0, 0, 0, 0];

var globalfilters = {
    //pinch: new PIXI.filters.BulgePinchFilter({radius: 1000, strength: -1}),
    twist: new PIXI.filters.TwistFilter({angle: 10, radius: 0, enabled: false, offset: {x: 960, y: 540}}),
    shockwave: new PIXI.filters.ShockwaveFilter({x: 0, y: 0},{speed: 1000, enabled: false, amplitude: 50, wavelength: 200, brightness: 1.5, radius: 1000}),
    adjust: new PIXI.filters.AdjustmentFilter({contrast: 0, enabled: false}),
    motionblur: new PIXI.filters.MotionBlurFilter({x:0, y:99}),
};
globalfilters.motionblur.enabled=false;

var temp={
    plainspeed: 1.0,
    plainzoom: 1.0,
    cloudheight: 0,
    eaglewait: 0,
    scoreskip:0,
};

var settings={
    shadow: true,
    outline: true,
    number: '0.8.8',
    screensize: 100,
    left: 0,
    top: 0,
    ntoenemy: 5,
    }

var remember= //
{
    extend: 0, // how many 1ups where already accounted from score
    laser: 1, //shall the laser recharge animation be shown or not
    control: 0, // controls are activated 0/1
    save: true,
    idle: false,
    wait: 0,
    playing: false,
    menu: 0,
    timer: 0,
    shield: 0,
    scoreattack: false,
    beatexact: 0,
    beatcombo: 0,
    beatlast: 0,
    combovalue: 0,
    combocount: 0,
    shothit: 0,
    lasthit: 0,
    shieldframe: 0,
};

var difficulty={
    extend:2000, //gain a life every xxx points,
    immortaltime: 200, //ticks the player is immortal after being hit
    lifemax: 3, //maximum lifes
    lifeenergy: 0.1, //?
    laserenergy: 1, //?
    lasergain: 0.2, //recharge of laser per idle bullet
    lasertime: 0.0025, //laser recharge per frame
    lasermax: 1, //maximum laser stock
    laserrestock: 0.5, //?
    flashhit: 5, //health lost after a flashing bullet was hit
    idlehit: 10, //health lost after a idle bullet was hit
    autocollect: false, //if false: stars are dropped by enemies to be collected by the player, if true: the score is automatically added
    collectrange: 400, //range stars get attracted by the player
    maxcombocount: 99,
    maxcombovalue: 80,
    number: 2,
    enemy: 2,
    bullets: 2,
    chain: 2,
    general: 2,
    name: 'SERIOUS',
    set: function setdifficulty(value){
        difficulty.number=value;
        difficulty.enemy=value;
        difficulty.bullets=value;
        difficulty.chain=value;
        difficulty.general=value;
        if (value==1){
            difficulty.name='CASUAL';
        }
        else if (value==2){
            difficulty.name='SERIOUS';
        }
        else if (value==3){
            difficulty.name='INSANE';
        }
        else{
            difficulty.name='HYPER '+(value-3);
        }
    }
};



var calc={
    div: function (val) {return 1/Math.sqrt(val);},
    mult: function (val) {return 0.5+0.5*val;}
}

//score
var scores={
    flashbullet: 1, //a bullet while flashing
    idlebullet: 5, // a bullet while NOT flashing 
    laseritem: 5, // unused (laser recharge blue heart)
    lifeitem: 50 // life recover (red heart)
}

//Constants
var width = 1920;
var height = 1080;
var maxX=1920;
var maxY=1080;
var shipspeed=10;
var pi =3.1416;

//Containers
var sprites = [];
var playing = 'nowloading';
var nmusicloaded=0;
var hero;
var tutorialgoals=0;

//Globals
var readytext;
var herox=-500;
var heroy=-500;
var sfxonce='';

//Controls (merged from all devices)
var left=false;
var right=false;
var up=false;
var down=false;
var shoot=false;
var touch=false;
var laser=false;
var debug=false;
var mouse=false;
var pause2=0; //control
var pauseactive=0;
var pausepressed=0; //how long pressed
var pausereleased=0; //
var pausedown=0;
var pausesprite;
var playing;
var heroshift = {x:0, y:0};

//controls for each device seperately
var keys={
    shoot: {
        key: 0,
        alt: 0,
        alt2: 0,
        pad: 0,
        mouse: 0
    },
    shield: {
        key: 0,
        alt: 0,
        pad: 0
    },
    up: {
        key: 0,
        alt: 0,
        pad: 0,
        axis: 0
    },
    down: {
        key: 0,
        alt: 0,
        pad: 0,
        axis: 0
    },
    left: {
        key: 0,
        alt: 0,
        pad: 0,
        axis: 0
    },
    right: {
        key: 0,
        alt: 0,
        pad: 0,
        axis: 0
    },
    pause: 0
}

var pad={
    up: 0,
    down: 0,
    left: 0,
    right: 0,
    shoot: 0,
    shield: 0,
    pause: 0
}

function saveStage(data){
    //on stagestart, on actclear
    // setCookie(name,value,days)
    //saving
    if (remember.save==true && data.trystock>0){
        setCookie('stagecount',data.stagecount,3650);
        setCookie('actcount',data.actcount,3650);
        setCookie('trystock',data.trystock,3650);
        setCookie('scoretotal', scoretotal,3650);
        ctext(100, 50, 'game saved', {});
    }
    else{
            setCookie('stagecount', 1,3650);
            setCookie('actcount', 1,3650);
            setCookie('trystock', 3,3650);
            setCookie('scoretotal', 0,3650);
            ctext(100, 50, 'game saved', {});
    }
}

//on title only
function loadStage(){
    stagecount=getCookie(stagecount);
    actcount=getCookie(actcount);
    trystock=getCookie(trystock);
    scoretotal=getCookie(scoretotal);
}

//set control-values from events etc.
function keycalc(){
    if (inputcontrol == 'mouse'){
        shoot=keys.shoot.mouse;
    }
    else if (inputcontrol == 'touch')
    {
        shoot=0;
        if (renderer.plugins.interaction.eventData.data)
        {
            if (renderer.plugins.interaction.eventData.data.isPrimary){
                touch = 1;
                if ( Math.abs(mouse.x-herox) < 100 && Math.abs(mouse.y-heroy) < 100)
                {
                    if (remember.idle){
                        shoot=1;
                        remember.idle=false;
                    }
                }
                else
                {
                    remember.idle=false;
                }
            }
            else{
                touch = 0;
                remember.idle=true;

            }
        }
    }
    else if (inputcontrol == 'key') {
        //foreach gamepad index if button is pressed or axis is pressed, +key +alt
        shoot=keys.shoot.key+keys.shoot.alt+keys.shoot.alt2+allpads('shield');
        laser=keys.shield.key+keys.shield.alt+keys.shoot.alt2+allpads('shield');
        pause2=keys.pause + allpads('pause');
        up=keys.up.key+keys.up.alt+allpads('up');
        down=keys.down.key+keys.down.alt+allpads('down');
        left=keys.left.key+keys.left.alt+allpads('left');
        right=keys.right.key+keys.right.alt+allpads('right');
    }
    else if (inputcontrol == 'gamepad'){
        shoot=getkey('shield');
        laser=getkey('shield');
        up=getkey('up');
        down=getkey('down');
        left=getkey('left');
        right=getkey('right');
        pause2=getkey('pause');
    }
}

//player's parameters
var score=0;
var scoretotal=0;
if (!getCookie('highscore'+difficulty.general)){
    setCookie('highscore'+difficulty.general,0,3650);
}
var highscore=getCookie('highscore'+difficulty.general, scoretotal,3650) || 0;
var scorestage=0;
var scorecombo=0;
var laserstock=difficulty.lasermax;
var lifestock=2;
var scorelife=0;
var trystock=3;
var scoremaxcombo=25;
var scoretime=0;
var scoretimer=99;
var pause=0;

//Timer
var date = new Date();
var ticks=0.0;
var lastticks=0.0;
var time=date.getTime();
var beat=[0, 0, 0, 0, 0, 0, 0, 0];
var prebeat=[0, 0, 0, 0, 0, 0, 0, 0];
var shotwait=0;

//buffers
var phase=0;
var dead=0;
var time=date.getTime();
var track=0;
var newtime = 0;
var difftime = 0;
var beattime=0;
var beatlayer=0;
var ticks=0;
var pace1=0;
var bgchange=0;
var bgspeedx=0;
var bgspeedy=1;
var bgspeedz=0;
var musictime=0;



   
   

function globalreset(){
    renderer.background.color = 0x000000;
     score=0;
     scorestage=0;
     scorecombo=0;
     laserstock=difficulty.lasermax;
     //lifestock=2;
     scorelife=0;
     scoremaxcombo=25;
     scoretime=0;
     scoretimer=99;
     ticks=0;
     shotwait=0;
     beat=[0, 0, 0, 0];
     phase=0;
     dead=0;

     time=date.getTime();
     track=0;
     newtime = 0;
     difftime = 0;
     beattime=0;
     beatlayer=0;
     ticks=0;
     pace1=0;
     bgchange=0;
     bgspeedx=0;
     bgspeedy=1;
     bgspeedz=0;
     musictime=0;

     stage.alpha=1;
     background.scale.x=1;
    background.scale.y=1;
    background.position.x=0;
    background.position.y=0;

    var temp={
        cloudheight: 0,
        eaglewait: 0,
    };
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

  function log2db(event='none'){
    if (settings.plattform!=='dev'){
        var paras='';
        paras+='user='+user_id;
        paras+='&level='+difficulty.general+stagecount+actcount;//level
        paras+='&type='+event;//type
        paras+='&mode=none';//mode
        paras+='&tries='+trystock;//tries
        paras+='&health='+lifestock;//health
        paras+='&score='+scoretotal;//score
        paras+='&actscore='+score;//actscore
        paras+='&plattform='+settings.plattform;
        paras+='&version='+settings.version;
        paras+='&number='+settings.number;
        console.log("https://log.uhx.ch?"+paras)
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "https://log.uhx.ch?"+paras, true);
        xhttp.send();
    }
  }

  var fn={};

  fn.sethealth = function (health){
    this.health=health;
    this.ohealth=health;
  }

  function cancel_all_bullets()
  {
    for (var f =0; f<sprites.length; f++)
    {
        if (sprites[f].collision=='bullet' && sprites[f].delete==false)
        {
                sprites[f].delete = true;
                particle(sprites[f].x, sprites[f].y,3);
        }
    }
    }


 

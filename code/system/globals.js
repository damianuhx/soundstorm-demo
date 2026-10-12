$(document).ready(onReady)

var invincible=0;
var nobullets=0;  //default: 0
var startstage=0; //default: 0

var stagecount=0; //default: 0
var actcount=1; //default: 1

var skipscene=0;
var scene=0; //defalt: 0
var cantdie=0;
var screensize=1;
var inputcontrol = getCookie('inputcontrol') === 'gamepad' ? 'gamepad' : 'key';
var done = 0;

var menuposition=[1, 1, 1, 1];
var menuselected=[0, 0, 0, 0];

var globalfilters;

function reset_filters(){
    ScreenEffects.resetGlobalFilters();
}

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
    number: '0.8.11',
    ntoenemy: 20,
    flashsize: 2.5,
    preflashrange: 1.5, //time preflash is shown before the actual beat
    preflashradius: 600    
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
    number: 1,
    enemy: 1,
    bullets: 1,
    chain: 1,
    general: 1,
    name: 'CASUAL',
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
        if (typeof highscore !== 'undefined'){
            highscore=Number(getCookie('highscore'+difficulty.general)) || 0;
        }
    }
};
difficulty.set(2);

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
var pause2=0; //control
var pauseactive=0;
var pausepressed=0; //how long pressed
var pausedown=0;
var heroshift = {x:0, y:0};

//controls for each device seperately
var keys={
    shoot: {
        key: 0,
        alt: 0,
        alt2: 0,
        pad: 0,
        touch: 0
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

//set control-values from events etc.
function readTouchPointer(pointerRenderer, fallback){
    var interaction=pointerRenderer && pointerRenderer.plugins && pointerRenderer.plugins.interaction;
    var events=pointerRenderer && pointerRenderer.events;
    var pointerData=(events && events.pointer)
        || (interaction && interaction.pointer)
        || (interaction && interaction.eventData && interaction.eventData.data);
    var point=pointerData && pointerData.global;
    var fallbackPoint=fallback && fallback.global || {x: 960, y: 540};

    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)){
        return {
            global: {
                x: Number.isFinite(fallbackPoint.x) ? fallbackPoint.x : 960,
                y: Number.isFinite(fallbackPoint.y) ? fallbackPoint.y : 540,
            },
            isPrimary: false,
        };
    }

    var released=/^(pointerup|pointercancel|touchend|touchcancel|mouseup)/.test(pointerData.type || "");
    var pressed=!released && (
        Number.isFinite(pointerData.buttons) ? pointerData.buttons > 0
        : Number.isFinite(pointerData.pressure) ? pointerData.pressure > 0
        : pointerData.isPrimary === true
    );
    return {global: {x: point.x, y: point.y}, isPrimary: pressed};
}

function keycalc(){
    if (inputcontrol == 'touch')
    {
        shoot=0;
        var pointerData=typeof ReplaySystem !== "undefined"
            ? ReplaySystem.currentPointerData()
            : readTouchPointer(typeof renderer !== "undefined" ? renderer : null);
        if (pointerData)
        {
            var touchPoint=pointerData.global;
            if (pointerData.isPrimary){
                touch = 1;
                if (Math.abs(touchPoint.x-herox) < 100 && Math.abs(touchPoint.y-heroy) < 100)
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
        keys.shoot.touch=0;
    }
    else if (inputcontrol == 'key' || inputcontrol == 'gamepad') {
        var gamepadInput=inputcontrol == 'gamepad' ? getkey : allpads;
        var gamepadShield=gamepadInput('shield');
        var gamepadPause=gamepadInput('pause');
        var gamepadUp=gamepadInput('up');
        var gamepadDown=gamepadInput('down');
        var gamepadLeft=gamepadInput('left');
        var gamepadRight=gamepadInput('right');

        // Keyboard and gamepad stay active together. The title-page selector
        // only chooses between the standard and custom gamepad mappings.
        shoot=keys.shoot.key+keys.shoot.alt+keys.shoot.alt2
            +gamepadShield;
        laser=keys.shield.key+keys.shield.alt+keys.shoot.alt2
            +gamepadShield;
        pause2=keys.pause+gamepadPause;
        up=keys.up.key+keys.up.alt+gamepadUp;
        down=keys.down.key+keys.down.alt+gamepadDown;
        left=keys.left.key+keys.left.alt+gamepadLeft;
        right=keys.right.key+keys.right.alt+gamepadRight;
    }
}

//player's parameters
var score=0;
var scoretotal=0;
if (!getCookie('highscore'+difficulty.general)){
    setCookie('highscore'+difficulty.general,0,3650);
}
var highscore=getCookie('highscore'+difficulty.general, scoretotal,3650) || 0;
var laserstock=difficulty.lasermax;
var lifestock=2;
var trystock=3;
var scoretimer=99;
var pause=0;

//Timer
var ticks=0.0;
var beat=[0, 0, 0, 0, 0, 0, 0, 0]; //beat strength fopr flashing bullets
var prebeat=[0, 0, 0, 0, 0, 0, 0, 0]; //indicators before the beat
var soundbeat=[0, 0, 0, 0, 0, 0, 0, 0]; //sounds played by beatgenerator, 0 = no sound
var prebeat2=[[],[],[],[],[],[],[],[],[]];
//buffers
var dead=0;
var difftime = 1000 / 60;
var beatlayer=0;
var pace1=0;
var bgchange=0;
var bgspeedx=0;
var bgspeedy=1;
var musictime=0;



   
   

function globalreset(){
    renderer.background.color = 0x000000;
    SoundStorm.reset.act();

    stage.alpha=1;
    background.scale.x=1;
    background.scale.y=1;
    background.position.x=0;
    background.position.y=0;

    reset_filters();
}

  var anonymousGameId='';
  var localPlayCount=0;
  var localPlayCountCookie='soundstorm_games_played';

  function createAnonymousGameId(){
    var values=new Uint32Array(4);
    if (window.crypto && typeof(window.crypto.getRandomValues)==='function'){
      window.crypto.getRandomValues(values);
    }
    else{
      for (var i=0; i<values.length; i++){
        values[i]=Math.floor(Math.random()*4294967296)>>>0;
      }
    }
    return Array.from(values, function(value){
      return value.toString(16).padStart(8, '0');
    }).join('');
  }

  function beginAnonymousGameSession(){
    if (anonymousGameId){
      if (
        typeof ReplaySystem!=="undefined"
        && typeof ReplaySystem.attachAnonymousSession==="function"
      ){
        ReplaySystem.attachAnonymousSession(anonymousGameId, localPlayCount);
      }
      return anonymousGameId;
    }
    anonymousGameId=createAnonymousGameId();
    var savedCount=getCookie(localPlayCountCookie);
    var parsedCount=/^\d+$/.test(savedCount || '') ? Number(savedCount) : 0;
    if (!Number.isSafeInteger(parsedCount) || parsedCount<0){
      parsedCount=0;
    }
    localPlayCount=Math.min(parsedCount+1, Number.MAX_SAFE_INTEGER);
    setCookie(localPlayCountCookie, localPlayCount, 3650);
    if (
      typeof ReplaySystem!=="undefined"
      && typeof ReplaySystem.attachAnonymousSession==="function"
    ){
      ReplaySystem.attachAnonymousSession(anonymousGameId, localPlayCount);
    }
    return anonymousGameId;
  }

  function clearAnonymousGameSession(){
    anonymousGameId='';
    localPlayCount=0;
  }

  function currentAnonymousGameId(){
    return anonymousGameId || beginAnonymousGameSession();
  }

  function currentLocalPlayCount(){
    if (!anonymousGameId){
      beginAnonymousGameSession();
    }
    return localPlayCount;
  }

  function activityLogEndpoint(){
    var base=String(window.SOUNDSTORM_LOG_ENDPOINT || 'https://log.uhx.ch/api/v2');
    return base.replace(/\/+$/, '')+'/activity.php';
  }

  function log2db(event='none'){
    if (settings.plattform!=='dev'){
        var paras='';
        paras+='game='+encodeURIComponent(currentAnonymousGameId());
        paras+='&local_play_count='+currentLocalPlayCount();
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
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", activityLogEndpoint()+"?"+paras, true);
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


 

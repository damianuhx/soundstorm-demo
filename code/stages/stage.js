

function count(){
    pace1++;
}

var automationMusicTime = 0;
var automationMusicTrack = null;
var automationMusicPlaying = false;
var automationMusicPlaybackStates = new WeakMap();

function trackAutomationMusicPlayback(track)
{
    var state = automationMusicPlaybackStates.get(track);
    if (state){return state;}

    state = {
        intendedPlaying: track.playing(),
        paused: false,
        pendingStart: false,
        resuming: false,
        startSeek: 0,
        managed: false,
    };
    automationMusicPlaybackStates.set(track, state);
    ['play', 'stop', 'pause'].forEach(function (method) {
        var original = track[method];
        if (typeof original !== 'function'){return;}
        state.managed = true;
        track[method] = function () {
            // Howler uses the second argument for silent internal operations:
            // HTML5 natural endings stop(id, true), and seek/loop can pause
            // and restart internally. These are not game playback commands.
            if (arguments[1] !== true){
                if (method === 'play'){
                    if (!state.intendedPlaying){
                        state.resuming = state.paused;
                        state.pendingStart = !state.paused;
                        var seek = Number(track.seek());
                        state.startSeek = Number.isFinite(seek) ? seek : 0;
                    }
                    state.intendedPlaying = true;
                    state.paused = false;
                }
                else{
                    state.intendedPlaying = false;
                    state.paused = method === 'pause';
                    state.pendingStart = false;
                    state.resuming = false;
                }
            }
            return original.apply(this, arguments);
        };
    });
    return state;
}

// Install before the first game play/stop call, so even an audio ending
// between simulation steps cannot erase the intended playback state.
function installAutomationMusicPlaybackTracking()
{
    if (window.SOUNDSTORM_AUTOMATION !== true || typeof music !== 'object'){
        return;
    }
    Object.keys(music).forEach(function (name) {
        if (music[name] && typeof music[name].playing === 'function'){
            trackAutomationMusicPlayback(music[name]);
        }
    });
}
installAutomationMusicPlaybackTracking();

function syncAutomationMusicTime()
{
    if (window.SOUNDSTORM_AUTOMATION !== true || typeof(music[playing])!=='object'){
        return;
    }

    var observedSeek = Number(music[playing].seek());
    automationMusicTime = Number.isFinite(observedSeek) ? observedSeek : 0;
    automationMusicTrack = playing;
    var state = trackAutomationMusicPlayback(music[playing]);
    automationMusicPlaying = state.managed ? state.intendedPlaying : music[playing].playing();
    state.pendingStart = false;
    state.resuming = false;
}

function getCurrentMusicTime(dtSeconds)
{
    if (typeof(music[playing])!=='object'){
        return 0;
    }

    var replayMusicTime = typeof ReplaySystem !== "undefined"
        ? ReplaySystem.playbackMusicTime()
        : null;
    if (replayMusicTime !== null){
        return replayMusicTime;
    }

    var observedSeek = Number(music[playing].seek());
    if (window.SOUNDSTORM_AUTOMATION !== true){
        return Number.isFinite(observedSeek) ? observedSeek : 0;
    }

    var state = trackAutomationMusicPlayback(music[playing]);
    var isMusicPlaying = state.managed ? state.intendedPlaying : music[playing].playing();
    if (automationMusicTrack !== playing || state.pendingStart || (!automationMusicPlaying && isMusicPlaying && !state.resuming)){
        var startSeek = state.pendingStart ? state.startSeek : observedSeek;
        automationMusicTime = Number.isFinite(startSeek) ? startSeek : 0;
    }
    state.pendingStart = false;
    state.resuming = false;

    automationMusicTrack = playing;
    automationMusicPlaying = isMusicPlaying;

    if (!isMusicPlaying){
        if (!state.paused){
            automationMusicTime = Number.isFinite(observedSeek) ? observedSeek : 0;
        }
        return automationMusicTime;
    }

    automationMusicTime += dtSeconds;

    var duration = typeof music[playing].duration === "function"
        ? Number(music[playing].duration())
        : 0;
    if (Number.isFinite(duration) && duration > 0 && automationMusicTime >= duration){
        if (typeof music[playing].loop === "function" && music[playing].loop() === true){
            automationMusicTime %= duration;
        }
        else{
            music[playing].stop();
            automationMusicTime = 0;
            automationMusicPlaying = false;
        }
    }

    return automationMusicTime;
}

function updateShockwave()
{
    globalfilters.shockwave.time = (globalfilters.shockwave.time >= 1 )
        ? 0
        : globalfilters.shockwave.time + 0.015;

    if (globalfilters.shockwave.enabled && globalfilters.shockwave.time>=0.06){
        globalfilters.shockwave.amplitude-=3;
        globalfilters.shockwave.brightness-=0.03;
        if (globalfilters.shockwave.brightness<=1.0){
            globalfilters.shockwave.enabled=false;
        }
    }
}

function isWebDemoFinished()
{
    return settings.version === 'demo' && settings.plattform === 'web'
        && stagecount === -1 && play === false;
}

function timer(dtSeconds)
{
    if (isWebDemoFinished()){return;}
    count();
    ticks++;
    updateShockwave();
    
    //generate beats of playing music
    musictime = 0;
    if (typeof(music[playing])=='object'){
        musictime = getCurrentMusicTime(dtSeconds);
        beatgenerator(musictime, playing)
    }

    if (laserstock<=difficulty.lasermax)
    {
        if (settings.sword==1){
            laserstock+=difficulty.lasertime;
        }
        else{
            laserstock+=difficulty.lasertime*4;
        }
        if (remember.laser<1 && laserstock>=1)
        {
            set.laserrecharged();
        }
    }


    if (dead>0){
        dead++;
        if (dead==100){
            sfx.play('tryover');
        }
        if (dead>150){
            stage.alpha-=0.005;
        }
        if (dead>400){
            
            log2db('died');
            clear_sprites();
            scene=1;
            lifestock=2;
            if (remember.scoreattack){
                renderer.background.color = 0x000000;
                dead=0;
                resettime();
                stage.alpha=1;
                stagecount=0;
                scene=8;
                actcount=0;
            }
            if (trystock<=0){
                renderer.background.color = 0x000000;
                dead=0;
                resettime();
                stage.alpha=1;
                stagecount=6;
                actcount=0;
            }
        }
    }

    /*special hacks for individual stages*/
    //bg pulse first boss
    if (stagecount == 1 && scene>19 /*&& scene<22*/){
        ai.bgpulse.call(background, 5, 3, 4);
    }
    //blur zoom on second boss
    else if (stagecount == 2 && scene >= 14){
        globalfilters.adjust.contrast = 1;
        globalfilters.adjust.red = 1 ;
        globalfilters.adjust.blue =1 + 2 * beat[1];
        globalfilters.adjust.green = 1 ;
        if (beat[1]<=0){
            globalfilters.adjust.enabled=false;
        }
        else {
            globalfilters.adjust.enabled=true;
        }  
        ai.bgpulse.call(background, 5, 1, 1.25);
        //flash bue
    }
    //zoomblur on stage 3
    else if (stagecount == 3 && scene>=11 && musictime>7.78){
        globalfilters.zoomblur.enabled = (beat[2]+beat[1]>0);
        globalfilters.zoomblur.strength = 0.1 * (-beat[2]+beat[1])*music[playing]._volume;;
        globalfilters.zoomblur.center.x=herox;
        globalfilters.zoomblur.center.y=heroy;

        globalfilters.adjust.contrast = 1;
        globalfilters.adjust.red = 1 + (beat[2]/4 + beat[1]/4)*music[playing]._volume;
        globalfilters.adjust.green = 1  + (beat[1]/4)*music[playing]._volume;
        globalfilters.adjust.blue =1 ;
        if (beat[1]<=0){
            globalfilters.adjust.enabled=true;
        }
        else {
            globalfilters.adjust.enabled=true;
        }  
        
    }
    /** */

    if (scene < 99 && dead<=0){
        if (stage.alpha<1.0){
            stage.alpha+=0.01;   
        }
        if (globalfilters.twist.radius>0){
            globalfilters.twist.radius-=10;
            globalfilters.twist.angle-=0.1;
        }
        else{
            globalfilters.twist.enabled=false;
        }
        
    }
    
    if (scene>=100 && dead==0)
    {
        if (stage.alpha<=0){
            scene=113;
        }
        if (scene==110)
        {
            ticks=0;
            music[playing].fade(1, 0, 6000);
            scene++;
            set.bonustext(300, true);
            }

        if (scene==111)
        {   
            
            if (ticks>500)  
            {
                ticks=0;
                scene++;
            }
        }
        if (scene == 112){
            stage.alpha-=0.01;
            if (ticks>100)
            {
                scene++;
            }
        }
        else if (scene==113){
            clear_sprites();
            ticks=0;
            stagecount++;
            actcount=1;
            scene=1;
        }
        
    }
    else if (scene==0){
        if (done==0){updateloading(nmusicloaded+ (ntextures || 0));}
        if ((play==true) && nmusicloaded+ntextures>=ntexmax+nmusicloadmax){
            done=0;
            ticks=0;
            document.getElementById("settings").remove();
            scene++;
        }
    }
    else {
        StageRegistry.run(stagecount);
    }
    if((stagecount==6 || (stagecount>=2 && settings.version=='demo')) && play)
    {
        if (stage.alpha<1.0){
            stage.alpha+=0.01;   
        }
        if (globalfilters.twist.radius>0){
            globalfilters.twist.radius-=10;
            globalfilters.twist.angle-=0.1;
        }
        else{
            globalfilters.twist.enabled=false;
        }

        if (trystock>0 && settings.version!=='demo' && settings.version!=='test'){
            ending();
        }
        else if (settings.version=='demo' && settings.plattform=='web')
        {
            play=false;
            if (music[playing] && typeof music[playing].stop === 'function'){
                music[playing].stop();
            }
            closeFullscreen();
            stagecount=-1;
            document.getElementById('demoend').style.display='block';
            canvas[0].style.display = "none";
        }
        else{
            gameover();
        }
    }
    
    else if (stagecount>6){
        stagecount=0;
        startstage=1;
        totalscore=0;
        trystock=3;
        
    }
    
}

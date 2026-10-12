
var pauseOverlay = {
    frame: null,
    title: null,
    help: null
};

function startpause(){
    if (music[playing].playing()){
        music[playing].pause();
        remember.playing=true;
    }
}

function endpause(){
    if (remember.playing){
        music[playing].play();
        remember.playing=false;
    }
}

function allai(){
//sprites ai
    remember.wait--;
    if (remember.combovalue>0){
        remember.combovalue-=0.2;
    }
    else{
        remember.combocount=0;
    }
    if (remember.combovalue>10){
        remember.combovalue-=(remember.combovalue-10)*0.01;
    }
    
    for (var i = 0; i < sprites.length; i++)
    {
        if (sprites[i].visible==true)
        {
            for (var j = 0; j < sprites[i].ai[0].length; j++)
            {
                sprites[i].ai[0][j]();
            }
            var currentPhase=sprites[i].phase || 0;
            if (sprites[i].phase>0)
            {
                for (var j = 0; j < sprites[i].ai[currentPhase].length; j++)
                {
                    sprites[i].ai[currentPhase][j]();
                }
            }
        }
        else
        {
            if (sprites[i].active<=ticks)
            {
                sprites[i].visible=true;
            }
        }
    }
}

function flushQueuedSoundEffect() {
    if (sfxonce !== ''){
        sfx.play(sfxonce);
        sfxonce='';
    }
}

function updateBeatJudgement() {
    if (remember.beatlast>0){
        remember.beatlast--;
        return;
    }

    if (remember.beatexact>0.7){
        if (remember.combocount<difficulty.maxcombocount){
            remember.combocount++;
        }
        if (remember.combocount!==difficulty.maxcombocount){
            let yay = sfx.play('yay0');
            sfx.rate(0.5+remember.combocount/20, yay);
            sfx.volume(0.6+remember.combocount/30, yay);
        }
        else{
            sfx.play('yay1');
        }

        if (remember.combocount>0){
            ctext(herox, heroy+40, 'COMBO +'+remember.combocount, {speedY: -1});
        }
        score+=remember.combocount;
    }

    if (remember.beatexact<0.4 && remember.shieldframe){
        remember.combocount=0;
        remember.combovalue=0;
    }

    if (remember.beatexact>0.99){
        ctext(herox, heroy, 'PERFECT', {speedY: -1, color:{x: 100, y: 255, z:100}});
        remember.beatlast=30;
        remember.beatexact=0;
    }
    else if (remember.beatexact>0.7){
        ctext(herox, heroy, 'PERFECT', {speedY: -1, color:{x: 100, y: 255, z:100}});
        remember.beatlast=30;
        remember.beatexact=0;
    }
    else if (remember.beatexact>=0.4){
        ctext(herox, heroy, 'OKAY', {speedY: -1, color:{x: 255, y: 255, z:100}});
        remember.beatlast=30;
        remember.beatexact=0;
    }
    else if (remember.beatexact>0.01){
        sfx.play('miss2');
        ctext(herox, heroy, 'BAD', {speedY: -1, color:{x: 255, y: 100, z:100}});
        remember.beatlast=30;
        remember.beatexact=0;
    }
    remember.shieldframe=false;
}

function removePauseOverlay() {
    if (pauseOverlay.title === null){
        return;
    }

    frontlayer.removeChild(pauseOverlay.title);
    pauseOverlay.title.destroy();
    frontlayer.removeChild(pauseOverlay.help);
    pauseOverlay.help.destroy();
    frontlayer.removeChild(pauseOverlay.frame);
    pauseOverlay.frame.destroy();
    pauseOverlay.frame = null;
    pauseOverlay.title = null;
    pauseOverlay.help = null;
}

function createPauseOverlay() {
    pauseOverlay.frame = new PIXI.Sprite(tex.frame);
    pauseOverlay.frame.x=960-pauseOverlay.frame.width*0.8/2;
    pauseOverlay.frame.y=620-pauseOverlay.frame.height*0.7/2;
    pauseOverlay.frame.scale.y=0.7;
    pauseOverlay.frame.scale.x=0.8;
    pauseOverlay.frame.alpha=0.6;
    frontlayer.addChild(pauseOverlay.frame);

    pauseOverlay.title = new PIXI.BitmapText('PAUSE', {
        fontName: "inline",
        anchor: (0.5,0.5),
        textAlign: 'center',
        fontSize: 200,
    });
    pauseOverlay.title.x=960-pauseOverlay.title.width/2;
    pauseOverlay.title.y=540-pauseOverlay.title.height/2;
    frontlayer.addChild(pauseOverlay.title);

    pauseOverlay.help = new PIXI.BitmapText('HOLD PAUSE TO EXIT', {
        fontName: "solid",
        anchor: (0.5,0.5),
        textAlign: 'center',
        fontSize: 50,
    });
    pauseOverlay.help.x=960-pauseOverlay.help.width/2;
    pauseOverlay.help.y=700-pauseOverlay.help.height/2;
    frontlayer.addChild(pauseOverlay.help);
}

function updatePauseState() {
    if (pause2){
        pausepressed++;
    }
    if (pausepressed>100){
        reset();
        pauseactive=0;
        pausepressed=0;
        if (remember.scoreattack){
            renderer.background.color = 0x000000;

            resettime();
            stage.alpha=1;
            stagecount=0;
            scene=8;
            actcount=0;
        }
    }

    if (pauseactive){
        if (!pause2){
            pausepressed=0;
            pausedown=1;
        }
        else if (pausedown && pause2){
            pauseactive=0;
            pausepressed=0;
            pausedown=1;
            endpause();
            removePauseOverlay();
        }
    }
    else if (pause2 && !pauseactive && !pausedown && ((stagecount && scene>10) || scene>13)){
        startpause();
        createPauseOverlay();
        pauseactive=1;
    }
}

function finishSimulationInput() {
    keys.shoot.touch = 0;
    remember.shield=0;
    remember.shothit=0;
}

function simulateGameStep(dtSeconds) {
    if (isWebDemoFinished()){
        return;
    }
    EntityManager.expireStepVisuals(sprites);
    difftime = dtSeconds * 1000;

    if (play && !ReplaySystem.isPlayback()){
        keycalc();
    }

    if (!ReplaySystem.beginSimulationStep()){
        return;
    }

    flushQueuedSoundEffect();
    updateBeatJudgement();
    updatePauseState();

    if (!pause && !pauseactive){
        if(!pause2){
            pausedown=0;
        }

        timer(dtSeconds);
        if (!isWebDemoFinished()){
            invincible--;
            allai(dtSeconds);
        }
    }

    finishSimulationInput();
    ReplaySystem.endSimulationStep();
}

function renderGameFrame() {
    stats.begin();
    renderer.render(stage);
    stats.end();
}

function cleanupDeletedSprites() {
    EntityManager.flushDeleted(sprites);
}

var droppedSimulationMs = 0;
var gameClock = new FixedStepClock({
    manual: window.SOUNDSTORM_AUTOMATION === true,
    stepMs: 1000 / 60,
    maxFrameDeltaMs: 250,
    maxCatchUpSteps: 8,
    onStep: simulateGameStep,
    onRender: renderGameFrame,
    onInterStepCleanup: cleanupDeletedSprites,
    onAfterRender: cleanupDeletedSprites,
    onDroppedTime: function rememberDroppedTime(milliseconds) {
        droppedSimulationMs += milliseconds;
    },
});

function startGameLoop() {
    gameClock.start();
}

function clear_sprites(stage)
{
    EntityManager.clear(sprites);
    music[playing].stop();
    ScreenEffects.clearBacklayer(backlayer);
    if (!stage){
        setStage();
    }
}

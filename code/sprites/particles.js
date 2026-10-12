//clouds 

function fadeBulletBeatFlashf(speed) {
    this.alpha /= speed;
    if (this.alpha <= 0.01) {
        this.delete = true;
    }
}

set.beatparticle = function (pic, chance, beatlayer, options)
{
    //options: 
    // basecolor || (0,0,0)
    // speed (* globalspeed) || 1
    // speed random: random offset of speed || 0.1
    // position offset by beat || 0
    // zoom || 2
    //invert

    if (random(100)<=chance){
        var sprite=setsprite(
            new PIXI.Sprite(pic),
            {layer: options.layer || 'backlayer', anchor: true, active: 0, x: Math.random()*1920, y: 0});
            
        sprite.speedX= options.speedX || 0;
        if (typeof options.speedYrandom == 'undefined' ){
            sprite.speedY= (options.speedY || 2) + (3) * Math.random();
        }
        else{
            sprite.speedY= (options.speedY || 0) + (options.speedYrandom) * Math.random();
        }
        
        sprite.baseX=options.x || Math.random()*1920;
        sprite.baseY=options.y || 0;
        sprite.ai=[[]];
        sprite.alpha=options.alpha || 0.2;
        sprite.beatlayer = beatlayer;
        sprite.alpha= options.alpha || 0.2;
        sprite.basecolor= options.basecolor || {x: 0, y: 0, z: 0};
        sprite.excolor={x: 255, y: 255, z: 255};
        sprite.bright = 0.7 || options.bright;
        sprite.size=options.size || 1;
        if (typeof options.grow !== 'undefined')
            {
            sprite.grow=options.grow;
            }
            else{
                sprite.grow=2;
            }
        if (typeof options.rotspeed !== 'undefined'){sprite.rotspeed=options.rotspeed} else {sprite.rotspeed = 0.01}

        sprite.excolor=bcolor(beatlayer);
        //sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(offborderf.bind(sprite, sprite.width));
        sprite.ai[0].push(function(){
            this.rotation+=this.rotspeed;
            this.tint=rgbToHex(
                this.basecolor.x + this.bright*((255-this.basecolor.x)/255)*this.excolor.x*(/*prebeat[this.beatlayer]+*/beat[this.beatlayer]), 
                this.basecolor.y + this.bright*((255-this.basecolor.y)/255)*this.excolor.y*(/*prebeat[this.beatlayer]+*/beat[this.beatlayer]), 
                this.basecolor.z + this.bright*((255-this.basecolor.z)/255)*this.excolor.z*(/*prebeat[this.beatlayer]+*/beat[this.beatlayer])
            );
            this.baseY+=this.speedY;
            this.baseX+=this.speedX;
            //this.tint=rgbToHex(0, 0, 0);
            this.x=this.baseX;// - 30*beat[0];
            this.y=this.baseY; // + 10*beat[0]*this.speedY;
            //this.alpha = 0.3*beat[this.beatlayer]+0.1*prebeat[this.beatlayer]+0.1;
            this.scale.x = this.size*(1+this.grow*beat[this.beatlayer]);
            this.scale.y = this.size*(1+this.grow*beat[this.beatlayer]);

            //if hit make it even bigger
            
        }.bind(sprite));
    }
}


set.bulletbeatflash = function (x, y, options){
    var sprite=setsprite(
        new PIXI.Sprite(tLaser[Math.floor(Math.random()*5)]),
        {layer: 'sprite', anchor: true, active: 0, x: x, y: y});

    sprite.ai=[[]];
    
    //color
    //
    sprite.blendMode=PIXI.BLEND_MODES.ADD;
    sprite.alpha=options.alpha || 0.2;
    sprite.scale.x=options.scale || 0.95/Math.sqrt(difficulty.chain);;
    sprite.scale.y=options.scale || 0.95/Math.sqrt(difficulty.chain);;

    sprite.speedX=options.speedX || 0;
    sprite.speedY=options.speedY || 0;
    sprite.speedX2=options.speedX || 0;
    sprite.speedY2=options.speedY || 0;

    sprite.beatlayer = options.beatlayer || 0;

    sprite.tint=rgbToHex(options.color.x, options.color.y, options.color.z);
    sprite.color=options.color || {x: 255, y: 255, z: 255};
    sprite.color.x*=Math.random()*0.05+0.95;
    sprite.color.y*=Math.random()*0.05+0.95;
    sprite.color.z*=Math.random()*0.05+0.95;

    sprite.ai[0].push(fadeBulletBeatFlashf.bind(
        sprite,
        options.fadeSpeed || 1.05
    ));
    sprite.ai[0].push(function(){
        if (options.shrink){
            sprite.scale.x /= 1.005;
            sprite.scale.y /= 1.005;
        }
        else{
            sprite.scale.x *= 1.005;
            sprite.scale.y *= 1.005;
        }
        
    }.bind(sprite));
    sprite.ai[0].push(movef.bind(sprite));
}


set.bulletcast = function (position, angle, options)
{
        
        for (let i = 0; i<10; i++)
        {
            let sprite=setsprite(
                new PIXI.Sprite(tex.p1),
                {
                    layer: 'particle', 
                    anchor: true, 
                    active: 0, 
                    x: position.x, y: position.y,
                    speedX: Math.cos(angle+i/5-1)*(2+Math.random()*1.5), speedY:Math.sin(angle+i/5-1)*(2+Math.random()*1.5),
                    
                }
            );
    
        sprite.tint = rgbToHex(options.color.x, options.color.y, options.color.z);
        sprite.alpha=0.6;
        sprite.ai=[[],[],[],[],[]];
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(function () {
            this.alpha-=0.02;
            if (this.alpha<=0){
                this.delete=true;
            }
        }.bind(sprite));
        }

       

}

function scoreStarSchedule(track, startTime) {
    var epsilon = 0.000001;
    var launchAt = nextBeatParticlePeak(track, startTime + epsilon);

    if (launchAt === null) {
        launchAt = startTime + 0.5;
    }

    var arriveAt = nextBeatParticlePeak(track, launchAt + epsilon);
    if (arriveAt === null) {
        arriveAt = launchAt + 0.5;
    }

    return {
        launchAt: launchAt,
        arriveAt: arriveAt,
    };
}

function scoreStarCurrentFrame() {
    if (
        typeof gameClock !== 'undefined'
        && Number.isFinite(gameClock.simulationFrame)
    ) {
        return gameClock.simulationFrame;
    }
    return typeof ticks === 'undefined' ? 0 : ticks;
}

function updateScoreStarf() {
    var time = typeof musictime === 'undefined'
        ? this.collectedAt
        : musictime;
    var currentFrame = scoreStarCurrentFrame();

    if (this.arrived) {
        if (currentFrame !== this.scoreStarArrivalFrame) {
            this.delete = true;
        }
        return;
    }

    if (!this.launched) {
        if (!beatParticlePulseReached(time, this.schedule.launchAt)) {
            var waitingAge = Math.max(0, time - this.collectedAt);
            var waitingPulse = 1 + 0.04 * Math.sin(waitingAge * 12);
            this.scale.x = this.baseScaleX * waitingPulse;
            this.scale.y = this.baseScaleY * waitingPulse;
            this.alpha = 0.65;
            return;
        }

        this.launched = true;
        this.scoreStarLaunchFrame = currentFrame;
        this.scoreStarLaunchTime = time;
        this.launchX = this.x;
        this.launchY = this.y;
        this.alpha = 1;
        this.scale.x = this.baseScaleX * 1.32;
        this.scale.y = this.baseScaleY * 1.32;
    }

    if (beatParticlePulseReached(time, this.schedule.arriveAt)) {
        this.x = this.targetX;
        this.y = this.targetY;
        this.alpha = 1;
        this.scale.x = this.baseScaleX;
        this.scale.y = this.baseScaleY;
        score += this.scoreadd;
        this.arrived = true;
        this.scoreStarArrivalFrame = currentFrame;
        this.scoreStarArrivalTime = time;
        return;
    }

    var duration = Math.max(
        0.000001,
        this.schedule.arriveAt - this.schedule.launchAt
    );
    var progress = clampBeatParticleProgress(
        (time - this.schedule.launchAt) / duration
    );

    this.x = this.launchX + (this.targetX - this.launchX) * progress;
    this.y = this.launchY + (this.targetY - this.launchY) * progress;
    this.alpha = 0.72 + 0.28 * progress;
    this.scale.x = this.baseScaleX * (1 + 0.32 * (1 - progress));
    this.scale.y = this.baseScaleY * (1 + 0.32 * (1 - progress));
}

set.toscore = function (x, y, options){
    options = options || {};
    var scoreValue = options.score || 1;
    var collectedAt = typeof musictime === 'undefined' ? 0 : musictime;
    var track = typeof playing === 'undefined' ? null : playing;
    var schedule = scoreStarSchedule(track, collectedAt);
    var sprite=setsprite(
        new PIXI.BitmapText('+'+scoreValue, {
        fontName: "small",
        anchor: (0.5,0.5),
        textAlign: 'right',
        fontSize: 20+(20*Math.sqrt(scoreValue)),
        letterSpacing: 0,
    }),
        {
            anchor: true,
            active: 0,
            x: x,
            y: y,
            entityType: 'scoreStar',
        }
    );
    sprite.ai=[[],[],[],[],[]];
    sprite.scoreadd = scoreValue;
    sprite.alpha=0.65;
    sprite.collectedAt = collectedAt;
    sprite.scoreStarTrack = track;
    sprite.schedule = schedule;
    sprite.scoreStarWave = String(track || '') + ':' + schedule.launchAt.toFixed(6);
    sprite.launched = false;
    sprite.arrived = false;
    sprite.launchX = x;
    sprite.launchY = y;
    sprite.targetX = options.targetX === undefined ? 1850 : options.targetX;
    sprite.targetY = options.targetY === undefined ? 50 : options.targetY;
    sprite.baseScaleX = sprite.scale.x;
    sprite.baseScaleY = sprite.scale.y;
    if (remember.combovalue>0){remember.combovalue+=scoreValue;}
    sprite.ai[0].push(updateScoreStarf.bind(sprite));

    frontlayer.addChild(sprite);
    return sprite;
}


var beatParticlePercussionPalettes = Object.freeze({
    default: {
        explode: {name: 'drum3', volume: 0.48, rate: 1},
        launch: {name: 'laser', volume: 0.64, rate: 2.5},
        impact: {name: 'kick1', volume: 0.24, rate: 0.98},
    },
    tutorial: {
        explode: {name: 'drum2', volume: 0.44, rate: 1},
        launch: {name: 'laser', volume: 0.56, rate: 2.4},
        impact: {name: 'kick1', volume: 0.21, rate: 1.04},
    },
    greengrass: {
        explode: {name: 'drum2', volume: 0.46, rate: 0.96},
        launch: {name: 'laser', volume: 0.62, rate: 2.45},
        impact: {name: 'kick1', volume: 0.24, rate: 1},
    },
    scarybeat: {
        explode: {name: 'drum4', volume: 0.5, rate: 0.86},
        launch: {name: 'laser', volume: 0.66, rate: 2.15},
        impact: {name: 'kick1', volume: 0.25, rate: 0.92},
    },
    spacespeed: {
        explode: {name: 'drum4', volume: 0.48, rate: 1.08},
        launch: {name: 'laser', volume: 0.68, rate: 2.85},
        impact: {name: 'kick1', volume: 0.23, rate: 1.08},
    },
    alien: {
        explode: {name: 'drum3', volume: 0.5, rate: 0.82},
        launch: {name: 'laser', volume: 0.64, rate: 2.55},
        impact: {name: 'kick1', volume: 0.25, rate: 0.94},
    },
    cokecity: {
        explode: {name: 'drum4', volume: 0.48, rate: 0.96},
        launch: {name: 'laser', volume: 0.62, rate: 2.65},
        impact: {name: 'kick1', volume: 0.25, rate: 0.98},
    },
    jamesbond: {
        explode: {name: 'drum3', volume: 0.48, rate: 0.9},
        launch: {name: 'laser', volume: 0.62, rate: 2.4},
        impact: {name: 'kick1', volume: 0.25, rate: 0.94},
    },
    freeflight: {
        explode: {name: 'drum2', volume: 0.46, rate: 1.08},
        launch: {name: 'laser', volume: 0.64, rate: 2.75},
        impact: {name: 'kick1', volume: 0.23, rate: 1.05},
    },
    blendedbrain: {
        explode: {name: 'drum3', volume: 0.5, rate: 0.78},
        launch: {name: 'laser', volume: 0.66, rate: 2.3},
        impact: {name: 'kick1', volume: 0.26, rate: 0.9},
    },
    face1: {
        explode: {name: 'drum1', volume: 0.52, rate: 0.76},
        launch: {name: 'laser', volume: 0.64, rate: 2.2},
        impact: {name: 'kick1', volume: 0.27, rate: 0.86},
    },
    face2: {
        explode: {name: 'drum3', volume: 0.52, rate: 0.74},
        launch: {name: 'laser', volume: 0.66, rate: 2.55},
        impact: {name: 'kick1', volume: 0.27, rate: 0.88},
    },
});

set.beatParticlePercussionPalettes = beatParticlePercussionPalettes;

var beatParticleChainSerial = 0;

set.createBeatParticleChain = function createBeatParticleChain(track) {
    beatParticleChainSerial++;
    return {
        id: beatParticleChainSerial,
        rhythmTrack: track,
        playedCues: {
            explode: false,
            launch: false,
            impact: false,
        },
        soundIds: {
            explode: null,
            launch: null,
            impact: null,
        },
        stoppedCues: {
            launch: false,
        },
    };
};

var beatParticleCueSteps = {
    explode: null,
    launch: null,
    impact: null,
};

function currentBeatParticleStep() {
    if (
        typeof gameClock !== 'undefined'
        && Number.isFinite(gameClock.simulationFrame)
    ) {
        return gameClock.simulationFrame;
    }
    return ticks;
}

function playBeatParticleCue(phase, track, chain) {
    if (chain && chain.playedCues) {
        if (chain.playedCues[phase]) {
            return null;
        }
        chain.playedCues[phase] = true;
    }
    else {
        var stepKey = track + ':' + currentBeatParticleStep();
        if (beatParticleCueSteps[phase] === stepKey) {
            return null;
        }
        beatParticleCueSteps[phase] = stepKey;
    }

    var palette = beatParticlePercussionPalettes[track]
        || beatParticlePercussionPalettes.default;
    var cue = palette[phase];
    if (
        !cue
        || typeof sfx === 'undefined'
        || !sfx
        || typeof sfx.play !== 'function'
    ) {
        return null;
    }

    var soundId = sfx.play(cue.name);
    if (typeof sfx.rate === 'function') {
        sfx.rate(cue.rate, soundId);
    }
    if (typeof sfx.volume === 'function') {
        sfx.volume(cue.volume, soundId);
    }
    if (chain && chain.soundIds) {
        chain.soundIds[phase] = soundId;
    }
    return soundId;
}

function nextBeatParticlePeak(track, time) {
    if (
        typeof RhythmEngine === 'undefined'
        || typeof RhythmEngine.nextPeak !== 'function'
        || !rythms[track]
    ) {
        return null;
    }
    return RhythmEngine.nextPeak({
        time: time,
        segments: rythms[track],
        layer: 0,
    });
}

function beatParticleSchedule(track, startTime) {
    var epsilon = 0.000001;
    var firstPeak = nextBeatParticlePeak(track, startTime + epsilon);
    var secondPeak = firstPeak === null
        ? null
        : nextBeatParticlePeak(track, firstPeak + epsilon);
    var period = firstPeak !== null && secondPeak !== null
        ? secondPeak - firstPeak
        : 0.5;

    if (!(period > 0) || period > 2) {
        period = 0.5;
    }

    var minimumDuration = Math.max(0.18, period * 0.4);
    var phase2 = nextBeatParticlePeak(track, startTime + minimumDuration);
    var maximumWait = Math.max(1.5, period * 2.5);
    if (phase2 === null || phase2 - startTime > maximumWait) {
        phase2 = startTime + Math.max(0.2, period);
    }

    var phase3 = nextBeatParticlePeak(track, phase2 + minimumDuration);
    if (phase3 === null || phase3 - phase2 > maximumWait) {
        phase3 = phase2 + Math.max(0.2, period);
    }

    var phase4 = nextBeatParticlePeak(track, phase3 + minimumDuration);
    if (phase4 === null || phase4 - phase3 > maximumWait) {
        phase4 = phase3 + Math.max(0.2, period);
    }

    return {
        phase1: startTime,
        phase2: phase2,
        phase3: phase3,
        phase4: phase4,
        period: period,
    };
}

function finiteBeatParticleValue(value, fallback) {
    return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function beatParticleTargetIsLive(target) {
    return !!(
        target
        && !target.delete
        && !target.__soundstormDestroyed
        && !target.destroyed
    );
}

function beatParticleTargetCenter(burst) {
    var target = burst.target;
    if (beatParticleTargetIsLive(target)) {
        try {
            var targetX = Number(target.x);
            var targetY = Number(target.y);
            if (Number.isFinite(targetX) && Number.isFinite(targetY)) {
                burst.lastTargetX = targetX
                    + finiteBeatParticleValue(target.offsetX, 0);
                burst.lastTargetY = targetY
                    + finiteBeatParticleValue(target.offsetY, 0);
                return {
                    x: burst.lastTargetX,
                    y: burst.lastTargetY,
                    valid: true,
                };
            }
        }
        catch (error) {
            // A destroyed Pixi DisplayObject can still be referenced by a bullet,
            // but its x/y accessors already point at a removed transform.
        }
    }
    return {x: burst.lastTargetX, y: burst.lastTargetY, valid: false};
}

function beatParticleImpactSize(target, property, visualProperty) {
    var collisionSize = 0;
    var visualSize = 0;
    try {
        collisionSize = target
            ? finiteBeatParticleValue(target[property], 0)
            : 0;
        visualSize = target
            ? finiteBeatParticleValue(target[visualProperty], 0)
            : 0;
    }
    catch (error) {
        return 50;
    }
    if (collisionSize > 0) {
        return Math.max(18, collisionSize * 0.78);
    }

    return Math.max(18, visualSize * 0.3 || 50);
}

function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
}

function clampBeatParticleProgress(value) {
    return Math.max(0, Math.min(1, value));
}

function beatParticlePulseReached(time, scheduledTime) {
    // The game simulates at 60 Hz. Choose the nearest simulation sample to
    // the musical peak instead of always waiting for the first sample after
    // it; otherwise every pulse carries a systematic 0-16.7 ms late bias.
    return time + 1 / 120 >= scheduledTime;
}

function updateBeatParticleOutward(burst, time) {
    var duration = Math.max(0.000001, burst.schedule.phase2 - burst.schedule.phase1);
    var progress = clampBeatParticleProgress(
        (time - burst.schedule.phase1) / duration
    );
    var eased = easeOutCubic(progress);

    for (var index = 0; index < burst.particles.length; index++) {
        var particle = burst.particles[index];
        var distance = particle.startDistance
            + particle.outwardDistance * eased;
        var angle = particle.outwardAngle
            + particle.orbit * Math.sin(progress * Math.PI);
        particle.sprite.x = burst.originX + Math.cos(angle) * distance;
        particle.sprite.y = burst.originY + Math.sin(angle) * distance;
        particle.sprite.rotation += particle.rotationSpeed;
        particle.sprite.scale.set(0.72 + 0.28 * eased);
        particle.trail.alpha = 0;
    }
}

function copyBeatParticleColor(color) {
    return {x: color.x, y: color.y, z: color.z};
}

function addBeatParticleLaunchAccent(burst) {
    var targetCenter = beatParticleTargetCenter(burst);
    var color = copyBeatParticleColor(burst.color);
    var white = {x: 255, y: 255, z: 255};
    set.bulletbeatflash(
        burst.originX,
        burst.originY,
        {
            alpha: 1.6,
            scale: 0.65,
            fadeSpeed: 1.34,
            color: color,
        }
    );
    set.bulletbeatflash(
        burst.originX,
        burst.originY,
        {
            alpha: 1.25,
            scale: 0.28,
            fadeSpeed: 1.42,
            shrink: true,
            color: white,
        }
    );

    if (targetCenter.valid) {
        for (var step = 1; step <= 3; step++) {
            var progress = step / 4;
            set.bulletbeatflash(
                burst.originX
                    + (targetCenter.x - burst.originX) * progress,
                burst.originY
                    + (targetCenter.y - burst.originY) * progress,
                {
                    alpha: 0.72,
                    scale: 0.16 + step * 0.025,
                    fadeSpeed: 1.38,
                    shrink: true,
                    color: copyBeatParticleColor(burst.color),
                }
            );
        }
        set.bulletbeatflash(
            targetCenter.x,
            targetCenter.y,
            {
                alpha: 1.2,
                scale: 0.52,
                fadeSpeed: 1.34,
                shrink: true,
                color: copyBeatParticleColor(burst.color),
            }
        );
        set.bulletbeatflash(
            targetCenter.x,
            targetCenter.y,
            {
                alpha: 1.35,
                scale: 0.24,
                fadeSpeed: 1.42,
                color: white,
            }
        );
    }
}

function flashBeatParticleLaunchSprites(burst) {
    var whiteTint = rgbToHex(255, 255, 255);
    burst.launchFlashUntil = musictime + 1 / 60;
    for (var index = 0; index < burst.particles.length; index++) {
        var particle = burst.particles[index];
        particle.sprite.tint = whiteTint;
        particle.trail.tint = whiteTint;
    }
}

function restoreBeatParticleLaunchSprites(burst, time) {
    if (
        burst.launchFlashUntil === null
        || time < burst.launchFlashUntil
    ) {
        return;
    }
    burst.launchFlashUntil = null;
    for (var index = 0; index < burst.particles.length; index++) {
        var particle = burst.particles[index];
        particle.sprite.tint = particle.baseTint;
        particle.trail.tint = particle.baseTint;
    }
}

function startBeatParticleLaunch(burst) {
    if (burst.launchStarted) {
        return;
    }
    burst.launchStarted = true;
    burst.pulse2Frame = currentBeatParticleStep();
    burst.pulse2Time = musictime;
    flashBeatParticleLaunchSprites(burst);
    addBeatParticleLaunchAccent(burst);
    burst.launchSoundId = playBeatParticleCue(
        'launch',
        burst.rhythmTrack,
        burst.beatParticleChain
    );
}

function stopBeatParticleLaunchCue(burst) {
    var chain = burst.beatParticleChain;
    var launchSoundId = chain && chain.soundIds
        ? chain.soundIds.launch
        : burst.launchSoundId;
    if (chain && chain.stoppedCues && chain.stoppedCues.launch) {
        burst.launchSoundId = null;
        return;
    }
    if (
        launchSoundId !== null
        && typeof launchSoundId !== 'undefined'
        && typeof sfx !== 'undefined'
        && sfx
        && typeof sfx.stop === 'function'
    ) {
        sfx.stop(launchSoundId);
    }
    if (chain && chain.stoppedCues) {
        chain.stoppedCues.launch = true;
        chain.soundIds.launch = null;
    }
    burst.launchSoundId = null;
}

function beginBeatParticleReturn(burst) {
    if (burst.phase >= 2) {
        return;
    }
    burst.phase = 2;
    for (var index = 0; index < burst.particles.length; index++) {
        var particle = burst.particles[index];
        particle.returnX = particle.sprite.x;
        particle.returnY = particle.sprite.y;
        particle.trail.x = particle.returnX;
        particle.trail.y = particle.returnY;
    }
    startBeatParticleLaunch(burst);
}

function beginBeatParticleScatter(burst, time) {
    if (burst.scatterStartedAt !== null) {
        return;
    }

    burst.phase = 2;
    burst.targetLost = true;
    burst.target = null;
    burst.scatterStartedAt = time;
    burst.scatterDuration = Math.max(
        0.28,
        Math.min(
            0.65,
            Math.max(
                burst.schedule.phase3 - time,
                burst.schedule.period * 0.75
            )
        )
    );

    for (var index = 0; index < burst.particles.length; index++) {
        var particle = burst.particles[index];
        particle.scatterX = particle.sprite.x;
        particle.scatterY = particle.sprite.y;
        particle.scatterDistance = 72 + particle.outwardDistance * 0.9;
        particle.scatterAlpha = particle.sprite.alpha;
        particle.trail.x = particle.scatterX;
        particle.trail.y = particle.scatterY;
    }

    startBeatParticleLaunch(burst);
}

function updateBeatParticleScatter(burst, time) {
    restoreBeatParticleLaunchSprites(burst, time);
    var progress = clampBeatParticleProgress(
        (time - burst.scatterStartedAt) / burst.scatterDuration
    );
    var distanceProgress = easeOutCubic(progress);
    var trailProgress = easeOutCubic(Math.max(0, progress - 0.1));
    var fade = Math.pow(1 - progress, 1.35);

    for (var index = 0; index < burst.particles.length; index++) {
        var particle = burst.particles[index];
        var directionX = Math.cos(particle.outwardAngle);
        var directionY = Math.sin(particle.outwardAngle);
        particle.sprite.x = particle.scatterX
            + directionX * particle.scatterDistance * distanceProgress;
        particle.sprite.y = particle.scatterY
            + directionY * particle.scatterDistance * distanceProgress;
        particle.trail.x = particle.scatterX
            + directionX * particle.scatterDistance * trailProgress;
        particle.trail.y = particle.scatterY
            + directionY * particle.scatterDistance * trailProgress;
        particle.sprite.alpha = particle.scatterAlpha * fade;
        particle.trail.alpha = 0.34 * fade;
        particle.sprite.rotation += particle.rotationSpeed * 2;
        particle.trail.rotation = particle.sprite.rotation
            - particle.rotationSpeed * 2;
        particle.sprite.scale.set(1 + 0.35 * progress);
        particle.trail.scale.set(0.7 + 0.2 * progress);
    }

    if (progress >= 1) {
        stopBeatParticleLaunchCue(burst);
        burst.phase = 3;
        burst.delete = true;
    }
}

function updateBeatParticleReturn(burst, time) {
    restoreBeatParticleLaunchSprites(burst, time);
    var duration = Math.max(0.000001, burst.schedule.phase3 - burst.schedule.phase2);
    var progress = clampBeatParticleProgress(
        (time - burst.schedule.phase2) / duration
    );
    var trailProgress = progress - 0.075;
    var launchKick = Math.max(0, 1 - progress / 0.18);
    var targetCenter = beatParticleTargetCenter(burst);

    for (var index = 0; index < burst.particles.length; index++) {
        var particle = burst.particles[index];
        var targetX = targetCenter.x + particle.impactX;
        var targetY = targetCenter.y + particle.impactY;
        var deltaX = targetX - particle.returnX;
        var deltaY = targetY - particle.returnY;

        particle.sprite.x = particle.returnX
            + deltaX * progress;
        particle.sprite.y = particle.returnY
            + deltaY * progress;
        particle.trail.x = particle.returnX
            + deltaX * trailProgress;
        particle.trail.y = particle.returnY
            + deltaY * trailProgress;
        particle.sprite.rotation += particle.rotationSpeed * 4;
        particle.trail.rotation = particle.sprite.rotation
            - particle.rotationSpeed * 2;
        particle.trail.alpha = 0.45 + 0.25 * launchKick;
        particle.trail.scale.set(0.78 + 0.42 * launchKick);
        particle.sprite.alpha = 1;
        particle.sprite.scale.set(1.16 + 0.62 * launchKick);
    }
}

function addBeatParticleImpactFlashes(burst, targetCenter) {
    set.bulletbeatflash(
        targetCenter.x,
        targetCenter.y,
        {
            alpha: 1.2,
            scale: 0.42,
            color: copyBeatParticleColor(burst.color),
        }
    );

    var flashCount = Math.min(12, burst.particles.length);
    for (var flash = 0; flash < flashCount; flash++) {
        var particleIndex = Math.floor(
            flash * burst.particles.length / flashCount
        );
        var particle = burst.particles[particleIndex];
        set.bulletbeatflash(
            targetCenter.x + particle.impactX,
            targetCenter.y + particle.impactY,
            {
                alpha: 0.5,
                scale: 0.19,
                shrink: true,
                color: copyBeatParticleColor(burst.color),
            }
        );
    }
}

function applyBeatParticleDamage(burst) {
    var target = burst.target;
    var damage = burst.damage;
    var health = finiteBeatParticleValue(target.health, target.ohealth);
    var originalHealth = finiteBeatParticleValue(target.ohealth, health);

    // Unlike ordinary collision damage, the rhythmic impact must not enter the
    // gradual hit buffer: health, reserved health and the impact all change on
    // the exact same simulation step.
    target.health = health - damage;
    target.ohealth = originalHealth - damage;
    target.beatParticleImpactFrame = currentBeatParticleStep();
    target.beatParticleImpactTime = musictime;
}

function findBeatParticleDeathBehavior(target) {
    if (typeof target.beatParticleDeferredDeathBehavior === 'function') {
        return target.beatParticleDeferredDeathBehavior;
    }
    if (typeof target.beatParticleDeathBehavior === 'function') {
        return target.beatParticleDeathBehavior;
    }
    if (!Array.isArray(target.ai)) {
        return null;
    }
    for (var phase = 0; phase < target.ai.length; phase++) {
        var behaviors = target.ai[phase];
        if (!Array.isArray(behaviors)) {
            continue;
        }
        for (var index = 0; index < behaviors.length; index++) {
            var behavior = behaviors[index];
            var behaviorName = behavior && behavior.name
                ? behavior.name.replace(/^bound\s*/, '')
                : '';
            if (behaviorName === 'dief') {
                return behavior;
            }
        }
    }
    return null;
}

function deferBeatParticleDeath(burst) {
    var target = burst.target;
    if (!(target.health < 0) || !(target.ohealth <= 0)) {
        return false;
    }

    var behavior = findBeatParticleDeathBehavior(target);
    if (!behavior) {
        return false;
    }

    var scheduledExplosion = Number(target.beatParticleExplosionAt);
    if (
        !Number.isFinite(scheduledExplosion)
        || burst.schedule.phase4 < scheduledExplosion
    ) {
        target.beatParticleExplosionAt = burst.schedule.phase4;
    }
    if (typeof target.beatParticleDeferredDeathBehavior !== 'function') {
        target.beatParticleDeferredDeathBehavior = behavior;
        target.beatParticleDeferredAi = target.ai;
        target.beatParticleDeferredPhase = target.phase;
        target.beatParticleDeathWarningStartedAt = musictime;
        target.beatParticleDeathWarningAlpha = finiteBeatParticleValue(target.alpha, 1);
        target.ai = [[]];
        target.phase = 0;
    }

    // Pulse 3 is already lethal, so this enemy is no longer interactive.
    // Empty AI freezes it until its exact fourth-pulse explosion.
    target.collision = 'none';
    target.blendMode = PIXI.BLEND_MODES.ADD;
    burst.waitingForDeath = true;
    for (var index = 0; index < burst.particles.length; index++) {
        burst.particles[index].sprite.alpha = 0;
        burst.particles[index].trail.alpha = 0;
    }
    return true;
}

function updateBeatParticleDeathWarning(target, explosionAt) {
    var startedAt = target.beatParticleDeathWarningStartedAt;
    var duration = Math.max(1 / 60, explosionAt - startedAt);
    var progress = Math.max(0, Math.min(1, (musictime - startedAt) / duration));
    // Spine slots own their blend modes, so ADD on the parent alone does not
    // brighten its artwork. Parent alpha visibly pulses the entire skeleton.
    var pulse = 0.5 + 0.5 * Math.cos(progress * Math.PI * 6);
    target.alpha = target.beatParticleDeathWarningAlpha * (0.35 + 0.65 * pulse);
}

function addBeatParticleDeathFlash(burst, target) {
    var x = finiteBeatParticleValue(target.x, burst.lastTargetX)
        + finiteBeatParticleValue(target.offsetX, 0);
    var y = finiteBeatParticleValue(target.y, burst.lastTargetY)
        + finiteBeatParticleValue(target.offsetY, 0);
    set.bulletbeatflash(x, y, {
        alpha: 2.1,
        scale: 0.82,
        fadeSpeed: 1.42,
        color: {x: 255, y: 255, z: 255},
    });
    set.bulletbeatflash(x, y, {
        alpha: 1.45,
        scale: 0.5,
        fadeSpeed: 1.38,
        shrink: true,
        color: copyBeatParticleColor(burst.color),
    });
}

function runBeatParticleDeathBehavior(burst) {
    var target = burst.target;
    var behavior = findBeatParticleDeathBehavior(target);
    if (!behavior) {
        return;
    }

    target.beatParticleExplosionFrame = currentBeatParticleStep();
    target.beatParticleExplosionTime = musictime;
    addBeatParticleDeathFlash(burst, target);
    var firstExplosionEntity = typeof sprites !== 'undefined'
        && Array.isArray(sprites)
        ? sprites.length
        : null;
    var queuedSoundBefore = typeof sfxonce !== 'undefined' ? sfxonce : '';
    behavior();

    // The regular queue is flushed before AI runs, which would make a death
    // sample created here one frame late. Flush only this newly queued sample
    // now and preserve any unrelated sound that was already waiting.
    if (
        typeof sfxonce !== 'undefined'
        && sfxonce !== ''
        && sfxonce !== queuedSoundBefore
        && typeof sfx !== 'undefined'
        && sfx
        && typeof sfx.play === 'function'
    ) {
        sfx.play(sfxonce);
        sfxonce = queuedSoundBefore;
    }

    // Legacy explosion particles normally begin moving one simulation frame
    // after they are created. Apply that first positional kick immediately so
    // the enemy visibly breaks apart on pulse 4 itself.
    if (firstExplosionEntity !== null) {
        for (var index = firstExplosionEntity; index < sprites.length; index++) {
            var entity = sprites[index];
            if (!entity) {
                continue;
            }
            entity.x += finiteBeatParticleValue(entity.speedX, 0);
            entity.y += finiteBeatParticleValue(entity.speedY, 0);
        }
    }
}

function finishBeatParticleDeath(burst) {
    var target = burst.target;
    if (!beatParticleTargetIsLive(target)) {
        burst.delete = true;
        return;
    }

    var explosionAt = finiteBeatParticleValue(
        target.beatParticleExplosionAt,
        burst.schedule.phase4
    );
    if (!beatParticlePulseReached(musictime, explosionAt)) {
        updateBeatParticleDeathWarning(target, explosionAt);
        return;
    }

    // Death behaviors may reuse the enemy artwork as explosion fragments.
    target.alpha = target.beatParticleDeathWarningAlpha;
    burst.phase = 4;
    burst.pulse4Frame = currentBeatParticleStep();
    burst.pulse4Time = musictime;
    runBeatParticleDeathBehavior(burst);
    burst.delete = true;
}

function finishBeatParticleBurst(burst) {
    if (burst.phase >= 3) {
        return;
    }
    burst.phase = 3;
    var targetCenter = beatParticleTargetCenter(burst);
    if (!targetCenter.valid) {
        burst.delete = true;
        return;
    }

    for (var index = 0; index < burst.particles.length; index++) {
        var particle = burst.particles[index];
        particle.sprite.x = targetCenter.x + particle.impactX;
        particle.sprite.y = targetCenter.y + particle.impactY;
    }

    applyBeatParticleDamage(burst);
    addBeatParticleImpactFlashes(burst, targetCenter);

    burst.pulse3Frame = currentBeatParticleStep();
    burst.pulse3Time = musictime;
    stopBeatParticleLaunchCue(burst);
    playBeatParticleCue(
        'impact',
        burst.rhythmTrack,
        burst.beatParticleChain
    );
    if (deferBeatParticleDeath(burst)) {
        return;
    }
    burst.delete = true;
}

function updateBeatParticleBurstf() {
    var time = musictime;
    if (this.waitingForDeath) {
        finishBeatParticleDeath(this);
        return;
    }
    if (!beatParticleTargetCenter(this).valid) {
        this.targetLost = true;
    }

    if (!beatParticlePulseReached(time, this.schedule.phase2)) {
        updateBeatParticleOutward(this, time);
        return;
    }

    if (this.targetLost) {
        beginBeatParticleScatter(this, time);
        updateBeatParticleScatter(this, time);
        return;
    }

    beginBeatParticleReturn(this);
    if (!beatParticlePulseReached(time, this.schedule.phase3)) {
        updateBeatParticleReturn(this, time);
        return;
    }

    finishBeatParticleBurst(this);
}

set.toenemy = function (active, x, y, options){
    options = options || {};
    var amount = Math.max(1, Math.round(options.amount || 1));
    var color = options.color || {x: 255, y: 255, z: 255};
    var chain = options.beatParticleChain || null;
    var target = beatParticleTargetIsLive(options.target)
        ? options.target
        : null;
    var track = chain && chain.rhythmTrack
        ? chain.rhythmTrack
        : playing;
    var schedule = beatParticleSchedule(track, musictime);
    var targetWidth = beatParticleImpactSize(target, 'squarex', 'width');
    var targetHeight = beatParticleImpactSize(target, 'squarey', 'height');
    var distributionRotation = Math.random() * Math.PI * 2;
    var goldenAngle = Math.PI * (3 - Math.sqrt(5));
    var sprite=setsprite(
        new PIXI.Container(),
        {
            layer: 'sprite',
            active: active,
            x: 0,
            y: 0,
            entityType: 'beatParticleBurst',
        }
    );

    sprite.ai=[[], [], [], [], []];
    sprite.phase=1;
    sprite.target=target;
    sprite.damage=finiteBeatParticleValue(options.damage, 0);
    sprite.color={x: color.x, y: color.y, z: color.z};
    sprite.originX=x;
    sprite.originY=y;
    sprite.lastTargetX=x;
    sprite.lastTargetY=y;
    sprite.rhythmTrack=track;
    sprite.beatParticleChain=chain;
    sprite.schedule=schedule;
    sprite.particles=[];
    sprite.targetLost=false;
    sprite.launchStarted=false;
    sprite.launchFlashUntil=null;
    sprite.launchSoundId=null;
    sprite.scatterStartedAt=null;
    sprite.pulse1Frame=currentBeatParticleStep();
    sprite.pulse1Time=musictime;
    sprite.pulse2Frame=null;
    sprite.pulse2Time=null;
    sprite.pulse3Frame=null;
    sprite.pulse3Time=null;
    sprite.pulse4Frame=null;
    sprite.pulse4Time=null;
    sprite.waitingForDeath=false;
    if (!beatParticleTargetCenter(sprite).valid) {
        sprite.target=null;
        sprite.targetLost=true;
    }

    for (var index = 0; index < amount; index++) {
        var particleSprite = new PIXI.Sprite(tex.p5);
        var trailSprite = new PIXI.Sprite(tex.p5);
        var outwardAngle = distributionRotation + index * goldenAngle;
        var normalizedRadius = Math.sqrt((index + 0.5) / amount);
        var tintVariation = 0.92 + Math.random() * 0.08;
        particleSprite.anchor.set(0.5);
        particleSprite.alpha=0.78;
        var particleTint=rgbToHex(
            color.x * tintVariation,
            color.y * tintVariation,
            color.z * tintVariation
        );
        particleSprite.tint=particleTint;
        particleSprite.blendMode=PIXI.BLEND_MODES.ADD;
        trailSprite.anchor.set(0.5);
        trailSprite.alpha=0;
        trailSprite.tint=particleTint;
        trailSprite.blendMode=PIXI.BLEND_MODES.ADD;
        sprite.addChild(trailSprite);
        sprite.addChild(particleSprite);
        sprite.particles.push({
            sprite: particleSprite,
            trail: trailSprite,
            baseTint: particleTint,
            outwardAngle: outwardAngle,
            startDistance: Math.random() * 8,
            outwardDistance: 48 + 84 * (0.35 + normalizedRadius * 0.65),
            orbit: (Math.random() - 0.5) * 0.7,
            rotationSpeed: (Math.random() - 0.5) * 0.34,
            impactX: Math.cos(outwardAngle) * normalizedRadius * targetWidth,
            impactY: Math.sin(outwardAngle) * normalizedRadius * targetHeight,
            returnX: x,
            returnY: y,
        });
    }

    sprite.onBeforeDestroy=function destroyBeatParticleChildren() {
        var children = this.removeChildren();
        for (var index = 0; index < children.length; index++) {
            children[index].destroy();
        }
        this.particles=[];
    };
    sprite.ai[0].push(updateBeatParticleBurstf.bind(sprite));
    updateBeatParticleOutward(sprite, musictime);
    playBeatParticleCue('explode', track, chain);
    return sprite;
}

function effectf(x,y,type, options){

    this.buffer['position']={x: 0, y: 0};
    this.buffer['speed']={x: 0, y: 0};
    this.buffer['acc']={x: 0, y: 0};
    this.buffer['zoom']={x: 1, y: 1};
    this.buffer['delay']=0;
    this.buffer['blendmode']=PIXI.BLEND_MODES.ADD;

    if (type==0)
    {
        sfx.play('heavybass');
        patternf.call (this,
            {type: 'particle', subtype: tParticle01},
            [
                [100, [
                    {fx: 'xyrandom', key: ['position'], gainx:300, gainy:300, offsetx: -150, offsety: -150},
                    {fx: 'linear', key: ['delay'], gain:100, offset: 0}
                ]],
                [80, [
                    {fx: 'xyrandom', key: ['speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    {fx: 'xyzset', key: ['color'], x:255, y:255, z:255}
                ]]
            ]
        )
    } 
    if (type=='bullet_cast')
    {
        //speed by angle with offset
        patternf.call (this,
            {type: 'particle', subtype: tParticle03},
            [
                [6, [
                    {fx: 'xyset', key: ['position'], x:x, y:y},
                    {fx: 'xyrelative', key: ['speed'], speed: 10},
                    //{fx: 'xyrandom', key: ['speed'], gainx: options.speed.x, gainy: options.speed.y, offsetx: options.speed.x*4, offsety: options.speed.y*4},
                    //{fx: 'xyrandom', key: ['speed'], gainx:50, gainy:50, offsetx: -25, offsety: -25},
                    //{fx: 'xyset', key: ['acc'], x:-options.speed.x/1000, x:-options.speed.x/1000},
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    {fx: 'xyzset', key: ['color'], x:options.color.x, y:options.color.y, z:options.color.z}
                ]]
            ]
        )
    } 
    if (type=='herohit_yellow')
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle03},
            [
                [80, [
                    {fx: 'xyrandom', key: ['speed'], gainx:50, gainy:50, offsetx: -25, offsety: -25},
                    {fx: 'xyset', key: ['acc'], x:1.3, y:1.3},
                    {fx: 'xyzset', key: ['color'], x:255, y:255, z:0}
                ]]
            ]
        )
    } 
    if (type=='herohit_orange')
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle03},
            [
                [80, [
                    {fx: 'xyrandom', key: ['speed'], gainx:50, gainy:50, offsetx: -25, offsety: -25},
                    {fx: 'xyset', key: ['acc'], x:1.3, y:1.3},
                    {fx: 'xyzset', key: ['color'], x:255, y:100, z:0}
                ]]
            ]
        )
    } 
    if (type=='herohit_red')
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle03},
            [
                [80, [
                    {fx: 'xyrandom', key: ['speed'], gainx:50, gainy:50, offsetx: -25, offsety: -25},
                    {fx: 'xyset', key: ['acc'], x:1.3, y:1.3},
                    {fx: 'xyzset', key: ['color'], x:255, y:0, z:0}
                ]]
            ]
        )
    } 
    if (type=='eagle')
    {
        sfxonce='kraechz';
        //sfx.play('kraechz');
        patternf.call (this,
            {type: 'solidparticle', subtype: tex.feather},
            [
                [80, [
                    {fx: 'xyrandom', key: ['speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    {fx: 'set', key: ['rotspeed'], set: 0.3},
                ]]
            ]
        )
    } 
    if (type=='balloon')
    {
        sfxonce='grunt';
        //sfx.play('grunt');
        patternf.call (this,
            {type: 'solidparticle', subtype: tex.air},
            [
                [80, [
                    {fx: 'xyrandom', key: ['speed'], gainx:40, gainy:40, offsetx: -20, offsety: -20},
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    {fx: 'set', key: ['rotspeed'], set: 0.3},
                ]]
            ]
        )
    } 
    if (type=='parrot')
    {
        sfxonce='twitter';
        patternf.call (this,
            {type: 'solidparticle', subtype: tex.featherparrot},
            [
                [80, [
                    {fx: 'xyrandom', key: ['speed'], gainx:50, gainy:20, offsetx: -25, offsety: -10},
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    {fx: 'set', key: ['rotspeed'], set: 0.5},
                ]]
            ]
        )
    } 
    else if (type=='alienexploding')
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle01},
            [
                [15, [
                    {fx: 'xyrandom', key: ['position'], gainx:300, gainy:500, offsetx: -150, offsety: -250},
                    {fx: 'linear', key: ['delay'], gain:30, offset: 0}
                ]],
                [80, [
                    {fx: 'xyrandom', key: ['speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1}
                ]]
            ]
        )
    } 
    else if (type=='alienexplosion')
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [3000, [
                    
                    {fx: 'xyrandomcircle', key: ['position', 'speed'], gainx:50, gainy:50, offsetx: -25, offsety: -25},
                    {fx: 'xymultiply', key: ['position'], factorx: 3, factory: 3},
                    {fx: 'xyset', key: ['acc'], x:1.02, y:1.02}
               
                ]],
            ]
        )
        sfx.play('hugeexplosion3');
        
    } 
    else if (type=='mushroomexploding')
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle01},
            [
                [30, [
                    {fx: 'xyrandom', key: ['position'], gainx:1200, gainy:400, offsetx: -400, offsety: -250},
                    {fx: 'linear', key: ['delay'], gain:30, offset: 0}
                ]],
                [60, [
                    {fx: 'xyrandom', key: ['speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1}
                ]]
            ]
        )
    } 
    else if (type=='cloudexploding')
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle01},
            [
                [30, [
                    {fx: 'xyrandom', key: ['position'], gainx:1200, gainy:400, offsetx: -600, offsety: -200},
                    {fx: 'linear', key: ['delay'], gain:30, offset: 0}
                ]],
                [60, [
                    {fx: 'xyrandom', key: ['speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1}
                ]]
            ]
        )
    } 
    else if (type=='mushroomexplosion')
    {
        set.simple(tex.mushdefeated, {active: 0, x:1017, y:515, layer: 'backlayer'});
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [3000, [
                    
                    {fx: 'xyrandomcircle', key: ['position', 'speed'], gainx:50, gainy:50, offsetx: -25, offsety: -25},
                    {fx: 'xymultiply', key: ['position'], factorx: 3, factory: 3},
                    {fx: 'xyset', key: ['acc'], x:1.02, y:1.02},
                    {fx: 'xyshift', key: ['position'], x:400, y:0}
               
                ]],
            ]
        )

        sfx.play('hugeexplosion3');
    } 
    else if (type=='cloudexplosion')
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [3000, [
                    
                    {fx: 'xyrandomcircle', key: ['position', 'speed'], gainx:50, gainy:50, offsetx: -25, offsety: -25},
                    {fx: 'xymultiply', key: ['position'], factorx: 3, factory: 3},
                    {fx: 'xyset', key: ['acc'], x:1.02, y:1.02},
                    {fx: 'xyshift', key: ['position'], x:0, y:0}
               
                ]],
            ]
        )

        sfx.play('hugeexplosion3');
    } 
    else if (type==1)
    {
        //sfx.play('heavybass');
        sfxonce='heavybass';
        //particles('particle', tParticleHawkbit,  'break', -60, 60, x, y, 1.1,1.1, 5,5, 0,0);
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [3000, [
                    {fx: 'xyrandomcircle', key: ['position', 'speed'], gainx:500, gainy:400, offsetx: -250, offsety: -200},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1}
               
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1}
                ]]
            ]
        );
    }
    else if (type=='heavybass')
    {
        sfxonce='heavybass';
        //sfx.play('heavybass');
        //particles('particle', tParticleHawkbit,  'break', -60, 60, x, y, 1.1,1.1, 5,5, 0,0);
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [1000, [
                    {fx: 'xyrandomcircle', key: ['position', 'speed'], gainx:300, gainy:200, offsetx: -150, offsety: -100},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1}
                ]]
            ]
        )
    }
    else if (type=='ufo')
    {
        sfxonce='dragonfly';
        //sfx.play('dragonfly');

        
        create(0, 'solidparticle', x+33, y+33, {speedX: 10, speedY: 5, subtype: tUfo, beatlayer: 1, accX: 1.1, accY: 1.1, misc1: 1, misc2: 0, misc3: -0.02});
        create(0, 'solidparticle', x-33, y-33, {speedX: -10, speedY: -5, subtype: tUfo, beatlayer: 1, accX: 1.1, accY: 1.1, misc1: 1, misc2: 0, misc3: -0.02});
        create(0, 'solidparticle', x-33, y+33, {speedX: -10, speedY: 5, subtype: tUfo, beatlayer: 1, accX: 1.1, accY: 1.1, misc1: 1, misc2: 0, misc3: -0.02});
        create(0, 'solidparticle', x+33, y-33, {speedX: 10, speedY: -5, subtype: tUfo, beatlayer: 1, accX: 1.1, accY: 1.1, misc1: 1, misc2: 0.0, misc3: -0.02});
   
    }
    else if (type=='zeppelin')
    {
        sfxonce='zeppelin';
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [500, [
                    {fx: 'xyrandom', key: ['speed'], gainx:40, gainy:40, offsetx: -20, offsety: -5},
                    {fx: 'xyzrandom', key: ['color'], gainx:100, gainy:50, gainz: 50, offsetx: 155, offsety: 50, offsetz: 50},
                    {fx: 'xyset', key: ['acc'], x:0.98, y:0.98},
                    {fx: 'set', key: ['rotspeed'], set: 0.3},
                ]]
            ]
        )
    }
    else if (type=='fa18')
    {
        sfxonce='heli';
        patternf.call (this,
            {type: 'particle', subtype: tParticle01},
            [
                [1000, [
                    {fx: 'xyrandomcircle', key: ['speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyzrandom', key: ['color'], gainx:100, gainy:50, gainz: 50, offsetx: 155, offsety: 50, offsetz: 50},
                    {fx: 'xyset', key: ['acc'], x:1.03, y:1.03},
                    {fx: 'set', key: ['rotspeed'], set: 0.3},
                ]]
            ]
        )
    }
    else if (type=='whiteghost')
    {
        sfxonce='heli';
        patternf.call (this,
            {type: 'particle', subtype: tParticle01},
            [
                [1000, [
                    {fx: 'xyrandomcircle', key: ['speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyzrandom', key: ['color'], gainx:50, gainy:50, gainz: 100, offsetx: 50, offsety: 50, offsetz: 155},
                    {fx: 'xyset', key: ['acc'], x:1.03, y:1.03},
                    {fx: 'set', key: ['rotspeed'], set: 0.3},
                ]]
            ]
        )
    }
    else if (type=='citycloud')
    {
        sfxonce='cloud';
        patternf.call (this,
            {type: 'particle', subtype: tex.air},
            [
                [500, [
                    {fx: 'xyrandomcircle', key: ['position', 'speed'], gainx:40, gainy:20, offsetx: -20, offsety: -10},
                    //{fx: 'xyrandom', key: ['speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyzrandom', key: ['color'], gainx:50, gainy:50, gainz: 100, offsetx: 50, offsety: 50, offsetz: 155},
                    {fx: 'xyset', key: ['acc'], x:1.03, y:1.03},
                    {fx: 'set', key: ['rotspeed'], set: 0.3},
                ]]
            ]
        )
    }
    else if (type=='heli')
    {
        sfxonce='groundex';
        patternf.call (this,
            {type: 'particle', subtype: tParticle03},
            [
                [1000, [
                    {fx: 'xyrandomcircle', key: ['position', 'speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyzrandom', key: ['color'], gainx:100, gainy:50, gainz: 50, offsetx: 155, offsety: 50, offsetz: 50},
                    {fx: 'xyset', key: ['acc'], x:1.03, y:1.03},
                ]]
            ]
        )
    }
    else if (type=='particlehit') //laserget
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [5, [
                    {fx: 'xyrandom', key: ['position', 'speed'], gainx:80, gainy:80, offsetx: -40, offsety: -40},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    {fx: 'xyzset', key: ['color'], x:255, y:255, z: 255}
                ]]
            ]
        )
    }
    else if (type=='toenemyhit') //laserget
    {
        if (++remember.shothit<=2){
            sfx.play('shothit');
        }
        else{
            
        }
        patternf.call (this,
            {type: 'particle', subtype: tex.p8},
            [
                [1, [
                    {fx: 'xyrandom', key: ['position', 'speed'], gainx:10, gainy:10, offsetx: -5+this.speedX, offsety: -5+this.speedY},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.3, factory: 0.3},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.03, y:1.03},
                    {fx: 'xyset', key: ['zoom'], x:1.08, y:1.08},
                    {fx: 'xyzset', key: ['color'], x: this.color.x, y:this.color.y, z: this.color.z}
                ]]
            ]
        )
    }
    else if (type=='laserget') //laserget
    {
        //particles('particle', tParticleHawkbit,  'break', -60, 60, x, y, 1.1,1.1, 5,5, 0,0);
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [40, [
                    {fx: 'xyrandom', key: ['position', 'speed'], gainx:80, gainy:80, offsetx: -40, offsety: -40},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    {fx: 'xyzset', key: ['color'], x:0, y:0, z: 255},
                    {fx: 'set', key: ['alpha'], set: 0.3},
                ]]
            ]
        )
    }

    else if (type=='bigstar') //laserget
    {
        sfx.play('blingbling'+(1+Math.floor(2*Math.random())) );
        set.toscore(this.x, this.y, {score: scores.idlebullet});

        patternf.call (this,
            {type: 'particle', subtype: tex.p7},
            [
                [20, [
                    {fx: 'xyrandom', key: ['position', 'speed'], gainx:50, gainy:50, offsetx: -25, offsety: -25},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.05, y:1.05},
                    {fx: 'xyzset', key: ['color'], x:255, y:200, z: 0},
                    {fx: 'set', key: ['alpha'], set: 0.4},
                ]]
            ]
        )
    }

    else if (type=='smallstar') //laserget
    {

        sfx.play('bling'+(1+Math.floor(2*Math.random())));
        set.toscore(this.x, this.y, {score: difficulty.flashbullet});
        //particles('particle', tParticleHawkbit,  'break', -60, 60, x, y, 1.1,1.1, 5,5, 0,0);
        patternf.call (this,
            {type: 'particle', subtype: tex.p6},
            [
                [10, [
                    {fx: 'xyrandom', key: ['position', 'speed'], gainx:40, gainy:40, offsetx: -20, offsety: -20},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.05, y:1.05},
                    {fx: 'xyzset', key: ['color'], x:255, y:255, z: 0},
                    {fx: 'set', key: ['alpha'], set: 0.3},
                ]]
            ]
        )
    }

    else if (type=='lifeget')
    {
        if (lifestock>=3) {
            var lifecolor = {fx: 'xyzset', key: ['color'], x:255, y:255, z: 255}
        }
        else if (lifestock>=2){
            var lifecolor = {fx: 'xyzset', key: ['color'], x:255, y:255, z: 80}
        }
        else if (lifestock>=1){
            var lifecolor = {fx: 'xyzset', key: ['color'], x:255, y:180, z: 40}
        }
        else {
            var lifecolor = {fx: 'xyzset', key: ['color'], x:255, y: 0, z: 0}
        }
        //sfxonce='relief';
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [50, [
                    {fx: 'xyrandom', key: ['position', 'speed'], gainx:100, gainy:100, offsetx: -50, offsety: -50},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    lifecolor
                ]]
            ]
        )
    }
    else if (type=='dragon'){
        sfxonce='roar';
        //sfx.play('roar');
        particles('solidparticle', tParticle01,  'break', -200, 200, x, y, 1.05,1.05, 2,6, 0, 0, 0);
        create(0, 'solidparticle', x+100, y, {speedX: 5, speedY: 0, subtype: tex.dragonwing, beatlayer: 1, accX: 1, accY: 1, misc1: 1, misc2: 0, misc3: -0.02});
        create(0, 'solidparticle', x-100, y, {speedX: -5, speedY: 0, subtype: tex.dragonwing, beatlayer: 1, accX: 1, accY: 1, misc1: 1, misc2: 0, misc3: -0.02});
    }
    else if (type=='bulletexplode') 
    {
        //make particles fly to enemy on beat
        options.amount= options.amount || 40;
        options.color=options.color || {x: 255, y: 255, z:255};

        /*patternf.call (this,
            {type: 'particle', subtype: tParticle01},
            [
                [16, [
                    //{fx: 'xycircle', key: ['position'], gain:2*pi, offset: -0, speed:80},
                    {fx: 'xyrandomcircle', key: ['position', 'speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    //{fx: 'xyrandom', key: ['speed'], gainx:10, gainy:10, offsetx: -5, offsety: -5},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                ]]
            ]
        );

        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [options.amount, [
                    {fx: 'xyrandom', key: ['position', 'speed'], gainx:100, gainy:100, offsetx: -50, offsety: -50},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    {fx: 'xyzset', key: ['color'], x:options.color.x, y:options.color.y, z: options.color.z}
                ]]
            ]
        );*/
        patternf.call (this,
            {type: 'particle', subtype: tex.p2},
            [
                [12, [
                    {fx: 'xycircle', key: ['position', 'speed'], gain:2*pi, offset: -0, speed:10},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.03, y:1.03},
                    {fx: 'xyzset', key: ['color'], x:200, y:200, z: 200},
                    {fx: 'set', key: ['rotspeed'], set: 0.3},
                ]]
            ]
        );

    }
    else if (type=='idlebulletexplode') //lifeget
    {
        options.color=options.color || {x: 255, y: 255, z:255};
        patternf.call (this,
            {type: 'particle', subtype: tStar},
            [
                [16, [
                    {fx: 'xycircle', key: ['position', 'speed'], gain:2*pi, offset: -0, speed: 40},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.2, y:1.2},
                    {fx: 'xyzset', key: ['color'], x:options.color.x, y:options.color.y, z: options.color.z}
                ]]
            ]
        );
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [16, [
                    {fx: 'xyrandom', key: ['position', 'speed'], gainx:30, gainy:30, offsetx: -15, offsety: -15},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.6, factory: 0.6},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.2, y:1.2},
                    {fx: 'xyzset', key: ['color'], x:255, y:255, z: 255}
                ]]
            ]
        );
    }

}

function particle(x,y,type)
{
    if (type==7)
    {
        sfxonce='cord_high';
        particles('particle', tParticleHawkbit,  'break', -60, 60, x, y, 1.1,1.1, 5,5, 0,0);
    }
    else if (type==1){
        sfx.play('dragonfly');
        particles('solidparticle', tParticle01,  'break', -200, 200, x, y, 1.05,1.05, 2,6, 0, 0, 0);
        create(0, 'solidparticle', x+100, y+50, {speedX: 2, speedY: 2, subtype: tWingparticle, beatlayer: 1, accX: 1, accY: 1, misc1: 1, misc2: 0.1, misc3: -0.02});
        create(0, 'solidparticle', x-100, y-50, {speedX: -2, speedY: -2, subtype: tWingparticle, beatlayer: 1, accX: 1, accY: 1, misc1: 1, misc2: -0.1, misc3: -0.02});
        create(0, 'solidparticle', x-100, y+50, {speedX: -2, speedY: 2, subtype: tWingparticle, beatlayer: 1, accX: 1, accY: 1, misc1: 1, misc2: -0.1, misc3: -0.02});
        create(0, 'solidparticle', x+100, y-50, {speedX: 2, speedY: -2, subtype: tWingparticle, beatlayer: 1, accX: 1, accY: 1, misc1: 1, misc2: 0.1, misc3: -0.02});
    }
    else if (type==2){
        //sfx.play('fly2');
        sfxonce='fly2';
        particles('particle', tParticle01,  'break', -30, 30, x, y, 1.1,1.1, 3,3, 0, 0);
    }
    else if (type==3){
        //sfx.play('laserget');
        sfxonce='cancel';
        particles('particle', tParticle01,  'back', -20, 20, x, y, 1.2,1.2, 1,1, 40, 40);
    }
    else if (type==4){
        sfxonce='hawkbit';
        //sfx.play('bulletexplodeblack');
        particles('solidparticle', tParticle01,  'break', -20, 20, x, y, 1.1,1.1, 3,3, 0, 0);
    }
    else if (type==5){
        //sfx.play('cord_mid');
        sfxonce='cord_mid';
        particles('particle', tParticleSunflower,  'break', -60, 60, x, y, 1.1,1.1, 6,6, 0, 0, {rotspeed:-0.2});
    }
    else if (type==6){
        //sfx.play('shothit2');
        sfxonce='shothit2';
        particles('particle', tParticle01,  'fire', -3, 3, x, y, 1.1,1.1, 6,6, 0, 0, {rotspeed:-0.2});
    }
    else if (type==8){
        //sfx.play('fly');
        sfxonce='fly';
        particles('particle', tParticle01,  'break', -50, 50, x, y, 1.1,1.1, 5,5, 0, 0);
    }
}

function particles(sprite, texture, effect, min, max, x, y, x2, y2, x3, y3, x4, y4, options)
{
    if (typeof(options)==='undefined') options = {};
    var rotspeed = options.rotspeed || 0;

    if (effect=='linear')
    {
        for (var i=min; i<max; i++)
        {
            create(0, sprite, x, y, {speedX: (Math.random()+1)*4*Math.sin(i)*x3, speedY: (Math.random()+1)*4*Math.cos(i)*y3, subtype: texture, accX: x2, accY:y2});
        }
    }
    if (effect=='break')
    {
        for (var i=min; i<max; i++)
        {
            create(0, sprite, x, y, {speedX: (Math.random())*4*Math.sin(i)*x3, speedY: (Math.random())*4*Math.cos(i)*y3, subtype: texture, accX: x2, accY:y2, rotspeed:rotspeed});
        }
    }
    if (effect=='fire')
    {
        for (var i=min; i<max; i++)
        {
            create(0, sprite, x, y, {speedX: (Math.random())*5-2.5, speedY: -(Math.random())*5-5,  accX: x2, accY:y2, subtype: texture});
        }
    }
    if (effect=='back')
    {
        for (var i=min; i<max; i++)
        {
            var randx=Math.random();
            var randy=Math.random();
            create(0, sprite, x-x4*Math.sin(i), y-y4*Math.cos(i), {speedX: (randx+1)*4*Math.sin(i)*x3, speedY: (randy+1)*4*Math.cos(i)*y3, subtype: texture, accX: x2, accY: y2});
        }
    }
}

set.spritezoom= function(x, y, texture, speed, min, max){
    var sprite=setsprite(
    new PIXI.Sprite(texture),
    {anchor: true, active: 0, x: x, y: y});
    
    sprite.scale.x=min;
    sprite.scale.y=min;

    sprite.ai = [[]];

    sprite.ai[0].push(ai.zoomAndFade.bind(sprite, speed, max));

}

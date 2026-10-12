var SoundStorm = (function createSoundStormFacade() {
    "use strict";

    function link(target, name, read, write) {
        Object.defineProperty(target, name, {
            enumerable: true,
            get: read,
            set: write,
        });
    }

    function readRuntimeGlobal(name) {
        return typeof window[name] === "undefined" ? null : window[name];
    }

    var config = {
        build: {},
        graphics: {},
        rhythm: {},
        rules: {},
    };
    var state = {
        flow: {},
        run: {},
        input: {},
        pause: {},
        rhythm: {},
        menu: {},
        world: {},
        cheats: {},
    };
    var runtime = {
        world: {
            layers: {},
        },
        audio: {},
        clock: {},
    };

    link(config.build, "version", function readVersion() {
        return settings.version;
    }, function writeVersion(value) {
        settings.version = value;
    });
    link(config.build, "platform", function readPlatform() {
        return settings.plattform;
    }, function writePlatform(value) {
        settings.plattform = value;
    });
    link(config.build, "playtestStages", function readPlaytestStages() {
        return settings.playtest;
    }, function writePlaytestStages(value) {
        settings.playtest = value;
    });
    link(config.build, "releaseNumber", function readReleaseNumber() {
        return settings.number;
    }, function writeReleaseNumber(value) {
        settings.number = value;
    });

    link(config.graphics, "shadows", function readShadows() {
        return settings.shadow;
    }, function writeShadows(value) {
        settings.shadow = value;
    });
    link(config.graphics, "outlines", function readOutlines() {
        return settings.outline;
    }, function writeOutlines(value) {
        settings.outline = value;
    });
    link(config.graphics, "enemyEffectBudget", function readEnemyEffectBudget() {
        return settings.ntoenemy;
    }, function writeEnemyEffectBudget(value) {
        settings.ntoenemy = value;
    });
    link(config.graphics, "flashSize", function readFlashSize() {
        return settings.flashsize;
    }, function writeFlashSize(value) {
        settings.flashsize = value;
    });

    link(config.rhythm, "preflashRange", function readPreflashRange() {
        return settings.preflashrange;
    }, function writePreflashRange(value) {
        settings.preflashrange = value;
    });
    link(config.rhythm, "preflashRadius", function readPreflashRadius() {
        return settings.preflashradius;
    }, function writePreflashRadius(value) {
        settings.preflashradius = value;
    });
    link(config.rules, "difficulty", function readDifficulty() {
        return difficulty;
    });
    link(config.rules, "scoreValues", function readScoreValues() {
        return scores;
    });

    link(state.flow, "stage", function readStage() {
        return stagecount;
    }, function writeStage(value) {
        stagecount = value;
    });
    link(state.flow, "act", function readAct() {
        return actcount;
    }, function writeAct(value) {
        actcount = value;
    });
    link(state.flow, "scene", function readScene() {
        return scene;
    }, function writeScene(value) {
        scene = value;
    });
    link(state.flow, "ticks", function readTicks() {
        return ticks;
    }, function writeTicks(value) {
        ticks = value;
    });
    link(state.flow, "transition", function readTransition() {
        return done;
    }, function writeTransition(value) {
        done = value;
    });
    link(state.flow, "deathTimer", function readDeathTimer() {
        return dead;
    }, function writeDeathTimer(value) {
        dead = value;
    });
    link(state.flow, "startStage", function readStartStage() {
        return startstage;
    }, function writeStartStage(value) {
        startstage = value;
    });
    link(state.flow, "skipScene", function readSkipScene() {
        return skipscene;
    }, function writeSkipScene(value) {
        skipscene = value;
    });

    link(state.run, "actScore", function readActScore() {
        return score;
    }, function writeActScore(value) {
        score = value;
    });
    link(state.run, "totalScore", function readTotalScore() {
        return scoretotal;
    }, function writeTotalScore(value) {
        scoretotal = value;
    });
    link(state.run, "highScore", function readHighScore() {
        return highscore;
    }, function writeHighScore(value) {
        highscore = value;
    });
    link(state.run, "lives", function readLives() {
        return lifestock;
    }, function writeLives(value) {
        lifestock = value;
    });
    link(state.run, "tries", function readTries() {
        return trystock;
    }, function writeTries(value) {
        trystock = value;
    });
    link(state.run, "laser", function readLaser() {
        return laserstock;
    }, function writeLaser(value) {
        laserstock = value;
    });
    link(state.run, "invincibility", function readInvincibility() {
        return invincible;
    }, function writeInvincibility(value) {
        invincible = value;
    });
    link(state.run, "scoreTimer", function readScoreTimer() {
        return scoretimer;
    }, function writeScoreTimer(value) {
        scoretimer = value;
    });

    link(state.input, "mode", function readInputMode() {
        return inputcontrol;
    }, function writeInputMode(value) {
        inputcontrol = value;
    });
    link(state.input, "bindings", function readInputBindings() {
        return keys;
    });
    for (var inputName of ["left", "right", "up", "down", "shoot", "laser", "touch"]) {
        (function linkInput(name) {
            link(state.input, name, function readInput() {
                return window[name];
            }, function writeInput(value) {
                window[name] = value;
            });
        })(inputName);
    }

    link(state.pause, "windowBlurred", function readWindowPause() {
        return pause;
    }, function writeWindowPause(value) {
        pause = value;
    });
    link(state.pause, "active", function readActivePause() {
        return pauseactive;
    }, function writeActivePause(value) {
        pauseactive = value;
    });
    link(state.pause, "requested", function readPauseRequest() {
        return pause2;
    }, function writePauseRequest(value) {
        pause2 = value;
    });
    link(state.pause, "pressedFrames", function readPressedFrames() {
        return pausepressed;
    }, function writePressedFrames(value) {
        pausepressed = value;
    });
    link(state.pause, "inputLatch", function readPauseLatch() {
        return pausedown;
    }, function writePauseLatch(value) {
        pausedown = value;
    });

    link(state.rhythm, "musicTime", function readMusicTime() {
        return musictime;
    }, function writeMusicTime(value) {
        musictime = value;
    });
    link(state.rhythm, "beat", function readBeat() {
        return beat;
    }, function writeBeat(value) {
        beat = value;
    });
    link(state.rhythm, "prebeat", function readPrebeat() {
        return prebeat;
    }, function writePrebeat(value) {
        prebeat = value;
    });
    link(state.rhythm, "prebeatLayers", function readPrebeatLayers() {
        return prebeat2;
    }, function writePrebeatLayers(value) {
        prebeat2 = value;
    });
    link(state.rhythm, "soundBeat", function readSoundBeat() {
        return soundbeat;
    }, function writeSoundBeat(value) {
        soundbeat = value;
    });
    link(state.world, "backgroundSpeedX", function readBackgroundSpeedX() {
        return bgspeedx;
    }, function writeBackgroundSpeedX(value) {
        bgspeedx = value;
    });
    link(state.world, "backgroundSpeedY", function readBackgroundSpeedY() {
        return bgspeedy;
    }, function writeBackgroundSpeedY(value) {
        bgspeedy = value;
    });
    link(state.world, "backgroundChanged", function readBackgroundChanged() {
        return bgchange;
    }, function writeBackgroundChanged(value) {
        bgchange = value;
    });

    link(state.cheats, "noBullets", function readNoBullets() {
        return nobullets;
    }, function writeNoBullets(value) {
        nobullets = value;
    });
    link(state.cheats, "cannotDie", function readCannotDie() {
        return cantdie;
    }, function writeCannotDie(value) {
        cantdie = value;
    });

    link(state.menu, "positions", function readMenuPositions() {
        return menuposition;
    }, function writeMenuPositions(value) {
        menuposition = value;
    });
    link(state.menu, "selections", function readMenuSelections() {
        return menuselected;
    }, function writeMenuSelections(value) {
        menuselected = value;
    });
    link(state.menu, "memory", function readMenuMemory() {
        return remember;
    });

    link(runtime.world, "entities", function readEntities() {
        return sprites;
    });
    link(runtime.world, "hero", function readHero() {
        return hero;
    });
    for (var layerName of [
        "stage",
        "background",
        "backlayer",
        "container",
        "particlelayer",
        "frontlayer",
        "textlayer",
    ]) {
        (function linkLayer(name) {
            link(runtime.world.layers, name, function readLayer() {
                return readRuntimeGlobal(name);
            });
        })(layerName);
    }
    link(runtime.world, "filters", function readFilters() {
        return globalfilters;
    });

    link(runtime.audio, "tracks", function readTracks() {
        return readRuntimeGlobal("music");
    });
    link(runtime.audio, "effects", function readEffects() {
        return readRuntimeGlobal("sfx");
    });
    link(runtime.audio, "currentTrack", function readCurrentTrack() {
        return playing;
    }, function writeCurrentTrack(value) {
        playing = value;
    });
    link(runtime.clock, "game", function readGameClock() {
        return readRuntimeGlobal("gameClock");
    });

    function resetActState() {
        state.run.actScore = 0;
        state.run.laser = difficulty.lasermax;
        state.run.scoreTimer = 99;

        state.flow.ticks = 0;
        state.flow.deathTimer = 0;

        state.rhythm.beat = [0, 0, 0, 0];
        state.rhythm.musicTime = 0;

        difftime = 1000 / 60;
        beatlayer = 0;
        pace1 = 0;

        state.world.backgroundChanged = 0;
        state.world.backgroundSpeedX = 0;
        state.world.backgroundSpeedY = 1;
    }

    return Object.freeze({
        config: Object.freeze(config),
        state: Object.freeze(state),
        runtime: Object.freeze(runtime),
        reset: Object.freeze({
            act: resetActState,
        }),
    });
})();

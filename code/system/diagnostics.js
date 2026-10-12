(function installSoundStormDiagnostics() {
    "use strict";

    var search = new URLSearchParams(window.location.search);
    var automationEnabled = search.get("automation") === "1";
    var inspectionMode = search.get("inspect");
    var includeAiDetails = inspectionMode === "ai";
    var includeEffectDetails = inspectionMode === "effects";
    var includeMenuDetails = inspectionMode === "menu";
    var includeGlobalDetails = inspectionMode === "globals";
    var runtimeGlobalBaseline = null;
    var automationStarted = false;
    var resolveAutomationReady;
    var automationReady = new Promise(function rememberAutomationResolver(resolve) {
        resolveAutomationReady = resolve;
    });

    function finiteNumber(value, fallback) {
        if (value === null || value === "") {
            return fallback;
        }
        var parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function installSeededRandom(seedValue) {
        var seed = finiteNumber(seedValue, NaN);
        if (!Number.isFinite(seed)) {
            return;
        }

        var state = seed >>> 0;
        Math.random = function seededRandom() {
            state = (state * 1664525 + 1013904223) >>> 0;
            return state / 4294967296;
        };
    }

    function rounded(value) {
        return Number.isFinite(value) ? Math.round(value * 1000) / 1000 : null;
    }

    function globalValue(name, fallback) {
        return typeof window[name] === "undefined" ? fallback : window[name];
    }

    function entitySnapshot(sprite, index) {
        var scale = sprite && sprite.scale ? sprite.scale : {};
        var snapshot = {
            index: index,
            type: sprite.entityType || sprite.type || sprite.name || null,
            className: sprite.constructor && sprite.constructor.name || null,
            collision: sprite.collision || "none",
            x: rounded(sprite.x),
            y: rounded(sprite.y),
            speedX: rounded(sprite.speedX),
            speedY: rounded(sprite.speedY),
            scaleX: rounded(scale.x),
            scaleY: rounded(scale.y),
            phase: finiteNumber(sprite.phase, 0),
            health: rounded(sprite.health),
            originalHealth: rounded(sprite.ohealth),
            activeAt: finiteNumber(sprite.active, 0),
            visible: sprite.visible !== false,
            pendingDelete: sprite.delete === true,
        };

        if (sprite.entityType === "beatParticleBurst") {
            snapshot.beatParticle = {
                phase2At: rounded(sprite.schedule && sprite.schedule.phase2),
                phase3At: rounded(sprite.schedule && sprite.schedule.phase3),
                phase4At: rounded(sprite.schedule && sprite.schedule.phase4),
                pulse1Frame: finiteNumber(sprite.pulse1Frame, null),
                pulse2Frame: finiteNumber(sprite.pulse2Frame, null),
                pulse3Frame: finiteNumber(sprite.pulse3Frame, null),
                pulse4Frame: finiteNumber(sprite.pulse4Frame, null),
                pulse1Time: rounded(sprite.pulse1Time),
                pulse2Time: rounded(sprite.pulse2Time),
                pulse3Time: rounded(sprite.pulse3Time),
                pulse4Time: rounded(sprite.pulse4Time),
                waitingForDeath: sprite.waitingForDeath === true,
                targetLost: sprite.targetLost === true,
            };
        }
        if (sprite.entityType === "scoreStar") {
            snapshot.scoreStar = {
                value: rounded(sprite.scoreadd),
                wave: sprite.scoreStarWave || null,
                collectedAt: rounded(sprite.collectedAt),
                launchAt: rounded(sprite.schedule && sprite.schedule.launchAt),
                arriveAt: rounded(sprite.schedule && sprite.schedule.arriveAt),
                launched: sprite.launched === true,
                arrived: sprite.arrived === true,
                launchFrame: finiteNumber(sprite.scoreStarLaunchFrame, null),
                arrivalFrame: finiteNumber(sprite.scoreStarArrivalFrame, null),
                launchTime: rounded(sprite.scoreStarLaunchTime),
                arrivalTime: rounded(sprite.scoreStarArrivalTime),
            };
        }
        if (Number.isFinite(sprite.beatParticleImpactFrame)) {
            snapshot.lastBeatParticleImpact = {
                frame: sprite.beatParticleImpactFrame,
                time: rounded(sprite.beatParticleImpactTime),
            };
        }
        if (Number.isFinite(sprite.beatParticleExplosionFrame)) {
            snapshot.lastBeatParticleExplosion = {
                scheduledAt: rounded(sprite.beatParticleExplosionAt),
                frame: sprite.beatParticleExplosionFrame,
                time: rounded(sprite.beatParticleExplosionTime),
            };
        }

        if (includeAiDetails) {
            snapshot.ai = (sprite.ai || []).map(function phaseBehaviors(phase) {
                return (phase || []).map(function behaviorName(behavior) {
                    var name = behavior && behavior.name || "";
                    return name.replace(/^bound\s*/, "") || "<anonymous>";
                });
            });
        }

        if (
            includeEffectDetails
            && globalValue("GameEffects", null)
            && typeof globalValue("GameEffects", {}).inspect === "function"
        ) {
            snapshot.effects = globalValue("GameEffects", {}).inspect(sprite);
        }

        if (includeMenuDetails) {
            snapshot.text = typeof sprite.text === "string" ? sprite.text : null;
            snapshot.menuKey = finiteNumber(sprite.key, null);
            snapshot.menuPosition = finiteNumber(sprite.menuposition, null);
            snapshot.alpha = rounded(sprite.alpha);
            snapshot.menuValues = Array.isArray(sprite.settings)
                ? sprite.settings.slice()
                : [];
        }

        return snapshot;
    }

    function collisionSummary(currentSprites) {
        return currentSprites.reduce(function summarize(counts, sprite) {
            var key = sprite.collision || "none";
            counts[key] = (counts[key] || 0) + 1;
            return counts;
        }, {});
    }

    function newRuntimeGlobals() {
        if (runtimeGlobalBaseline === null) {
            return [];
        }

        return Object.keys(window)
            .filter(function addedAfterGameReady(name) {
                return !runtimeGlobalBaseline.has(name);
            })
            .sort();
    }

    window.render_game_to_text = function renderGameToText() {
        var currentSprites = Array.isArray(globalValue("sprites", null))
            ? globalValue("sprites", [])
            : [];
        var currentStage = globalValue("stagecount", null);
        var currentScene = globalValue("scene", null);
        var currentPlay = globalValue("play", false);
        var currentPause = Boolean(globalValue("pause", 0) || globalValue("pauseactive", 0));
        var mode = "loading";

        if (currentPlay) {
            mode = currentPause ? "paused" : currentStage === 0 ? "menu" : "gameplay";
        }

        var snapshot = {
            coordinateSystem: "origin top-left; x increases right; y increases down; gameplay area 1920x1080",
            mode: mode,
            automation: {
                enabled: automationEnabled,
                started: automationStarted,
                simulationFrame: globalValue("gameClock", {}).simulationFrame || 0,
                droppedSimulationMs: rounded(globalValue("droppedSimulationMs", 0)),
            },
            replay: globalValue("ReplaySystem", null)
                ? globalValue("ReplaySystem", {}).status()
                : null,
            flow: {
                stage: currentStage,
                act: globalValue("actcount", null),
                scene: currentScene,
                ticks: rounded(globalValue("ticks", null)),
                play: currentPlay,
                done: globalValue("done", null),
                paused: currentPause,
            },
            player: {
                x: rounded(globalValue("herox", null)),
                y: rounded(globalValue("heroy", null)),
                life: rounded(globalValue("lifestock", null)),
                laser: rounded(globalValue("laserstock", null)),
                score: rounded(globalValue("score", null)),
                totalScore: rounded(globalValue("scoretotal", null)),
                invincible: rounded(globalValue("invincible", null)),
            },
            menu: {
                position: Array.isArray(globalValue("menuposition", null))
                    ? globalValue("menuposition", []).slice()
                    : [],
                selected: Array.isArray(globalValue("menuselected", null))
                    ? globalValue("menuselected", []).slice()
                    : [],
                wait: rounded(globalValue("remember", {}).wait),
            },
            rhythm: {
                audioTime: rounded(globalValue("musictime", null)),
                beat: Array.isArray(globalValue("beat", null))
                    ? globalValue("beat", []).map(rounded)
                    : [],
                prebeat: Array.isArray(globalValue("prebeat", null))
                    ? globalValue("prebeat", []).map(rounded)
                    : [],
            },
            entities: {
                total: currentSprites.length,
                byCollision: collisionSummary(currentSprites),
                visible: currentSprites
                    .filter(function visible(sprite) {
                        return sprite && sprite.visible !== false && sprite.delete !== true;
                    })
                    .sort(function interactiveFirst(left, right) {
                        var leftPriority = (
                            left.entityType === "beatParticleBurst"
                            || left.entityType === "scoreStar"
                            || Number.isFinite(left.beatParticleImpactFrame)
                            || Number.isFinite(left.beatParticleExplosionFrame)
                        ) ? 0 : left.collision && left.collision !== "none" ? 1 : 2;
                        var rightPriority = (
                            right.entityType === "beatParticleBurst"
                            || right.entityType === "scoreStar"
                            || Number.isFinite(right.beatParticleImpactFrame)
                            || Number.isFinite(right.beatParticleExplosionFrame)
                        ) ? 0 : right.collision && right.collision !== "none" ? 1 : 2;
                        return leftPriority - rightPriority;
                    })
                    .slice(0, 40)
                    .map(entitySnapshot),
            },
        };

        if (includeGlobalDetails) {
            snapshot.diagnostics = {
                newRuntimeGlobals: newRuntimeGlobals(),
            };
        }
        if (includeMenuDetails) {
            snapshot.menu.options = {
                startStage: globalValue("startstage", null),
                difficulty: globalValue("difficulty", {}).general,
                manyTries: globalValue("trystock", null),
                invincible: globalValue("cantdie", null),
                noBullets: globalValue("nobullets", null),
            };
            snapshot.menu.items = currentSprites
                .filter(function menuSprite(sprite) {
                    return sprite && Number.isFinite(sprite.menuposition);
                })
                .map(entitySnapshot);
        }

        return JSON.stringify(snapshot);
    };

    if (automationEnabled) {
        window.advanceTime = function advanceDeterministicTime(ms) {
            return automationReady.then(function advanceWhenReady() {
                return gameClock.advanceTime(Math.max(0, finiteNumber(ms, 0)));
            });
        };
        window.advanceGameFrames = function advanceDeterministicFrames(frameCount, options) {
            return automationReady.then(function advanceFramesWhenReady() {
                return gameClock.advanceFrames(frameCount, options);
            });
        };
    }
    else if (typeof window.advanceTime !== "function") {
        window.advanceTime = function advanceTime(ms) {
            return new Promise(function waitForElapsedTime(resolve) {
                window.setTimeout(resolve, Math.max(0, ms));
            });
        };
    }

    function startAutomationWhenReady() {
        if (!automationEnabled) {
            return;
        }

        var texturesReady = globalValue("ntextures", 0) >= globalValue("ntexmax", Infinity);
        var musicReady = globalValue("nmusicloaded", 0) >= globalValue("nmusicloadmax", Infinity);
        var gameReady = texturesReady
            && musicReady
            && globalValue("renderer", null)
            && globalValue("stage", null)
            && globalValue("canvas", [])[0];

        if (!gameReady) {
            window.setTimeout(startAutomationWhenReady, 50);
            return;
        }

        if (includeGlobalDetails && runtimeGlobalBaseline === null) {
            runtimeGlobalBaseline = new Set(Object.keys(window));
        }

        if (search.get("mute") !== "0" && window.Howler && typeof window.Howler.mute === "function") {
            window.Howler.mute(true);
        }

        window.stagecount = finiteNumber(search.get("stage"), globalValue("stagecount", 0));
        window.actcount = finiteNumber(search.get("act"), globalValue("actcount", 1));
        window.scene = finiteNumber(search.get("scene"), globalValue("scene", 0));
        window.ticks = finiteNumber(search.get("ticks"), globalValue("ticks", 0));
        window.skipscene = finiteNumber(search.get("skipScene"), globalValue("skipscene", 0));
        window.inputcontrol = search.get("input") || "key";
        installSeededRandom(search.get("seed"));

        var control = document.getElementById("control");
        if (control) {
            control.value = window.inputcontrol;
        }

        var gameCanvas = globalValue("canvas", [])[0];
        gameCanvas.style.display = "block";
        gameCanvas.style.position = "fixed";
        gameCanvas.style.top = "0";
        gameCanvas.style.cursor = "none";

        window.play = true;
        window.done = 1;

        if (search.get("sandbox") === "1") {
            var sandboxSettingsPanel = document.getElementById("settings");
            if (sandboxSettingsPanel) {
                sandboxSettingsPanel.remove();
            }
            window.done = 0;
            window.globalreset();
            window.clear_sprites(true);
            window.scene = finiteNumber(search.get("scene"), 98);
            window.stage.alpha = 1;
            window.globalfilters.twist.enabled = false;
        }
        else if (search.get("direct") === "1" && window.stagecount > 0) {
            var settingsPanel = document.getElementById("settings");
            if (settingsPanel) {
                settingsPanel.remove();
            }
            window.done = 0;
            window.globalreset();
            window.actcreate(window.actcount);
        }

        var spawnedEnemy = null;
        var enemyKind = search.get("spawnEnemy");
        if (enemyKind && window.EnemyFactory && window.EnemyFactory.has(enemyKind)) {
            spawnedEnemy = window.spawnEnemy(enemyKind, {
                active: finiteNumber(search.get("enemyActive"), 0),
                x: finiteNumber(search.get("enemyX"), 960),
                y: finiteNumber(search.get("enemyY"), 300),
                speedX: finiteNumber(search.get("enemySpeedX"), 0),
                speedY: finiteNumber(search.get("enemySpeedY"), 0),
                beatlayer: finiteNumber(search.get("enemyBeat"), 1),
            });
        }

        if (
            search.get("spawnBeatParticles") === "1"
            && window.set
            && typeof window.set.toenemy === "function"
            && window.EnemyFactory
        ) {
            var beatParticleTrack = search.get("beatParticleTrack") || "greengrass";
            var beatParticleTime = finiteNumber(search.get("beatParticleTime"), 7.069);
            if (!spawnedEnemy && window.EnemyFactory.has("balloon")) {
                spawnedEnemy = window.spawnEnemy("balloon", {
                    active: 0,
                    x: finiteNumber(search.get("enemyX"), 1280),
                    y: finiteNumber(search.get("enemyY"), 340),
                    speedX: 0,
                    speedY: 0,
                    beatlayer: 2,
                });
            }
            if (window.music[beatParticleTrack]) {
                window.playing = beatParticleTrack;
                window.music[beatParticleTrack].seek(beatParticleTime);
                window.music[beatParticleTrack].play();
                window.musictime = beatParticleTime;
            }
            if (spawnedEnemy) {
                var orphanBeatParticles = search.get("beatParticleOrphan") === "1";
                var lethalBeatParticles = search.get("beatParticleLethal") === "1";
                spawnedEnemy.ai = [[]];
                spawnedEnemy.phase = 0;
                if (lethalBeatParticles && typeof window.dief === "function") {
                    spawnedEnemy.ai[0].push(
                        window.dief.bind(spawnedEnemy, "balloon")
                    );
                }
                if (typeof window.hitf === "function") {
                    spawnedEnemy.ai[0].push(window.hitf.bind(spawnedEnemy));
                }
                if (orphanBeatParticles) {
                    spawnedEnemy.delete = true;
                }
                window.set.toenemy(
                    0,
                    finiteNumber(search.get("beatParticleX"), 520),
                    finiteNumber(search.get("beatParticleY"), 720),
                    {
                        amount: finiteNumber(search.get("beatParticleAmount"), 80),
                        damage: finiteNumber(search.get("beatParticleDamage"), 5),
                        target: spawnedEnemy,
                        color: {x: 90, y: 220, z: 255},
                    }
                );
            }
        }

        var legacyKind = search.get("spawnLegacy");
        if (legacyKind && typeof window.create === "function") {
            try {
                window.create(
                    finiteNumber(search.get("legacyActive"), 0),
                    legacyKind,
                    finiteNumber(search.get("legacyX"), 960),
                    finiteNumber(search.get("legacyY"), 300),
                    {
                        subtype: search.get("legacySubtype") || "none",
                        beatlayer: finiteNumber(search.get("legacyBeat"), 0),
                        speedX: finiteNumber(search.get("legacySpeedX"), 0),
                        speedY: finiteNumber(search.get("legacySpeedY"), 0),
                    }
                );
            }
            catch (error) {
                window.automationSpawnError = String(error);
                console.error("Automation legacy spawn failed", error);
            }
        }

        var extraKind = search.get("spawnExtra");
        if (extraKind && typeof window.extra === "function") {
            window.extra(
                finiteNumber(search.get("extraX"), 960),
                finiteNumber(search.get("extraY"), 300),
                extraKind
            );
        }

        var scoreStarCount = Math.max(
            0,
            Math.floor(finiteNumber(search.get("spawnScoreStars"), 0))
        );
        if (
            scoreStarCount > 0
            && window.set
            && typeof window.set.toscore === "function"
        ) {
            var scoreStarTrack = search.get("scoreStarTrack") || "greengrass";
            var scoreStarTime = finiteNumber(search.get("scoreStarTime"), 7.069);
            if (window.music[scoreStarTrack]) {
                window.playing = scoreStarTrack;
                window.music[scoreStarTrack].seek(scoreStarTime);
                window.music[scoreStarTrack].play();
                window.musictime = scoreStarTime;
            }

            for (var scoreStarIndex = 0;
                scoreStarIndex < scoreStarCount;
                scoreStarIndex++) {
                window.set.toscore(
                    finiteNumber(search.get("scoreStarX"), 520)
                        + scoreStarIndex
                        * finiteNumber(search.get("scoreStarSpacing"), 70),
                    finiteNumber(search.get("scoreStarY"), 720),
                    {
                        score: finiteNumber(search.get("scoreStarValue"), 5),
                    }
                );
            }
        }

        if (
            search.has("spawnTutorialGhost")
            && window.EnemyFactory
            && window.EnemyFactory.has("tutorialGhost")
        ) {
            window.spawnEnemy("tutorialGhost", {
                active: 0,
                type: finiteNumber(search.get("spawnTutorialGhost"), 4),
                x: finiteNumber(search.get("ghostX"), 960),
                y: finiteNumber(search.get("ghostY"), 300),
                layer: "front",
            });
        }

        if (
            search.get("spawnHeightmapCleanup") === "1"
            && window.set
            && typeof window.set.hill === "function"
        ) {
            window.set.hill(
                0,
                window.tex.hill1,
                window.tex.hill1_h,
                window.tex.hill1_n,
                1,
                0
            );
        }

        if (typeof window.syncAutomationMusicTime === "function") {
            window.syncAutomationMusicTime();
        }

        automationStarted = true;
        resolveAutomationReady();
    }

    window.setTimeout(startAutomationWhenReady, 0);
})();

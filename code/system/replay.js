(function installSoundStormReplay(root) {
    "use strict";

    var FORMAT_VERSION = 1;
    var DATABASE_NAME = "soundstorm-replays";
    var DATABASE_VERSION = 1;
    var STORE_NAME = "replays";
    var AUTOSAVE_INTERVAL_FRAMES = 300;
    var CHECKSUM_INTERVAL_FRAMES = 300;
    var UPLOAD_SCHEMA_VERSION = 2;
    var UPLOAD_RETRY_DELAYS_MS = [1000, 5000, 15000];
    var UPLOAD_EVENTS = Object.freeze({
        LIFE_LOST: "life-lost",
        LEVEL_CLEARED: "level-cleared",
        RUN_ENDED: "run-ended",
    });

    var FRAME_INPUT = 0;
    var FRAME_POINTER_X = 1;
    var FRAME_POINTER_Y = 2;
    var FRAME_MUSIC_TIME = 3;
    var FRAME_MUSIC_VOLUME = 4;
    var FRAME_RNG_BEFORE = 5;
    var FRAME_RNG_AFTER = 6;
    var FRAME_TRACK = 7;
    var FRAME_TRACK_PLAYING = 8;

    var INPUT_LEFT = 1 << 0;
    var INPUT_RIGHT = 1 << 1;
    var INPUT_UP = 1 << 2;
    var INPUT_DOWN = 1 << 3;
    var INPUT_SHOOT = 1 << 4;
    var INPUT_LASER = 1 << 5;
    var INPUT_TOUCH = 1 << 6;
    var INPUT_PAUSE_REQUEST = 1 << 7;
    var INPUT_IDLE = 1 << 9;
    var INPUT_WINDOW_PAUSE = 1 << 10;
    var INPUT_POINTER_PRIMARY = 1 << 11;

    var nativeRandom = Math.random.bind(Math);
    var randomState = 0;
    var randomActive = false;
    var mode = "idle";
    var activeReplay = null;
    var pendingFrame = null;
    var currentPlaybackFrame = null;
    var playbackCursor = 0;
    var playbackPaused = true;
    var seeking = false;
    var desync = null;
    var stateWarning = null;
    var restartRecordingAtMenu = false;
    var anonymousUploadSession = null;
    var replayUploadState = null;
    var persistPromise = Promise.resolve();
    var databasePromise = null;
    var memoryStore = new Map();
    var currentPointer = {
        global: {x: 960, y: 540},
        isPrimary: true,
    };
    var ui = {
        libraryButton: null,
        library: null,
        libraryContent: null,
        playback: null,
        playButton: null,
        slider: null,
        time: null,
        status: null,
        notice: null,
        saveCurrentButton: null,
    };

    function finiteNumber(value, fallback) {
        return Number.isFinite(Number(value)) ? Number(value) : fallback;
    }

    function rounded(value, digits) {
        if (!Number.isFinite(Number(value))) {
            return 0;
        }
        var factor = Math.pow(10, digits);
        return Math.round(Number(value) * factor) / factor;
    }

    function clonePlain(value, depth) {
        if (depth > 8 || value === null || typeof value === "undefined") {
            return value === null ? null : undefined;
        }
        if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
            return value;
        }
        if (Array.isArray(value)) {
            return value.map(function cloneArrayEntry(entry) {
                return clonePlain(entry, depth + 1);
            });
        }
        if (Object.prototype.toString.call(value) !== "[object Object]") {
            return undefined;
        }
        var result = {};
        Object.keys(value).forEach(function cloneObjectEntry(key) {
            if (typeof value[key] === "function") {
                return;
            }
            var cloned = clonePlain(value[key], depth + 1);
            if (typeof cloned !== "undefined") {
                result[key] = cloned;
            }
        });
        return result;
    }

    function assignPlain(target, values) {
        if (!target || !values) {
            return;
        }
        Object.keys(values).forEach(function assignValue(key) {
            if (typeof target[key] === "function") {
                return;
            }
            target[key] = clonePlain(values[key], 0);
        });
    }

    function randomSeed() {
        if (root.crypto && typeof root.crypto.getRandomValues === "function") {
            var values = new Uint32Array(1);
            root.crypto.getRandomValues(values);
            return values[0] >>> 0;
        }
        return Math.floor(nativeRandom() * 4294967296) >>> 0;
    }

    function replayRandom() {
        randomState = (randomState * 1664525 + 1013904223) >>> 0;
        return randomState / 4294967296;
    }

    function installRandom(seed) {
        randomState = Number(seed) >>> 0;
        randomActive = true;
        Math.random = replayRandom;
    }

    function setRandomState(state) {
        if (!randomActive) {
            installRandom(state);
            return;
        }
        randomState = Number(state) >>> 0;
    }

    function uninstallRandom() {
        Math.random = nativeRandom;
        randomActive = false;
    }

    function readLivePointer() {
        if (typeof root.readTouchPointer === "function") {
            return root.readTouchPointer(root.renderer, currentPointer);
        }
        var interaction = root.renderer
            && root.renderer.plugins
            && root.renderer.plugins.interaction;
        var events = root.renderer && root.renderer.events;
        var data = events && events.pointer
            || interaction && interaction.pointer
            || interaction && interaction.eventData && interaction.eventData.data;
        var global = data && data.global;
        if (!global || !Number.isFinite(global.x) || !Number.isFinite(global.y)) {
            return {global: {...currentPointer.global}, isPrimary: false};
        }
        var released = /^(pointerup|pointercancel|touchend|touchcancel|mouseup)/.test(data.type || "");
        var pressed = !released && (
            Number.isFinite(data.buttons) ? data.buttons > 0
            : Number.isFinite(data.pressure) ? data.pressure > 0
            : data.isPrimary === true
        );
        return {
            global: {
                x: finiteNumber(global.x, currentPointer.global.x),
                y: finiteNumber(global.y, currentPointer.global.y),
            },
            isPrimary: pressed,
        };
    }

    function currentPointerData() {
        if (mode === "playback") {
            return currentPointer;
        }
        return readLivePointer();
    }

    function inputMask(pointer) {
        var mask = 0;
        if (root.left) {mask |= INPUT_LEFT;}
        if (root.right) {mask |= INPUT_RIGHT;}
        if (root.up) {mask |= INPUT_UP;}
        if (root.down) {mask |= INPUT_DOWN;}
        if (root.shoot) {mask |= INPUT_SHOOT;}
        if (root.laser) {mask |= INPUT_LASER;}
        if (root.touch) {mask |= INPUT_TOUCH;}
        if (root.pause2) {mask |= INPUT_PAUSE_REQUEST;}
        if (root.remember && root.remember.idle) {mask |= INPUT_IDLE;}
        if (root.pause) {mask |= INPUT_WINDOW_PAUSE;}
        if (pointer && pointer.isPrimary !== false) {mask |= INPUT_POINTER_PRIMARY;}
        return mask;
    }

    function applyInput(frame) {
        var mask = Number(frame[FRAME_INPUT]) || 0;
        root.left = Boolean(mask & INPUT_LEFT);
        root.right = Boolean(mask & INPUT_RIGHT);
        root.up = Boolean(mask & INPUT_UP);
        root.down = Boolean(mask & INPUT_DOWN);
        root.shoot = Boolean(mask & INPUT_SHOOT);
        root.laser = Boolean(mask & INPUT_LASER);
        root.touch = Boolean(mask & INPUT_TOUCH);
        root.pause2 = Boolean(mask & INPUT_PAUSE_REQUEST);
        root.pause = Boolean(mask & INPUT_WINDOW_PAUSE);
        if (root.remember) {
            root.remember.idle = Boolean(mask & INPUT_IDLE);
        }
        currentPointer = {
            global: {
                x: finiteNumber(frame[FRAME_POINTER_X], 960),
                y: finiteNumber(frame[FRAME_POINTER_Y], 540),
            },
            isPrimary: Boolean(mask & INPUT_POINTER_PRIMARY),
        };
    }

    function currentTrackState() {
        var trackName = typeof root.playing === "string" ? root.playing : "";
        var track = root.music && root.music[trackName];
        var volume = track && typeof track.volume === "function"
            ? finiteNumber(track.volume(), 1)
            : 1;
        var isPlaying = track && typeof track.playing === "function"
            ? Boolean(track.playing())
            : false;
        var seek = track && typeof track.seek === "function"
            ? finiteNumber(track.seek(), 0)
            : 0;
        return {
            track: trackName,
            volume: volume,
            playing: isPlaying,
            seek: seek,
        };
    }

    function syncTrackForFrame(frame, includeSeek) {
        if (!frame || !root.music) {
            return;
        }
        var trackName = frame[FRAME_TRACK];
        if (trackName && root.music[trackName]) {
            root.playing = trackName;
        }
        var track = root.music[root.playing];
        if (!track) {
            return;
        }
        if (typeof track.volume === "function") {
            track.volume(finiteNumber(frame[FRAME_MUSIC_VOLUME], 1));
        }
        var shouldPlay = Boolean(frame[FRAME_TRACK_PLAYING]);
        var isPlaying = typeof track.playing === "function" ? track.playing() : false;
        if (shouldPlay && !isPlaying && typeof track.play === "function") {
            track.play();
        }
        else if (!shouldPlay && isPlaying && typeof track.pause === "function") {
            track.pause();
        }
        if (includeSeek && typeof track.seek === "function") {
            track.seek(finiteNumber(frame[FRAME_MUSIC_TIME], 0));
        }
    }

    function captureInitialState(seed) {
        var scalarNames = [
            "stagecount", "actcount", "scene", "ticks", "done", "dead",
            "score", "scoretotal", "highscore", "lifestock", "trystock",
            "laserstock", "invincible", "scoretimer", "startstage",
            "skipscene", "cantdie", "nobullets", "screensize", "inputcontrol",
            "tutorialgoals", "pause", "pauseactive", "pausepressed",
            "pausedown", "difftime", "beatlayer", "pace1", "bgchange",
            "bgspeedx", "bgspeedy", "musictime",
        ];
        var scalars = {};
        scalarNames.forEach(function captureScalar(name) {
            scalars[name] = clonePlain(root[name], 0);
        });
        return {
            seed: seed >>> 0,
            scalars: scalars,
            settings: clonePlain(root.settings, 0),
            difficulty: clonePlain(root.difficulty, 0),
            remember: clonePlain(root.remember, 0),
            temp: clonePlain(root.temp, 0),
            menuPosition: clonePlain(root.menuposition, 0),
            menuSelected: clonePlain(root.menuselected, 0),
            beat: clonePlain(root.beat, 0),
            prebeat: clonePlain(root.prebeat, 0),
            prebeatLayers: clonePlain(root.prebeat2, 0),
            soundBeat: clonePlain(root.soundbeat, 0),
            audio: currentTrackState(),
        };
    }

    function applyInitialState(initial) {
        if (!initial) {
            throw new Error("Replay has no initial state");
        }
        if (typeof root.clear_sprites === "function") {
            root.clear_sprites(true);
        }
        if (root.music) {
            Object.keys(root.music).forEach(function stopTrack(name) {
                var track = root.music[name];
                if (track && typeof track.stop === "function") {
                    track.stop();
                }
            });
        }
        assignPlain(root.settings, initial.settings);
        assignPlain(root.difficulty, initial.difficulty);
        assignPlain(root.remember, initial.remember);
        assignPlain(root.temp, initial.temp);
        Object.keys(initial.scalars || {}).forEach(function restoreScalar(name) {
            root[name] = clonePlain(initial.scalars[name], 0);
        });
        root.menuposition = clonePlain(initial.menuPosition, 0) || [1, 1, 1, 1];
        root.menuselected = clonePlain(initial.menuSelected, 0) || [0, 0, 0, 0];
        root.beat = clonePlain(initial.beat, 0) || [];
        root.prebeat = clonePlain(initial.prebeat, 0) || [];
        root.prebeat2 = clonePlain(initial.prebeatLayers, 0) || [];
        root.soundbeat = clonePlain(initial.soundBeat, 0) || [];
        root.playing = initial.audio && initial.audio.track || "nowloading";
        var track = root.music && root.music[root.playing];
        if (track) {
            if (typeof track.volume === "function") {
                track.volume(finiteNumber(initial.audio.volume, 1));
            }
            if (typeof track.seek === "function") {
                track.seek(finiteNumber(initial.audio.seek, 0));
            }
        }
        installRandom(initial.seed);
    }

    function hashText(text) {
        var hash = 2166136261;
        for (var index = 0; index < text.length; index++) {
            hash ^= text.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(16).padStart(8, "0");
    }

    function hashNumber(value) {
        return Number.isFinite(Number(value)) ? rounded(Number(value), 6) : null;
    }

    function computeChecksum() {
        var entities = Array.isArray(root.sprites) ? root.sprites : [];
        var entityState = entities.map(function checksumEntity(entity, index) {
            return [
                index,
                entity && (entity.entityType || entity.type || entity.name || ""),
                hashNumber(entity && entity.x),
                hashNumber(entity && entity.y),
                hashNumber(entity && entity.speedX),
                hashNumber(entity && entity.speedY),
                hashNumber(entity && entity.phase),
                hashNumber(entity && entity.health),
                hashNumber(entity && entity.hit),
                hashNumber(entity && entity.active),
                entity && entity.visible !== false ? 1 : 0,
                entity && entity.delete === true ? 1 : 0,
                entity && entity.collision || "none",
                clonePlain(entity && entity.counter, 0),
            ];
        });
        var state = {
            flow: [root.stagecount, root.actcount, root.scene, hashNumber(root.ticks), root.done, root.dead],
            player: [
                hashNumber(root.herox), hashNumber(root.heroy), hashNumber(root.lifestock),
                hashNumber(root.laserstock), root.score, root.scoretotal,
                hashNumber(root.invincible),
            ],
            rhythm: [hashNumber(root.musictime), clonePlain(root.beat, 0)],
            remember: clonePlain(root.remember, 0),
            temp: clonePlain(root.temp, 0),
            randomState: randomState >>> 0,
            entities: entityState,
        };
        return hashText(JSON.stringify(state));
    }

    function openDatabase() {
        if (databasePromise) {
            return databasePromise;
        }
        if (!root.indexedDB) {
            databasePromise = Promise.resolve(null);
            return databasePromise;
        }
        databasePromise = new Promise(function openReplayDatabase(resolve) {
            var request = root.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
            request.onupgradeneeded = function upgradeReplayDatabase() {
                var database = request.result;
                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    var store = database.createObjectStore(STORE_NAME, {keyPath: "id"});
                    store.createIndex("createdAt", "createdAt");
                }
            };
            request.onsuccess = function replayDatabaseOpened() {
                resolve(request.result);
            };
            request.onerror = function replayDatabaseFailed() {
                console.warn("Replay storage unavailable", request.error);
                resolve(null);
            };
        });
        return databasePromise;
    }

    function storeRequest(operation, fallback) {
        return openDatabase().then(function withReplayDatabase(database) {
            if (!database) {
                return fallback();
            }
            return new Promise(function runStoreOperation(resolve, reject) {
                var transaction = database.transaction(STORE_NAME, operation.mode || "readonly");
                var store = transaction.objectStore(STORE_NAME);
                var request = operation.run(store);
                request.onsuccess = function storeOperationComplete() {
                    resolve(request.result);
                };
                request.onerror = function storeOperationFailed() {
                    reject(request.error);
                };
            });
        });
    }

    function putReplay(replay) {
        memoryStore.set(replay.id, replay);
        return storeRequest({
            mode: "readwrite",
            run: function putReplayInStore(store) {return store.put(replay);},
        }, function putReplayInMemory() {return replay;});
    }

    function getReplay(id) {
        return storeRequest({
            run: function getReplayFromStore(store) {return store.get(id);},
        }, function getReplayFromMemory() {return memoryStore.get(id) || null;});
    }

    function listReplays() {
        return storeRequest({
            run: function listReplayStore(store) {return store.getAll();},
        }, function listMemoryReplays() {return Array.from(memoryStore.values());})
            .then(function sortReplays(replays) {
                return (replays || []).sort(function newestFirst(left, right) {
                    return String(right.createdAt).localeCompare(String(left.createdAt));
                });
            });
    }

    function deleteReplay(id) {
        memoryStore.delete(id);
        return storeRequest({
            mode: "readwrite",
            run: function deleteReplayFromStore(store) {return store.delete(id);},
        }, function deleteMemoryReplay() {return undefined;});
    }

    function replayId() {
        return "replay-" + Date.now().toString(36) + "-" + randomSeed().toString(16);
    }

    function attachAnonymousSession(gameId, localPlayCount) {
        if (
            mode !== "recording"
            || !/^[0-9a-f]{32}$/.test(String(gameId || ""))
        ) {
            return false;
        }
        var count = Number(localPlayCount);
        if (!Number.isSafeInteger(count) || count < 0) {
            return false;
        }
        anonymousUploadSession = {
            game: String(gameId),
            localPlayCount: count,
        };
        return true;
    }

    function localHostName(hostname) {
        return (
            hostname === "127.0.0.1"
            || hostname === "localhost"
            || hostname === "::1"
            || hostname === "[::1]"
        );
    }

    function usesLocalReplayBackend() {
        var location = root.location;
        if (!location || !localHostName(String(location.hostname || ""))) {
            return false;
        }
        if (!root.SOUNDSTORM_LOG_ENDPOINT) {
            return true;
        }
        try {
            var endpoint = new root.URL(
                String(root.SOUNDSTORM_LOG_ENDPOINT),
                location.href
            );
            return localHostName(endpoint.hostname);
        }
        catch (error) {
            return false;
        }
    }

    function replayUploadEnabled() {
        return Boolean(root.SOUNDSTORM_LOG_ENDPOINT) || usesLocalReplayBackend();
    }

    function localReplayBackendEndpoint() {
        return (
            String(root.location && root.location.protocol || "http:")
            + "//"
            + String(root.location && root.location.hostname || "127.0.0.1")
            + ":8088"
        );
    }

    function replayUploadEndpoint() {
        if (root.SOUNDSTORM_LOG_ENDPOINT) {
            return String(root.SOUNDSTORM_LOG_ENDPOINT);
        }
        if (usesLocalReplayBackend()) {
            return localReplayBackendEndpoint();
        }
        return "https://log.uhx.ch";
    }

    function loadBackendReplay(gameId) {
        var normalizedGameId = String(gameId || "");
        if (
            !root.location
            || !localHostName(String(root.location.hostname || ""))
            || !/^[0-9a-f]{32}$/.test(normalizedGameId)
            || typeof root.fetch !== "function"
        ) {
            return Promise.reject(new Error("Backend replay is unavailable"));
        }
        var endpoint = localReplayBackendEndpoint().replace(/\/+$/, "")
            + "/replay-view.php?game=" + encodeURIComponent(normalizedGameId);
        return root.fetch(endpoint, {
            method: "GET",
            mode: "cors",
            credentials: "omit",
            cache: "no-store",
            referrerPolicy: "no-referrer",
        }).then(function backendReplayResponse(response) {
            if (!response.ok) {
                throw new Error("Backend replay returned HTTP " + response.status);
            }
            return response.json();
        }).then(function backendReplayLoaded(replay) {
            return validateReplay(replay);
        });
    }

    function replaySegmentPayload(replay, state, eventType, finalSegment) {
        var startFrame = state.cursor;
        var endFrame = replay.frames.length;
        var sequence = state.sequence;
        return {
            formatVersion: FORMAT_VERSION,
            build: String(replay.build || "unknown").slice(0, 64),
            status: finalSegment ? "complete" : "recording",
            segment: {
                sequence: sequence,
                startFrame: startFrame,
                event: eventType,
                final: finalSegment,
            },
            initial: state.segmentInitial,
            frames: replay.frames.slice(startFrame, endFrame),
            checksums: replay.checksums.filter(function checksumInSegment(entry) {
                return Number(entry[0]) > startFrame && Number(entry[0]) <= endFrame;
            }),
            seenGameplay: Boolean(replay.seenGameplay),
            finishReason: finalSegment ? UPLOAD_EVENTS.RUN_ENDED : null,
            durationFrames: finalSegment ? endFrame : null,
        };
    }

    function canUploadReplay(replay, session, finalSegment) {
        return Boolean(
            session
            && replay.seenGameplay === true
            && (!finalSegment || replay.finishReason === UPLOAD_EVENTS.RUN_ENDED)
            && root.SOUNDSTORM_AUTOMATION !== true
            && root.settings
            && (
                root.settings.plattform !== "dev"
                || replayUploadEnabled()
            )
            && typeof root.fetch === "function"
        );
    }

    function sendReplaySegment(body, attempt) {
        var endpoint = replayUploadEndpoint().replace(/\/+$/, "") + "/replay.php";
        return root.fetch(endpoint, {
            method: "POST",
            mode: "cors",
            credentials: "omit",
            cache: "no-store",
            referrerPolicy: "no-referrer",
            keepalive: body.length <= 60000,
            headers: {"Content-Type": "application/json"},
            body: body,
        }).then(function replayUploadResponse(response) {
            if (!response.ok) {
                throw new Error("Replay upload returned HTTP " + response.status);
            }
            return true;
        }).catch(function retryReplaySegment() {
            if (attempt >= UPLOAD_RETRY_DELAYS_MS.length) {
                console.warn("Anonymous replay segment upload failed");
                return false;
            }
            return new Promise(function waitBeforeReplayRetry(resolve) {
                root.setTimeout(resolve, UPLOAD_RETRY_DELAYS_MS[attempt]);
            }).then(function resendReplaySegment() {
                return sendReplaySegment(body, attempt + 1);
            });
        });
    }

    function queueReplaySegment(replay, session, state, eventType, finalSegment) {
        if (
            !state
            || !canUploadReplay(replay, session, finalSegment)
            || (!finalSegment && replay.frames.length === state.cursor)
        ) {
            return Promise.resolve(false);
        }
        var replayPayload = replaySegmentPayload(
            replay,
            state,
            eventType,
            finalSegment
        );
        var body = JSON.stringify({
            schema_version: UPLOAD_SCHEMA_VERSION,
            game: session.game,
            local_play_count: session.localPlayCount,
            replay: replayPayload,
        });
        state.cursor = replay.frames.length;
        state.sequence++;
        state.segmentInitial = captureInitialState(randomState);
        state.chain = state.chain.then(function uploadQueuedReplaySegment() {
            return sendReplaySegment(body, 0).then(function rememberFailedSegment(success) {
                if (!success) {
                    state.failed.push(body);
                }
                return success;
            });
        });
        if (finalSegment) {
            state.chain = state.chain.then(function retryFailedReplaySegments() {
                var failed = state.failed.slice();
                state.failed.length = 0;
                return failed.reduce(function retryNextChunk(promise, failedBody) {
                    return promise.then(function retryOneSegment() {
                        return sendReplaySegment(failedBody, 0);
                    });
                }, Promise.resolve(true));
            });
        }
        return state.chain;
    }

    function startRecording(options) {
        options = options || {};
        if (root.SOUNDSTORM_AUTOMATION === true && options.force !== true) {
            return null;
        }
        if (mode === "playback") {
            return null;
        }
        if (mode === "recording") {
            return activeReplay;
        }
        var seed = Number.isFinite(Number(options.seed))
            ? Number(options.seed) >>> 0
            : randomSeed();
        installRandom(seed);
        var createdAt = new Date().toISOString();
        activeReplay = {
            id: options.id || replayId(),
            formatVersion: FORMAT_VERSION,
            build: root.settings && root.settings.number || "unknown",
            createdAt: createdAt,
            updatedAt: createdAt,
            status: "recording",
            title: options.title || "SoundStorm " + createdAt.slice(0, 19).replace("T", " "),
            initial: captureInitialState(seed),
            frames: [],
            checksums: [],
            seenGameplay: false,
        };
        mode = "recording";
        anonymousUploadSession = null;
        replayUploadState = {
            cursor: 0,
            sequence: 0,
            segmentInitial: activeReplay.initial,
            pendingEvent: null,
            chain: Promise.resolve(true),
            failed: [],
        };
        restartRecordingAtMenu = false;
        pendingFrame = null;
        desync = null;
        stateWarning = null;
        putReplay(activeReplay).catch(reportStorageError);
        updateUi();
        notify("REPLAY-AUFZEICHNUNG GESTARTET");
        return activeReplay;
    }

    function persistRecording() {
        if (mode !== "recording" || !activeReplay) {
            return Promise.resolve(null);
        }
        activeReplay.updatedAt = new Date().toISOString();
        var replayToPersist = activeReplay;
        persistPromise = persistPromise
            .catch(function ignorePriorPersistenceFailure() {})
            .then(function persistLatestReplay() {return putReplay(replayToPersist);})
            .catch(reportStorageError);
        return persistPromise;
    }

    function finalizeRecording(reason) {
        if (mode !== "recording" || !activeReplay) {
            return Promise.resolve(null);
        }
        activeReplay.status = "complete";
        activeReplay.finishedAt = new Date().toISOString();
        activeReplay.finishReason = reason || "manual";
        activeReplay.durationFrames = activeReplay.frames.length;
        activeReplay.updatedAt = activeReplay.finishedAt;
        var completed = activeReplay;
        var completedUploadSession = anonymousUploadSession;
        var completedUploadState = replayUploadState;
        var uploadPromise = reason === UPLOAD_EVENTS.RUN_ENDED
            ? queueReplaySegment(
                completed,
                completedUploadSession,
                completedUploadState,
                UPLOAD_EVENTS.RUN_ENDED,
                true
            )
            : completedUploadState.chain;
        mode = "idle";
        activeReplay = null;
        anonymousUploadSession = null;
        replayUploadState = null;
        pendingFrame = null;
        restartRecordingAtMenu = reason === "run-ended";
        if (reason === "run-ended" && typeof root.clearAnonymousGameSession === "function") {
            root.clearAnonymousGameSession();
        }
        uninstallRandom();
        updateUi();
        notify("REPLAY GESPEICHERT");
        return putReplay(completed).catch(function replayFinalizeFailed(error) {
            reportStorageError(error);
            return null;
        }).then(function waitForFinalReplayChunk() {
            return uploadPromise;
        }).then(function replayFinalized() {
            return completed;
        });
    }

    function markUploadEvent(eventType) {
        if (
            mode !== "recording"
            || !replayUploadState
            || (
                eventType !== UPLOAD_EVENTS.LIFE_LOST
                && eventType !== UPLOAD_EVENTS.LEVEL_CLEARED
            )
        ) {
            return false;
        }
        replayUploadState.pendingEvent = eventType;
        return true;
    }

    function reportStorageError(error) {
        console.error("Replay could not be saved", error);
        notify("REPLAY KONNTE NICHT GESPEICHERT WERDEN", true);
        return null;
    }

    function atRunMenuBoundary() {
        return root.stagecount === 0
            && (root.scene === 1 || (root.remember && root.remember.scoreattack && root.scene === 8));
    }

    function atWebDemoBoundary() {
        return root.settings && root.settings.version === "demo"
            && root.settings.plattform === "web"
            && root.stagecount === -1 && root.play === false;
    }

    function shouldDeferMenuReset() {
        if (!atRunMenuBoundary() || !activeReplay) {
            return false;
        }
        // Keep the terminal frame in the old recording. The next recording
        // must capture the clean state before the menu creates its entities.
        if (mode === "recording") {
            return Boolean(pendingFrame && activeReplay.seenGameplay);
        }
        // Playback must preserve that same final-step boundary.
        return mode === "playback"
            && Boolean(currentPlaybackFrame)
            && activeReplay.finishReason === "run-ended"
            && playbackCursor === activeReplay.frames.length - 1;
    }

    function beginSimulationStep() {
        if (
            mode === "idle"
            && restartRecordingAtMenu
            && atRunMenuBoundary()
        ) {
            startRecording();
        }
        if (mode === "playback") {
            if (!activeReplay || playbackCursor >= activeReplay.frames.length) {
                pausePlayback();
                return false;
            }
            currentPlaybackFrame = activeReplay.frames[playbackCursor];
            applyInput(currentPlaybackFrame);
            setRandomState(currentPlaybackFrame[FRAME_RNG_BEFORE]);
            syncTrackForFrame(currentPlaybackFrame, false);
            return true;
        }
        if (mode !== "recording" || !activeReplay) {
            return true;
        }
        var pointer = root.inputcontrol === "touch" ? readLivePointer() : null;
        var audio = currentTrackState();
        pendingFrame = [
            inputMask(pointer),
            pointer ? rounded(pointer.global.x, 3) : null,
            pointer ? rounded(pointer.global.y, 3) : null,
            0,
            rounded(audio.volume, 6),
            randomState >>> 0,
            0,
            audio.track,
            audio.playing ? 1 : 0,
        ];
        return true;
    }

    function endSimulationStep() {
        if (mode === "recording" && activeReplay && pendingFrame) {
            pendingFrame[FRAME_MUSIC_TIME] = rounded(root.musictime, 6);
            pendingFrame[FRAME_RNG_AFTER] = randomState >>> 0;
            activeReplay.frames.push(pendingFrame);
            pendingFrame = null;
            if (root.stagecount > 0) {
                activeReplay.seenGameplay = true;
            }
            var recordedFrame = activeReplay.frames.length;
            if (recordedFrame % CHECKSUM_INTERVAL_FRAMES === 0) {
                activeReplay.checksums.push([recordedFrame, computeChecksum()]);
            }
            if (recordedFrame % AUTOSAVE_INTERVAL_FRAMES === 0) {
                persistRecording();
            }
            if (replayUploadState && replayUploadState.pendingEvent) {
                var uploadEvent = replayUploadState.pendingEvent;
                replayUploadState.pendingEvent = null;
                queueReplaySegment(
                    activeReplay,
                    anonymousUploadSession,
                    replayUploadState,
                    uploadEvent,
                    false
                );
            }
            if (
                activeReplay.seenGameplay
                && (atRunMenuBoundary() || atWebDemoBoundary())
            ) {
                finalizeRecording("run-ended");
            }
        }
        else if (mode === "playback" && activeReplay && currentPlaybackFrame) {
            var expectedRandomState = Number(currentPlaybackFrame[FRAME_RNG_AFTER]) >>> 0;
            if ((randomState >>> 0) !== expectedRandomState && !desync) {
                desync = {
                    frame: playbackCursor + 1,
                    type: "random",
                    expected: expectedRandomState,
                    actual: randomState >>> 0,
                };
            }
            playbackCursor++;
            currentPlaybackFrame = null;
            checkPlaybackChecksum();
            if (!seeking && playbackCursor % 60 === 0) {
                synchronizePlaybackAudio();
            }
            if (desync) {
                pausePlayback();
                notify("REPLAY-ABWEICHUNG BEI FRAME " + desync.frame, true);
            }
            else if (playbackCursor >= activeReplay.frames.length) {
                pausePlayback();
            }
        }
        updateUi();
    }

    function checkPlaybackChecksum() {
        if (
            !activeReplay
            || playbackCursor % CHECKSUM_INTERVAL_FRAMES !== 0
            || desync
            || stateWarning
        ) {
            return;
        }
        var checkpoint = activeReplay.checksums.find(function matchingCheckpoint(entry) {
            return Number(entry[0]) === playbackCursor;
        });
        if (!checkpoint) {
            return;
        }
        var actual = computeChecksum();
        if (actual !== checkpoint[1]) {
            stateWarning = {
                frame: playbackCursor,
                type: "state",
                expected: checkpoint[1],
                actual: actual,
            };
            notify(
                "REPLAY-PRÜFWARNUNG BEI FRAME " + stateWarning.frame
                + " – WIEDERGABE LÄUFT WEITER"
            );
        }
    }

    function playbackMusicTime() {
        if (mode !== "playback" || !currentPlaybackFrame) {
            return null;
        }
        return finiteNumber(currentPlaybackFrame[FRAME_MUSIC_TIME], 0);
    }

    function synchronizePlaybackAudio() {
        if (mode !== "playback" || playbackCursor <= 0 || !root.music) {
            return;
        }
        var frame = activeReplay.frames[Math.min(playbackCursor - 1, activeReplay.frames.length - 1)];
        syncTrackForFrame(frame, false);
        var track = root.music[root.playing];
        if (!track) {
            return;
        }
        var targetTime = finiteNumber(frame[FRAME_MUSIC_TIME], 0);
        var actualTime = typeof track.seek === "function" ? finiteNumber(track.seek(), 0) : targetTime;
        if (typeof track.seek === "function" && Math.abs(actualTime - targetTime) > 0.08) {
            track.seek(targetTime);
        }
        var shouldPlay = Boolean(frame[FRAME_TRACK_PLAYING]) && !playbackPaused;
        var isPlaying = typeof track.playing === "function" ? track.playing() : false;
        if (shouldPlay && !isPlaying && typeof track.play === "function") {
            track.play();
        }
        else if (!shouldPlay && isPlaying && typeof track.pause === "function") {
            track.pause();
        }
    }

    function pausePlayback() {
        if (mode !== "playback") {
            return;
        }
        playbackPaused = true;
        if (root.gameClock && root.gameClock.running) {
            root.gameClock.stop();
        }
        var track = root.music && root.music[root.playing];
        if (track && typeof track.pause === "function") {
            track.pause();
        }
        updateUi();
    }

    function resumePlayback() {
        if (mode !== "playback" || desync || playbackCursor >= activeReplay.frames.length) {
            return;
        }
        playbackPaused = false;
        if (root.Howler && typeof root.Howler.mute === "function") {
            root.Howler.mute(false);
        }
        synchronizePlaybackAudio();
        if (root.gameClock && !root.gameClock.running) {
            root.gameClock.start();
        }
        updateUi();
    }

    function togglePlayback() {
        if (playbackPaused) {
            resumePlayback();
        }
        else {
            pausePlayback();
        }
    }

    function seekPlayback(targetFrame) {
        if (mode !== "playback" || !activeReplay) {
            return;
        }
        var target = Math.max(0, Math.min(
            activeReplay.frames.length,
            Math.round(finiteNumber(targetFrame, 0))
        ));
        pausePlayback();
        if (target < playbackCursor) {
            var url = new URL(root.location.href);
            url.searchParams.set("replay", activeReplay.id);
            url.searchParams.set("tick", target);
            url.searchParams.set("paused", "1");
            root.location.replace(url.toString());
            return;
        }
        fastForward(target - playbackCursor);
    }

    function fastForward(frameCount) {
        if (mode !== "playback" || frameCount <= 0) {
            if (root.renderGameFrame) {
                root.renderGameFrame();
            }
            updateUi();
            return;
        }
        seeking = true;
        if (root.Howler && typeof root.Howler.mute === "function") {
            root.Howler.mute(true);
        }
        try {
            root.gameClock.runExactFrames(frameCount, {render: true});
        }
        finally {
            seeking = false;
        }
        synchronizePlaybackAudio();
        updateUi();
    }

    function validateReplay(replay) {
        if (!replay || Number(replay.formatVersion) !== FORMAT_VERSION) {
            throw new Error("Unsupported replay format");
        }
        if (!replay.initial || !Array.isArray(replay.frames)) {
            throw new Error("Incomplete replay data");
        }
        return replay;
    }

    function preparePlayback(replay, targetFrame) {
        validateReplay(replay);
        if (root.gameClock) {
            root.gameClock.stop();
            root.gameClock.simulationFrame = 0;
        }
        applyInitialState(replay.initial);
        activeReplay = replay;
        mode = "playback";
        playbackCursor = 0;
        playbackPaused = true;
        currentPlaybackFrame = null;
        desync = null;
        stateWarning = null;
        root.play = true;
        var gameCanvas = root.canvas && root.canvas[0];
        if (gameCanvas) {
            gameCanvas.style.display = "block";
            gameCanvas.style.position = "fixed";
            gameCanvas.style.top = "0";
            gameCanvas.style.cursor = "default";
        }
        showPlaybackUi();
        fastForward(Math.max(0, Math.min(replay.frames.length, targetFrame)));
    }

    function readyForPlayback() {
        return finiteNumber(root.ntextures, 0) >= finiteNumber(root.ntexmax, Infinity)
            && finiteNumber(root.nmusicloaded, 0) >= finiteNumber(root.nmusicloadmax, Infinity)
            && root.renderer
            && root.stage
            && root.gameClock
            && root.canvas
            && root.canvas[0];
    }

    function waitForPlaybackReady(replay, targetFrame) {
        if (!readyForPlayback()) {
            root.setTimeout(function retryPlaybackReady() {
                waitForPlaybackReady(replay, targetFrame);
            }, 50);
            return;
        }
        preparePlayback(replay, targetFrame);
    }

    function bootstrapPlaybackFromUrl() {
        if (!root.location || !root.URLSearchParams) {
            return;
        }
        var search = new URLSearchParams(root.location.search);
        var backendGameId = search.get("backendReplay");
        var target = Math.max(0, Math.round(finiteNumber(search.get("tick"), 0)));
        if (backendGameId) {
            loadBackendReplay(backendGameId).then(function backendReplayLoaded(replay) {
                waitForPlaybackReady(replay, target);
            }).catch(function backendReplayLoadFailed(error) {
                console.error(error);
                notify("BACKEND-REPLAY KONNTE NICHT GELADEN WERDEN", true);
            });
            return;
        }
        var id = search.get("replay");
        if (!id) {
            return;
        }
        getReplay(id).then(function replayLoaded(replay) {
            if (!replay) {
                throw new Error("Replay not found: " + id);
            }
            waitForPlaybackReady(validateReplay(replay), target);
        }).catch(function replayLoadFailed(error) {
            console.error(error);
            notify("REPLAY KONNTE NICHT GELADEN WERDEN", true);
        });
    }

    function watchReplay(id) {
        var url = new URL(root.location.href);
        ["automation", "direct", "sandbox", "seed", "stage", "act", "scene", "ticks"]
            .forEach(function removeDiagnosticParameter(name) {
                url.searchParams.delete(name);
            });
        url.searchParams.delete("backendReplay");
        url.searchParams.set("replay", id);
        url.searchParams.set("tick", "0");
        url.searchParams.set("paused", "1");
        root.location.href = url.toString();
    }

    function exitPlayback() {
        var url = new URL(root.location.href);
        url.searchParams.delete("replay");
        url.searchParams.delete("backendReplay");
        url.searchParams.delete("tick");
        url.searchParams.delete("paused");
        root.location.href = url.toString();
    }

    function formatDuration(frames) {
        var totalSeconds = Math.floor(Number(frames || 0) / 60);
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds % 60;
        return minutes + ":" + String(seconds).padStart(2, "0");
    }

    function button(label, action) {
        var element = document.createElement("button");
        element.type = "button";
        element.textContent = label;
        element.addEventListener("click", action);
        return element;
    }

    function notify(message, error) {
        if (!root.document) {
            return;
        }
        if (!ui.notice) {
            ui.notice = document.createElement("div");
            ui.notice.className = "soundstorm-replay-notice";
            document.documentElement.appendChild(ui.notice);
        }
        ui.notice.textContent = message;
        ui.notice.dataset.error = error ? "1" : "0";
        ui.notice.classList.add("visible");
        root.setTimeout(function hideReplayNotice() {
            if (ui.notice) {
                ui.notice.classList.remove("visible");
            }
        }, 2600);
    }

    function closeLibrary() {
        if (ui.library) {
            ui.library.classList.remove("visible");
        }
    }

    function exportReplay(replay) {
        var blob = new Blob([JSON.stringify(replay)], {type: "application/json"});
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.href = url;
        link.download = replay.id + ".soundstorm-replay.json";
        link.click();
        root.setTimeout(function releaseReplayDownload() {URL.revokeObjectURL(url);}, 0);
    }

    function renderLibrary() {
        if (!ui.libraryContent) {
            return;
        }
        ui.libraryContent.textContent = "REPLAYS WERDEN GELADEN ...";
        listReplays().then(function replayListLoaded(replays) {
            ui.libraryContent.textContent = "";
            if (!replays.length) {
                ui.libraryContent.textContent = "NOCH KEINE AUFNAHMEN";
                return;
            }
            replays.forEach(function renderReplayEntry(replay) {
                var row = document.createElement("div");
                row.className = "soundstorm-replay-row";
                var description = document.createElement("div");
                description.className = "soundstorm-replay-description";
                description.textContent = replay.title
                    + "  |  " + formatDuration(replay.frames && replay.frames.length)
                    + "  |  " + (replay.status === "complete" ? "GESPEICHERT" : "ZWISCHENSTAND");
                var actions = document.createElement("div");
                actions.appendChild(button("ANSCHAUEN", function watchStoredReplay() {
                    watchReplay(replay.id);
                }));
                actions.appendChild(button("EXPORT", function exportStoredReplay() {
                    exportReplay(replay);
                }));
                actions.appendChild(button("LÖSCHEN", function deleteStoredReplay() {
                    if (!root.confirm("DIESES REPLAY LÖSCHEN?")) {
                        return;
                    }
                    deleteReplay(replay.id).then(renderLibrary);
                }));
                row.appendChild(description);
                row.appendChild(actions);
                ui.libraryContent.appendChild(row);
            });
        }).catch(reportStorageError);
    }

    function openLibrary() {
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(function ignoreFullscreenExit() {});
        }
        if (mode === "recording") {
            persistRecording().then(renderLibrary);
        }
        else {
            renderLibrary();
        }
        ui.library.classList.add("visible");
    }

    function createLibraryUi() {
        ui.libraryButton = button("REPLAYS", openLibrary);
        ui.libraryButton.id = "soundstorm-replays-button";
        document.documentElement.appendChild(ui.libraryButton);

        ui.library = document.createElement("div");
        ui.library.id = "soundstorm-replay-library";
        var panel = document.createElement("div");
        panel.className = "soundstorm-replay-panel";
        var heading = document.createElement("h2");
        heading.textContent = "GESPEICHERTE REPLAYS";
        panel.appendChild(heading);
        ui.libraryContent = document.createElement("div");
        panel.appendChild(ui.libraryContent);
        var footer = document.createElement("div");
        footer.className = "soundstorm-replay-footer";
        ui.saveCurrentButton = button("AKTUELLE AUFNAHME SPEICHERN", function saveCurrentReplay() {
            finalizeRecording("manual").then(renderLibrary);
        });
        footer.appendChild(ui.saveCurrentButton);
        footer.appendChild(button("SCHLIESSEN", closeLibrary));
        panel.appendChild(footer);
        ui.library.appendChild(panel);
        document.documentElement.appendChild(ui.library);
    }

    function seekBy(seconds) {
        seekPlayback(playbackCursor + Math.round(seconds * 60));
    }

    function createPlaybackUi() {
        ui.playback = document.createElement("div");
        ui.playback.id = "soundstorm-replay-controls";
        ui.playButton = button("PLAY", togglePlayback);
        ui.playback.appendChild(button("−10S", function rewindTenSeconds() {seekBy(-10);}));
        ui.playback.appendChild(button("−1S", function rewindOneSecond() {seekBy(-1);}));
        ui.playback.appendChild(ui.playButton);
        ui.playback.appendChild(button("+1S", function forwardOneSecond() {seekBy(1);}));
        ui.playback.appendChild(button("+10S", function forwardTenSeconds() {seekBy(10);}));
        ui.slider = document.createElement("input");
        ui.slider.type = "range";
        ui.slider.min = "0";
        ui.slider.step = "1";
        ui.slider.addEventListener("change", function seekFromSlider() {
            seekPlayback(Number(ui.slider.value));
        });
        ui.playback.appendChild(ui.slider);
        ui.time = document.createElement("span");
        ui.playback.appendChild(ui.time);
        ui.status = document.createElement("span");
        ui.playback.appendChild(ui.status);
        ui.playback.appendChild(button("BEENDEN", exitPlayback));
        document.documentElement.appendChild(ui.playback);
    }

    function showPlaybackUi() {
        if (ui.playback) {
            ui.playback.classList.add("visible");
        }
        if (ui.libraryButton) {
            ui.libraryButton.style.display = "none";
        }
    }

    function installStyles() {
        var style = document.createElement("style");
        style.textContent = "\n"
            + "#soundstorm-replays-button{display:none!important;position:fixed;right:18px;top:18px;z-index:10002;padding:10px 16px;background:#111;color:#fff;border:1px solid #fff;font:18px monospace;cursor:pointer}\n"
            + "#soundstorm-replay-library{display:none;position:fixed;inset:0;z-index:10004;background:rgba(0,0,0,.88);align-items:center;justify-content:center;color:#fff;font:18px monospace;text-transform:uppercase}\n"
            + "#soundstorm-replay-library.visible{display:flex}\n"
            + ".soundstorm-replay-panel{width:min(1000px,92vw);max-height:82vh;overflow:auto;background:#080808;border:2px solid #fff;padding:24px}\n"
            + ".soundstorm-replay-panel h2{margin:0 0 22px;font:32px monospace}\n"
            + ".soundstorm-replay-row{display:flex;gap:20px;align-items:center;justify-content:space-between;border-top:1px solid #666;padding:14px 0}\n"
            + ".soundstorm-replay-row button,.soundstorm-replay-footer button,#soundstorm-replay-controls button{margin:3px;padding:8px 12px;background:#181818;color:#fff;border:1px solid #bbb;font:15px monospace;cursor:pointer}\n"
            + ".soundstorm-replay-footer{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}\n"
            + "#soundstorm-replay-controls{display:none;position:fixed;left:0;right:0;bottom:0;z-index:10003;align-items:center;gap:6px;padding:8px 12px;background:rgba(0,0,0,.9);color:#fff;font:15px monospace;text-transform:uppercase}\n"
            + "#soundstorm-replay-controls.visible{display:flex}\n"
            + "#soundstorm-replay-controls input[type=range]{flex:1;min-width:120px}\n"
            + ".soundstorm-replay-notice{position:fixed;left:50%;top:24px;z-index:10005;transform:translate(-50%,-20px);opacity:0;padding:12px 18px;background:#111;color:#fff;border:1px solid #fff;font:18px monospace;pointer-events:none;transition:.2s}\n"
            + ".soundstorm-replay-notice[data-error='1']{border-color:#f44;color:#f88}\n"
            + ".soundstorm-replay-notice.visible{transform:translate(-50%,0);opacity:1}\n";
        document.head.appendChild(style);
    }

    function updateUi() {
        if (ui.saveCurrentButton) {
            ui.saveCurrentButton.style.display = mode === "recording" ? "inline-block" : "none";
        }
        if (ui.libraryButton) {
            ui.libraryButton.style.display = mode === "playback"
                || (root.play && Number(root.stagecount) > 0)
                ? "none"
                : "block";
        }
        if (mode !== "playback" || !activeReplay || !ui.playback) {
            return;
        }
        ui.playButton.textContent = playbackPaused ? "PLAY" : "PAUSE";
        ui.slider.max = String(activeReplay.frames.length);
        ui.slider.value = String(playbackCursor);
        ui.time.textContent = formatDuration(playbackCursor)
            + " / " + formatDuration(activeReplay.frames.length);
        var replayLabel = activeReplay.source === "backend"
            ? "BACKEND · " + String(activeReplay.backendEvent || "REPLAY").toUpperCase()
            : "REPLAY";
        ui.status.textContent = desync
            ? "ABWEICHUNG BEI FRAME " + desync.frame
            : stateWarning
                ? "PRÜFWARNUNG AB FRAME " + stateWarning.frame
                : seeking ? "WIRD WIEDERHERGESTELLT ..." : replayLabel;
        ui.status.style.color = desync
            ? "#ff6666"
            : stateWarning ? "#d8b65c" : "#ffffff";
    }

    function installUi() {
        if (!root.document || root.SOUNDSTORM_AUTOMATION === true) {
            return;
        }
        installStyles();
        createLibraryUi();
        createPlaybackUi();
        updateUi();
        document.addEventListener("keydown", function replayKeyboardControls(event) {
            if (event.key === "F8") {
                event.preventDefault();
                openLibrary();
                return;
            }
            if (mode !== "playback") {
                return;
            }
            if (event.code === "Space") {
                event.preventDefault();
                togglePlayback();
            }
            else if (event.key === "ArrowLeft") {
                event.preventDefault();
                seekBy(event.shiftKey ? -10 : -1);
            }
            else if (event.key === "ArrowRight") {
                event.preventDefault();
                seekBy(event.shiftKey ? 10 : 1);
            }
            else if (event.key === "Home") {
                event.preventDefault();
                seekPlayback(0);
            }
            else if (event.key === "Escape") {
                event.preventDefault();
                exitPlayback();
            }
        });
    }

    function status() {
        return {
            mode: mode,
            id: activeReplay && activeReplay.id || null,
            frame: mode === "playback"
                ? playbackCursor
                : activeReplay && activeReplay.frames.length || 0,
            frames: activeReplay && activeReplay.frames.length || 0,
            paused: playbackPaused,
            seeking: seeking,
            desync: desync,
            warning: stateWarning,
        };
    }

    var ReplaySystem = Object.freeze({
        FORMAT_VERSION: FORMAT_VERSION,
        startRecording: startRecording,
        attachAnonymousSession: attachAnonymousSession,
        usesLocalReplayBackend: usesLocalReplayBackend,
        replayUploadEnabled: replayUploadEnabled,
        markUploadEvent: markUploadEvent,
        shouldDeferMenuReset: shouldDeferMenuReset,
        persistRecording: persistRecording,
        flushUploads: function flushReplayUploads() {
            return replayUploadState ? replayUploadState.chain : Promise.resolve(true);
        },
        finalizeRecording: finalizeRecording,
        beginSimulationStep: beginSimulationStep,
        endSimulationStep: endSimulationStep,
        currentPointerData: currentPointerData,
        playbackMusicTime: playbackMusicTime,
        pause: pausePlayback,
        resume: resumePlayback,
        toggle: togglePlayback,
        seek: seekPlayback,
        watch: watchReplay,
        loadBackend: loadBackendReplay,
        exit: exitPlayback,
        list: listReplays,
        get: getReplay,
        remove: deleteReplay,
        status: status,
        isPlayback: function isPlayback() {return mode === "playback";},
        isRecording: function isRecording() {return mode === "recording";},
        isSeeking: function isSeeking() {return seeking;},
        _test: Object.freeze({
            installRandom: installRandom,
            setRandomState: setRandomState,
            randomState: function readRandomState() {return randomState >>> 0;},
            inputMask: inputMask,
            applyInput: applyInput,
            validateReplay: validateReplay,
            computeChecksum: computeChecksum,
            constants: Object.freeze({
                INPUT_LEFT: INPUT_LEFT,
                INPUT_RIGHT: INPUT_RIGHT,
                INPUT_SHOOT: INPUT_SHOOT,
                INPUT_POINTER_PRIMARY: INPUT_POINTER_PRIMARY,
                UPLOAD_EVENTS: UPLOAD_EVENTS,
            }),
        }),
    });

    root.GameRandom = Object.freeze({
        next: replayRandom,
        seed: installRandom,
        getState: function getGameRandomState() {return randomState >>> 0;},
        setState: setRandomState,
    });
    root.ReplaySystem = ReplaySystem;

    if (root.addEventListener) {
        root.addEventListener("pagehide", function saveReplayOnPageHide() {
            if (mode === "recording") {
                persistRecording();
            }
        });
    }
    installUi();
    bootstrapPlaybackFromUrl();
})(typeof window === "undefined" ? globalThis : window);

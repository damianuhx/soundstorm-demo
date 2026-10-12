(function exposeFixedStepClock(root) {
    "use strict";

    var DEFAULT_STEP_MS = 1000 / 60;
    var EPSILON_MS = 0.000001;

    function noop() {}

    function FixedStepClock(options) {
        options = options || {};

        this.stepMs = options.stepMs || DEFAULT_STEP_MS;
        this.maxFrameDeltaMs = options.maxFrameDeltaMs || 250;
        this.maxCatchUpSteps = options.maxCatchUpSteps || 8;
        this.manual = options.manual === true;

        this.onStep = options.onStep || noop;
        this.onRender = options.onRender || noop;
        this.onInterStepCleanup = options.onInterStepCleanup || noop;
        this.onAfterRender = options.onAfterRender || noop;
        this.onDroppedTime = options.onDroppedTime || noop;

        this.requestFrame = options.requestFrame || function requestBrowserFrame(callback) {
            return root.requestAnimationFrame(callback);
        };
        this.cancelFrame = options.cancelFrame || function cancelBrowserFrame(id) {
            if (typeof root.cancelAnimationFrame === "function") {
                root.cancelAnimationFrame(id);
            }
        };

        this.running = false;
        this.frameId = null;
        this.lastTimestamp = null;
        this.accumulatorMs = 0;
        this.simulationFrame = 0;

        this.frame = this.frame.bind(this);
    }

    FixedStepClock.prototype.start = function start() {
        if (this.running) {
            return;
        }

        this.running = true;
        this.lastTimestamp = null;

        if (this.manual) {
            this.onRender(0);
            this.onAfterRender();
            return;
        }

        this.frameId = this.requestFrame(this.frame);
    };

    FixedStepClock.prototype.stop = function stop() {
        if (this.frameId !== null) {
            this.cancelFrame(this.frameId);
        }

        this.running = false;
        this.frameId = null;
        this.lastTimestamp = null;
        this.accumulatorMs = 0;
    };

    FixedStepClock.prototype.reset = function reset() {
        this.lastTimestamp = null;
        this.accumulatorMs = 0;
    };

    FixedStepClock.prototype.runSteps = function runSteps(elapsedMs, capped) {
        this.accumulatorMs += elapsedMs;

        var steps = 0;
        var stepLimit = capped ? this.maxCatchUpSteps : Infinity;

        while (
            this.accumulatorMs + EPSILON_MS >= this.stepMs
            && steps < stepLimit
        ) {
            this.onStep(this.stepMs / 1000);
            this.accumulatorMs -= this.stepMs;
            this.simulationFrame++;
            steps++;

            if (this.accumulatorMs + EPSILON_MS >= this.stepMs) {
                this.onInterStepCleanup();
            }
        }

        if (
            capped
            && steps === this.maxCatchUpSteps
            && this.accumulatorMs + EPSILON_MS >= this.stepMs
        ) {
            var droppedMs = this.accumulatorMs - (this.accumulatorMs % this.stepMs);
            this.accumulatorMs %= this.stepMs;
            this.onDroppedTime(droppedMs);
        }

        return steps;
    };

    FixedStepClock.prototype.render = function render() {
        this.onRender(this.accumulatorMs / this.stepMs);
        this.onAfterRender();
    };

    FixedStepClock.prototype.frame = function frame(timestamp) {
        if (!this.running || this.manual) {
            return;
        }

        if (this.lastTimestamp === null) {
            this.lastTimestamp = timestamp;
        } else {
            var elapsedMs = Math.max(
                0,
                Math.min(timestamp - this.lastTimestamp, this.maxFrameDeltaMs)
            );
            this.lastTimestamp = timestamp;
            this.runSteps(elapsedMs, true);
        }

        this.render();

        if (this.running) {
            this.frameId = this.requestFrame(this.frame);
        }
    };

    FixedStepClock.prototype.advanceTime = function advanceTime(elapsedMs, options) {
        if (!this.manual) {
            throw new Error("advanceTime is only available in manual mode");
        }
        if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
            throw new TypeError("elapsedMs must be finite and non-negative");
        }

        options = options || {};
        var steps = this.runSteps(elapsedMs, false);

        if (options.render !== false) {
            this.render();
        }

        return {
            steps: steps,
            simulationFrame: this.simulationFrame,
            remainderMs: this.accumulatorMs,
        };
    };

    FixedStepClock.prototype.advanceFrames = function advanceFrames(frameCount, options) {
        if (!Number.isInteger(frameCount) || frameCount < 0) {
            throw new TypeError("frameCount must be a non-negative integer");
        }

        options = options || {};
        var result = {
            steps: 0,
            simulationFrame: this.simulationFrame,
            remainderMs: this.accumulatorMs,
        };

        for (var frame = 0; frame < frameCount; frame++) {
            result = this.advanceTime(this.stepMs, {
                render: options.renderEachFrame === true,
            });
        }

        if (options.renderEachFrame !== true && options.render !== false) {
            this.render();
        }

        result.steps = frameCount;
        return result;
    };

    FixedStepClock.prototype.runExactFrames = function runExactFrames(frameCount, options) {
        if (!Number.isInteger(frameCount) || frameCount < 0) {
            throw new TypeError("frameCount must be a non-negative integer");
        }

        options = options || {};
        for (var frame = 0; frame < frameCount; frame++) {
            this.onStep(this.stepMs / 1000);
            this.simulationFrame++;
            if (frame < frameCount - 1) {
                this.onInterStepCleanup();
            }
        }

        if (options.render !== false) {
            this.render();
        }

        return {
            steps: frameCount,
            simulationFrame: this.simulationFrame,
            remainderMs: this.accumulatorMs,
        };
    };

    root.FixedStepClock = FixedStepClock;
})(typeof window === "undefined" ? globalThis : window);

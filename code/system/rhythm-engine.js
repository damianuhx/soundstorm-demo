var RhythmEngine = (function createRhythmEngine() {
    "use strict";

    function createFrame() {
        return {
            beat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            prebeat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            prebeat2: [[], [], [], [], [], [], [], [], []],
        };
    }

    function addFutureBeat(frame, remaining, layer, preflashRange) {
        frame.prebeat2[layer].push(
            1 - (preflashRange - remaining) / preflashRange,
        );
    }

    function collectFutureBeats(
        frame,
        row,
        cycleTime,
        modulo,
        preflashRange,
    ) {
        if (row[0] >= 100) {
            return;
        }

        var futureCycleTime = cycleTime;
        var remaining = preflashRange;

        while (remaining > 0) {
            var peakTime = row[2];
            var reachesPeakInRange = (
                peakTime >= futureCycleTime
                && remaining - peakTime + futureCycleTime > 0
            );

            if (reachesPeakInRange) {
                remaining -= peakTime - futureCycleTime;
                addFutureBeat(
                    frame,
                    remaining,
                    row[0],
                    preflashRange,
                );
                futureCycleTime = peakTime;
            }

            remaining -= modulo - futureCycleTime;
            futureCycleTime = 0;
        }
    }

    function updateCue(row, rowIndex, cycleTime, cueState, playCue) {
        if (typeof row[6] !== "string") {
            return;
        }

        var cueOffset = row[7] || 0;
        var cueTime = cycleTime - cueOffset;
        var cueIsActive = cueTime >= row[2] && cueTime < row[4];

        if (cueIsActive) {
            if (cueState[rowIndex] == 0) {
                playCue(row[6]);
                cueState[rowIndex] = 1;
            }
        } else {
            cueState[rowIndex] = 0;
        }
    }

    function writePulse(frame, row, strength, assign) {
        var layer = row[0];

        // The original format uses layers 101-108 for pseudo-beats. Keep
        // destination selection dependent on the current normal-beat value:
        // this is observable when rows overlap or use unusually high gains.
        if (frame.beat[layer] < 100) {
            if (assign) {
                frame.beat[layer] = +strength;
            } else {
                frame.beat[layer] += strength;
            }
        } else if (assign) {
            frame.prebeat[layer - 100] = +strength;
        } else {
            frame.prebeat[layer - 100] += strength;
        }
    }

    function evaluatePulse(frame, row, cycleTime) {
        var riseStart = row[1];
        var peakStart = row[2];
        var peakEnd = row[3];
        var decayEnd = row[4];
        var maximum = row[5];

        // Branch order and half-open boundaries are part of the rhythm data
        // contract. In particular, a plateau assigns while slopes add.
        if (cycleTime >= peakEnd && cycleTime < decayEnd) {
            writePulse(
                frame,
                row,
                (decayEnd - cycleTime)
                    / (decayEnd - peakEnd)
                    * maximum,
                false,
            );
        } else if (cycleTime >= riseStart && cycleTime < peakStart) {
            writePulse(
                frame,
                row,
                (cycleTime - riseStart)
                    / (peakStart - riseStart)
                    * maximum,
                false,
            );
        } else if (cycleTime >= peakStart && cycleTime < peakEnd) {
            writePulse(frame, row, maximum, true);
        }
    }

    function nextPeak(options) {
        var segments = options.segments || [];
        var layer = options.layer || 0;
        var threshold = Number(options.time) || 0;
        var candidate = Infinity;
        var epsilon = 0.000000001;

        for (var segmentIndex = 0;
            segmentIndex < segments.length;
            segmentIndex++) {
            var segment = segments[segmentIndex];
            if (!(segment.modulo > 0) || segment.max < threshold) {
                continue;
            }

            for (var rowIndex = 0;
                rowIndex < segment.beats.length;
                rowIndex++) {
                var row = segment.beats[rowIndex];
                if (row[0] !== layer) {
                    continue;
                }

                var firstAllowed = Math.max(threshold, segment.min);
                var peakInFirstCycle = segment.offset + row[2];
                var cycle = Math.ceil(
                    (firstAllowed - peakInFirstCycle) / segment.modulo
                    - epsilon
                );
                var peak = peakInFirstCycle + cycle * segment.modulo;

                if (
                    peak + epsilon >= firstAllowed
                    && peak >= segment.min - epsilon
                    && peak <= segment.max + epsilon
                    && peak < candidate
                ) {
                    candidate = peak;
                }
            }
        }

        return Number.isFinite(candidate) ? candidate : null;
    }

    function sample(options) {
        var frame = createFrame();

        if (!(options.volume > 0.3)) {
            return frame;
        }

        var segments = options.segments;
        for (var segmentIndex = 0;
            segmentIndex < segments.length;
            segmentIndex++) {
            var segment = segments[segmentIndex];
            var isActive = (
                segment.min <= options.time
                && segment.max >= options.time
            );

            if (!isActive) {
                continue;
            }

            var cycleTime = (
                (options.time - segment.offset) % segment.modulo
            );
            var rows = segment.beats;

            for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                var row = rows[rowIndex];
                collectFutureBeats(
                    frame,
                    row,
                    cycleTime,
                    segment.modulo,
                    options.preflashRange,
                );
                updateCue(
                    row,
                    rowIndex,
                    cycleTime,
                    options.cueState,
                    options.playCue,
                );
                evaluatePulse(frame, row, cycleTime);
            }
        }

        return frame;
    }

    return Object.freeze({
        sample: sample,
        nextPeak: nextPeak,
    });
}());

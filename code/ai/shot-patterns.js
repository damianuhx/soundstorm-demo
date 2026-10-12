var ShotPatterns = (function createShotPatterns() {
    "use strict";

    function legacyOption(options, key, fallback) {
        return options[key] || fallback;
    }

    function sweepOptions(rawOptions) {
        var options = rawOptions;
        if (typeof options === "undefined") {
            options = {};
        }

        return {
            counter: legacyOption(options, "counter", 0),
            positionX: legacyOption(options, "positionx", [0]),
            positionY: legacyOption(options, "positiony", [0]),
            offset: legacyOption(options, "offset", 0),
            speed: legacyOption(options, "speed", 0),
            beatLayer: legacyOption(options, "beatlayer", 0),
            type: legacyOption(options, "type", 0),
            aim: legacyOption(options, "aim", 0),
            steps: legacyOption(options, "steps", 0),
            speedGain: legacyOption(options, "speedgain", 0),
            speedMultiplier: legacyOption(options, "speedmulti", 1),
            offsetChange: legacyOption(options, "offsetchange", 0),
            circle: legacyOption(options, "circle", false),
            acceleration: legacyOption(options, "acc", false),
            accelerationOffset: legacyOption(
                options,
                "accoffset",
                false
            ),
            maximumSpeed: legacyOption(options, "speedmax", 0),
            distance: legacyOption(options, "distance", 0),
        };
    }

    function cacheSweepAngle(owner, options, counterState) {
        if (counterState[4] != 0) {
            return;
        }

        if (options.aim == 0) {
            owner.shotangle[options.counter] = directionh(
                owner.x + options.positionX[0],
                owner.y + options.positionY[0]
            ) + options.offset;
        }
        else if (options.aim == 1) {
            owner.shotangle[options.counter] = directionh(
                owner.x,
                owner.y
            ) + options.offset;
        }
        else if (options.aim == 2) {
            owner.shotangle[options.counter] = options.offset;
        }
        else if (options.aim == 5) {
            owner.shotangle[options.counter] = (
                options.offset + owner.rotation
            );
        }
        else {
            owner.shotangle[options.counter] = 0;
        }
    }

    function sweepAcceleration(options, angle, progress) {
        var accelerationX = 0;
        var accelerationY = 0;
        var acceleration = options.acceleration;
        var fixed = options.accelerationOffset;

        // The checks deliberately use the variable acceleration descriptor
        // even for the fixed component. Existing patterns observe this quirk.
        if (fixed !== false) {
            if (acceleration[0] !== 0 || acceleration[2] !== 0) {
                accelerationX += Math.cos(angle + 1.57)
                    * (fixed[0] + fixed[2]);
                accelerationY += Math.sin(angle + 1.57)
                    * (fixed[0] + fixed[2]);
            }

            if (acceleration[1] !== 0 || acceleration[3] !== 0) {
                accelerationX += Math.cos(angle)
                    * (fixed[1] + fixed[3]);
                accelerationY += Math.sin(angle)
                    * (fixed[1] + fixed[3]);
            }
        }

        if (acceleration !== false) {
            if (acceleration[0] !== 0 || acceleration[2] !== 0) {
                accelerationX += Math.cos(angle + 1.57) * (
                    2 * (progress - 0.5) * acceleration[0]
                    + acceleration[2]
                );
                accelerationY += Math.sin(angle + 1.57) * (
                    2 * (progress - 0.5) * acceleration[0]
                    + acceleration[2]
                );
            }

            if (acceleration[1] !== 0 || acceleration[3] !== 0) {
                accelerationX += Math.cos(angle) * (
                    2 * (progress - 0.5) * acceleration[1]
                    + acceleration[3]
                );
                accelerationY += Math.sin(angle) * (
                    2 * (progress - 0.5) * acceleration[1]
                    + acceleration[3]
                );
            }
        }

        return {
            x: accelerationX,
            y: accelerationY,
        };
    }

    function createSweepBullet(
        owner,
        options,
        x,
        y,
        angle,
        speed,
        acceleration,
    ) {
        create(0, "bullet", x, y, {
            parent: owner,
            speedX: Math.cos(angle) * speed,
            speedY: Math.sin(angle) * speed,
            subtype: options.type,
            beatlayer: options.beatLayer,
            accX: acceleration.x,
            accY: acceleration.y,
            misc1: options.maximumSpeed,
        });
    }

    function emitAtPosition(
        owner,
        options,
        positionIndex,
        progress,
        angle,
        speed,
        acceleration,
    ) {
        var positionX;
        var positionY;

        if (options.circle == false) {
            positionX = (
                owner.position.x
                + options.positionX[positionIndex]
                + options.distance * Math.cos(angle) * speed
            );
            positionY = (
                owner.position.y
                + options.positionY[positionIndex]
                + options.distance * Math.sin(angle) * speed
            );
            createSweepBullet(
                owner,
                options,
                positionX,
                positionY,
                angle,
                speed,
                acceleration,
            );
        }
        else if (options.circle[5] == false) {
            // These first values are overwritten by the radial loop in the
            // legacy implementation; retain the calculations and call order.
            positionX = owner.position.x + options.positionX[positionIndex]
                + Math.cos(progress * 2 * pi) * options.circle[0];
            positionY = owner.position.y + options.positionY[positionIndex]
                + Math.sin(progress * 2 * pi) * options.circle[1];

            for (var radiusStep = 0;
                radiusStep <= options.circle[4];
                radiusStep++) {
                positionX = owner.position.x
                    + options.positionX[positionIndex]
                    + Math.cos((progress - 0.5) * 2 * pi)
                    * (
                        options.circle[0]
                        + options.circle[1]
                        * radiusStep
                        / options.circle[4]
                    );
                positionY = owner.position.y
                    + options.positionY[positionIndex]
                    + Math.sin((progress - 0.5) * 2 * pi)
                    * (
                        options.circle[2]
                        + options.circle[3]
                        * radiusStep
                        / options.circle[4]
                    );
                createSweepBullet(
                    owner,
                    options,
                    positionX,
                    positionY,
                    angle,
                    speed,
                    acceleration,
                );
            }
        }
    }

    function emitSweep(owner, rawOptions) {
        var options = sweepOptions(rawOptions);
        var counterState = owner.counter[options.counter];

        cacheSweepAngle(owner, options, counterState);
        if (!(counterState[4] > 0)) {
            return;
        }

        var progress;
        var end;
        if (options.steps > 0) {
            progress = 0;
            end = 1;
        }
        else {
            progress = counterState[4];
            end = progress;
        }

        for (progress; progress <= end; progress += 1 / options.steps) {
            if (counterState[5] == 0) {
                if (options.aim == 3) {
                    owner.shotangle[options.counter] = directionh(
                        owner.x + options.positionX[0],
                        owner.y + options.positionY[0]
                    ) + options.offset;
                }

                for (var positionIndex = 0;
                    positionIndex < options.positionX.length;
                    positionIndex++) {
                    if (options.aim == 4) {
                        owner.shotangle[options.counter] = directionh(
                            owner.x + options.positionX[positionIndex],
                            owner.y + options.positionY[positionIndex]
                        ) + options.offset;
                    }

                    var angle = owner.shotangle[options.counter]
                        + options.offsetChange * (progress - 0.5);
                    var speed = options.speed;
                    var acceleration = sweepAcceleration(
                        options,
                        angle,
                        progress,
                    );

                    for (var speedIndex = 0;
                        speedIndex < options.speedMultiplier;
                        speedIndex++) {
                        speed += options.speedGain;
                        emitAtPosition(
                            owner,
                            options,
                            positionIndex,
                            progress,
                            angle,
                            speed,
                            acceleration,
                        );
                    }
                }
            }
        }
    }

    function resetRecursiveBuffer(owner) {
        owner.buffer.position = {x: 0, y: 0};
        owner.buffer.speed = {x: 0, y: 0};
        owner.buffer.acc = {x: 0, y: 0};
        owner.buffer.zoom = {x: 1, y: 1};
        owner.buffer.color = {x: 255, y: 255, z: 255};
        owner.buffer.delay = 0;
        owner.buffer.angle = 0;
        owner.buffer.alpha = 1;
    }

    function triggerRecursive(owner, counter, type, dimensions) {
        var counterState = owner.counter[counter];

        if (counterState[4] > 0 && counterState[5] == 0) {
            resetRecursiveBuffer(owner);
            if (owner.health - owner.hit >= 0) {
                emitRecursive(
                    owner,
                    type,
                    dimensions,
                    counterState[4],
                );
            }
        }
    }

    function createRecursiveLeaf(owner, type) {
        var buffer = owner.buffer;

        if (type.type == "bullet") {
            create(
                0,
                "bullet",
                buffer.position.x + owner.x,
                buffer.position.y + owner.y,
                {
                    parent: owner,
                    speedX: buffer.speed.x,
                    speedY: buffer.speed.y,
                    subtype: type.subtype,
                    beatlayer: type.beatlayer,
                }
            );
        }
        else if (
            type.type == "particle"
            || type.type == "solidparticle"
        ) {
            buffer.color = buffer.color || {x: 255, y: 255, z: 255};
            if (!buffer.zoom) {
                buffer.zoom = {x: 1, y: 1};
            }
            create(
                ticks + buffer.delay,
                type.type,
                buffer.position.x + owner.x,
                buffer.position.y + owner.y,
                {
                    color: {
                        r: buffer.color.x,
                        g: buffer.color.y,
                        b: buffer.color.z,
                    },
                    speedX: buffer.speed.x,
                    speedY: buffer.speed.y,
                    accX: buffer.acc.x,
                    accY: buffer.acc.y,
                    zoomX: buffer.zoom.x,
                    zoomY: buffer.zoom.y,
                    rotspeed: buffer.rotspeed || 0,
                    subtype: type.subtype,
                    beatlayer: type.beatlayer,
                    blendmode: buffer.blendmode,
                    alpha: buffer.alpha || 1,
                    misc1: 1,
                }
            );
        }
    }

    function emitRecursive(owner, type, dimensions, counter) {
        if (counter === undefined) {
            counter = 0;
        }

        if (dimensions.length) {
            var dimension = dimensions[0];
            for (var step = 0; step < dimension[0]; step++) {
                for (var transformIndex = 0;
                    transformIndex < dimension[1].length;
                    transformIndex++) {
                    applyDistribution(
                        owner,
                        dimension[1][transformIndex],
                        step / dimension[0],
                        counter,
                    );
                }

                // Counter loss below the first dimension is historical and
                // affects xycounterangle patterns, so it stays explicit.
                emitRecursive(owner, type, dimensions.slice(1));
            }
        }
        else {
            createRecursiveLeaf(owner, type);
        }
    }

    var distributions = Object.create(null);

    distributions.xylinear = function xylinear(owner, descriptor, step) {
        return {
            x: descriptor.gainx * step + descriptor.offsetx,
            y: descriptor.gainy * step + descriptor.offsety,
        };
    };

    distributions.set = function setValue(owner, descriptor) {
        return descriptor.set;
    };

    distributions.linear = function linear(owner, descriptor, step) {
        return step * descriptor.gain + descriptor.offset;
    };

    distributions.aim = function aim(owner, descriptor) {
        descriptor.step = descriptor.step || 0;
        var angle = directionh(
            owner.buffer.position.x + owner.x,
            owner.buffer.position.y + owner.y,
        );
        angle += descriptor.step / 2;
        if (descriptor.step) {
            angle -= angle % descriptor.step;
        }
        return angle;
    };

    distributions.xycounterangle = function xycounterangle(
        owner,
        descriptor,
        step,
        counter,
    ) {
        return {
            x: Math.cos(
                counter * descriptor.range + descriptor.offset
            ) * descriptor.speed,
            y: Math.sin(
                counter * descriptor.range + descriptor.offset
            ) * descriptor.speed,
        };
    };

    distributions.xyshift = function xyshift(owner, descriptor) {
        return {
            x: descriptor.x + owner.buffer[descriptor.key[0]].x,
            y: descriptor.y + owner.buffer[descriptor.key[0]].y,
        };
    };

    distributions.xyrelative = function xyrelative(owner, descriptor) {
        return {
            x: Math.cos(owner.buffer.angle) * descriptor.speed,
            y: Math.sin(owner.buffer.angle) * descriptor.speed,
        };
    };

    distributions.xyrandom = function xyrandom(owner, descriptor) {
        return {
            x: Math.random() * descriptor.gainx + descriptor.offsetx,
            y: Math.random() * descriptor.gainy + descriptor.offsety,
        };
    };

    distributions.xyzrandom = function xyzrandom(owner, descriptor) {
        return {
            x: Math.random() * descriptor.gainx + descriptor.offsetx,
            y: Math.random() * descriptor.gainy + descriptor.offsety,
            z: Math.random() * descriptor.gainz + descriptor.offsetz,
        };
    };

    distributions.xy2hero = function xy2hero(owner, descriptor) {
        var value = {};

        if (owner.x > herox) {
            value.x = -descriptor.speedx;
        }
        else {
            value.x = descriptor.speedx;
        }
        if (owner.y > heroy) {
            value.y = -descriptor.speedy;
        }
        else {
            value.y = descriptor.speedy;
        }
        return value;
    };

    distributions.xyset = function xyset(owner, descriptor) {
        return {
            x: descriptor.x,
            y: descriptor.y,
        };
    };

    distributions.xyzset = function xyzset(owner, descriptor) {
        return {
            x: descriptor.x,
            y: descriptor.y,
            z: descriptor.z,
        };
    };

    distributions.rotationset = function rotationset(owner, descriptor) {
        return owner.rotation + (descriptor.offset || 0);
    };

    distributions.xymultiply = function xymultiply(owner, descriptor) {
        var value = {};
        for (var keyIndex = 0;
            keyIndex < descriptor.key.length;
            keyIndex++) {
            value.x = owner.buffer[descriptor.key[keyIndex]].x
                * descriptor.factorx;
            value.y = owner.buffer[descriptor.key[keyIndex]].y
                * descriptor.factory;
        }
        return value;
    };

    distributions.xyzmultiply = function xyzmultiply(owner, descriptor) {
        var value = {};
        for (var keyIndex = 0;
            keyIndex < descriptor.key.length;
            keyIndex++) {
            value.x = owner.buffer[descriptor.key[keyIndex]].x
                * descriptor.factorx;
            value.y = owner.buffer[descriptor.key[keyIndex]].y
                * descriptor.factory;
            value.z = owner.buffer[descriptor.key[keyIndex]].y
                * descriptor.factorz;
        }
        return value;
    };

    distributions.xyrandomcircle = function xyrandomcircle(
        owner,
        descriptor,
    ) {
        var value = {};

        // The descriptor historically redraws once per target key, retains
        // only the last vector, then assigns that same object to every key.
        for (var keyIndex = 0;
            keyIndex < descriptor.key.length;
            keyIndex++) {
            value.x = Math.random() * descriptor.gainx
                + descriptor.offsetx;
            value.y = Math.random() * descriptor.gainy
                + descriptor.offsety;

            value.x *= Math.abs(
                value.x
                / Math.sqrt(
                    Math.pow(value.x, 2) + Math.pow(value.y, 2)
                )
            );
            value.y *= Math.abs(
                value.y
                / Math.sqrt(
                    Math.pow(value.x, 2) + Math.pow(value.y, 2)
                )
            );
        }
        return value;
    };

    distributions.xycircle = function xycircle(owner, descriptor, step) {
        return {
            x: Math.sin(
                descriptor.offset + step * descriptor.gain
            ) * descriptor.speed,
            y: Math.cos(
                descriptor.offset + step * descriptor.gain
            ) * descriptor.speed,
        };
    };

    distributions.multiply = function multiply(owner, descriptor) {
        var value = {};
        for (var keyIndex = 0;
            keyIndex < descriptor.key.length;
            keyIndex++) {
            value = owner.buffer[descriptor.key[keyIndex]]
                * descriptor.factor;
        }
        return value;
    };

    function applyDistribution(owner, descriptor, step, counter) {
        var distribution = distributions[descriptor.fx];
        var value = distribution
            ? distribution(owner, descriptor, step, counter)
            : {};

        for (var keyIndex = 0;
            keyIndex < descriptor.key.length;
            keyIndex++) {
            owner.buffer[descriptor.key[keyIndex]] = value;
        }
    }

    return Object.freeze({
        sweep: emitSweep,
        trigger: triggerRecursive,
        recursive: emitRecursive,
        distribute: applyDistribution,
    });
}());

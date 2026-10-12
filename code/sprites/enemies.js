(function registerEnemyBuilders() {
    "use strict";

    function beginLegacyEnemy(kind, sprite, options, layer, anchor) {
        EntityManager.initialize(sprite, {
            active: options.active,
            x: options.x,
            y: options.y,
            z: 0,
            speedX: EnemyFactory.option(options, "speedX", 0),
            speedY: EnemyFactory.option(options, "speedY", 0),
            accX: EnemyFactory.option(options, "accX", 0),
            accY: EnemyFactory.option(options, "accY", 0),
            anchor: anchor !== false,
        });

        sprite.entityType = kind;
        sprite.entityLayer = layer || "spriteBack";
        sprite.beatlayer = EnemyFactory.option(options, "beatlayer", 0);
        sprite.subtype = EnemyFactory.option(options, "subtype", "none");
        sprite.tint = EnemyFactory.option(options, "tint", 0xFFFFFF);
        sprite.light = 1;
        sprite.red = 1;
        sprite.green = 1;
        sprite.blue = 1;
        sprite.offsetX = EnemyFactory.option(options, "offsetX", 0);
        sprite.offsetY = EnemyFactory.option(options, "offsetY", 0);
        sprite.excolor = EnemyFactory.option(
            options,
            "excolor",
            {x: 255, y: 255, z: 255}
        );
        sprite.shotangle = [];

        return sprite;
    }

    function finishLegacyEnemy(kind, sprite, health, layer, collision) {
        fn.sethealth.call(sprite, health);
        sprite.collision = collision === undefined ? "enemy" : collision;
        return EntityManager.add(sprite, {
            entityType: kind,
            layer: layer || "spriteBack",
        });
    }

    function buildPlane(options) {
        var sprite = beginLegacyEnemy(
            "plane",
            new PIXI.spine.Spine(tex.plane),
            options
        );

        sprite.animation = sprite.state.addAnimation(0, "animation", true, 0);
        sprite.animation.timeScale = 0;
        sprite.squarex = 80;
        sprite.squarey = 80;
        sprite.rotation = pi;
        sprite.col = true;
        var planeEffects = GameEffects.stack(sprite);
        planeEffects.add("outline", get.outline());
        var shadowFilter = planeEffects.add("shadow", get.shadow());
        sprite.ai = [[], [], [], [], []];
        sprite.ai[0].push(ai.shadow.bind(sprite, shadowFilter));
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(function steerPlane() {
            if (herox < this.x && this.speedX > -1-difficulty.enemy){
                this.speedX -= 0.1;
            }
            if (herox > this.x && this.speedX < 1+difficulty.enemy){
                this.speedX += 0.1;
            }
            this.state.tracks[0].trackTime = 0.333
                - (this.speedX / ((1+difficulty.enemy)*3.3));
        }.bind(sprite));

        return finishLegacyEnemy("plane", sprite, 150);
    }

    function buildSpacefighter(options) {
        var sprite = beginLegacyEnemy(
            "spacefighter",
            new PIXI.Sprite(tSpacefighter),
            options
        );

        sprite.score = 20;
        sprite.squarex = 80;
        sprite.squarey = 80;
        sprite.col = true;
        sprite.phase = 1;
        sprite.ai = [[], [], [], [], []];
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(countf.bind(sprite));
        sprite.ai[0].push(offborderf.bind(sprite));
        sprite.ai[0].push(dief.bind(sprite, -3));
        sprite.ai[0].push(hitf.bind(sprite));
        sprite.ai[0].push(rotatef.bind(sprite, 0.005));
        sprite.counter[0] = [0, 50, 8, 0, 0, 0];
        sprite.ai[0].push(shootf.bind(
            sprite,
            0,
            {type: "bullet", subtype: "bbullet", beatlayer: sprite.beatlayer},
            [[1, [
                {fx: "rotationset", key: ["angle"]},
                {fx: "xyrelative", key: ["position"], speed: 150},
                {fx: "xyrelative", key: ["speed"], speed: 5},
            ]]]
        ));
        sprite.ai[0].push(shootf.bind(
            sprite,
            0,
            {type: "bullet", subtype: "bbullet", beatlayer: sprite.beatlayer},
            [[1, [
                {fx: "rotationset", key: ["angle"]},
                {fx: "xyrelative", key: ["position"], speed: -150},
                {fx: "xyrelative", key: ["speed"], speed: -5},
            ]]]
        ));

        return finishLegacyEnemy("spacefighter", sprite, 100);
    }

    function horizontalBalloonShot(sprite, beatlayer, direction) {
        sprite.ai[0].push(shootf.bind(
            sprite,
            0,
            {type: "bullet", subtype: "bbullet", beatlayer: beatlayer},
            [[1, [
                {
                    fx: "xyset",
                    key: ["speed"],
                    x: direction * (6+2*difficulty.bullets),
                    y: 0,
                },
                {
                    fx: "xyset",
                    key: ["position"],
                    x: direction * -8,
                    y: 100,
                },
            ]]]
        ));
    }

    function buildBalloon(options) {
        var texture = options.beatlayer === 3 || options.beatlayer === 4
            ? tBalloon2
            : tBalloon1;
        var sprite = beginLegacyEnemy(
            "balloon",
            new PIXI.Sprite(texture),
            options
        );

        var balloonEffects = GameEffects.stack(sprite);
        var outlineFilter = balloonEffects.add("outline", get.outline());
        var shadowFilter = balloonEffects.add("shadow", get.shadow());
        sprite.score = 5;
        sprite.squarex = 80;
        sprite.squarey = 80;
        sprite.col = true;
        sprite.phase = 1;
        sprite.ai = [[], [], [], [], []];

        if (sprite.beatlayer === 3 || sprite.beatlayer === 4) {
            sprite.ai[0].push(ai.outlinebeat.bind(sprite, outlineFilter, [
                {beat: 4, color: {x: 255, y: 255, z: 0}},
                {beat: 3, color: {x: 255, y: 0, z: 255}},
            ]));
        }
        else {
            sprite.ai[0].push(ai.outlinebeat.bind(sprite, outlineFilter, [
                {beat: 2, color: {x: 0, y: 255, z: 255}},
            ]));
        }

        sprite.ai[0].push(ai.shadow.bind(sprite, shadowFilter));
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(countf.bind(sprite));
        sprite.floatcounter = 0;
        sprite.ai[0].push(ai.float2.bind(sprite, 0.001, 50));
        sprite.ai[0].push(offborderf.bind(sprite));
        sprite.ai[0].push(dief.bind(sprite, "balloon"));
        sprite.ai[0].push(hitf.bind(sprite));
        sprite.counter[0] = [0, 50, 10, 0, 0, 0];

        if (sprite.beatlayer === 2) {
            horizontalBalloonShot(sprite, 2, 1);
            horizontalBalloonShot(sprite, 2, -1);
        }
        else {
            horizontalBalloonShot(sprite, 3, 1);
            horizontalBalloonShot(sprite, 4, -1);
        }

        return finishLegacyEnemy("balloon", sprite, 20);
    }

    function verticalSatelliteShot(sprite, beatlayer, xOffset) {
        sprite.ai[0].push(shootf.bind(
            sprite,
            0,
            {type: "bullet", subtype: "stick", beatlayer: beatlayer},
            [[1, [
                {
                    fx: "xyset",
                    key: ["speed"],
                    x: 0,
                    y: 6+2*difficulty.bullets,
                },
                {
                    fx: "xyset",
                    key: ["position"],
                    x: xOffset,
                    y: 0,
                },
            ]]]
        ));
    }

    function buildSatellite(options) {
        var sprite = beginLegacyEnemy(
            "satellite",
            new PIXI.spine.Spine(tex.satelite),
            options
        );

        sprite.state.addAnimation(0, "animation", true, 0);
        sprite.scale.x = 1.2;
        sprite.scale.y = 1.2;
        sprite.score = options.noheart ? 5 : 20;
        sprite.squarex = 220;
        sprite.squarey = 50;
        sprite.col = true;
        sprite.phase = 1;
        sprite.ai = [[], [], [], [], []];
        var satelliteEffects = GameEffects.stack(sprite);
        var outlineFilter = satelliteEffects.add("outline", get.outline());
        var shadowFilter = satelliteEffects.add("shadow", get.shadow());

        if (sprite.beatlayer > 2) {
            sprite.ai[0].push(ai.outlinebeat.bind(sprite, outlineFilter, [
                {beat: 4, color: {x: 255, y: 255, z: 0}},
                {beat: 3, color: {x: 255, y: 0, z: 255}},
            ]));
        }
        else {
            sprite.ai[0].push(ai.outlinebeat.bind(sprite, outlineFilter, [
                {beat: 2, color: {x: 0, y: 255, z: 255}},
            ]));
        }

        sprite.ai[0].push(ai.shadow.bind(sprite, shadowFilter));
        sprite.ai[0].push(movef.bind(sprite));
        sprite.floatcounter = 0.5;
        sprite.ai[0].push(ai.float2.bind(sprite, 0.003, 60));
        sprite.ai[0].push(countf.bind(sprite));
        sprite.ai[0].push(offborderf.bind(sprite));
        sprite.ai[0].push(dief.bind(sprite, "heavybass"));
        sprite.ai[0].push(hitf.bind(sprite));
        sprite.counter[0] = [0, 50, 10, 0, 0, 0];

        if (sprite.beatlayer > 2) {
            verticalSatelliteShot(sprite, 3, -180);
            verticalSatelliteShot(sprite, 4, 180);
        }
        else {
            verticalSatelliteShot(sprite, sprite.beatlayer, -180);
            verticalSatelliteShot(sprite, sprite.beatlayer, 180);
        }

        return finishLegacyEnemy("satellite", sprite, 50);
    }

    function buildFly(options) {
        var sprite = beginLegacyEnemy(
            "fly",
            new PIXI.spine.Spine(tex.fly),
            options,
            "front"
        );
        var firstPhaseDuration = EnemyFactory.option(options, "misc1", 0);
        var rotationDuration = EnemyFactory.option(options, "misc2", 0);
        var rotationSpeed = EnemyFactory.option(options, "misc3", 0);

        sprite.state.addAnimation(0, "animation", true, 0);
        var flyEffects = GameEffects.stack(sprite);
        var outlineFilter = flyEffects.add("outline", get.outline());
        var shadowFilter = flyEffects.add("shadow", get.shadow());
        shadowFilter.offset = {x: -100, y: -100};
        shadowFilter.blur = 5;
        sprite.phase = 1;
        sprite.squarex = 80;
        sprite.squarey = 80;
        sprite.rotation = EnemyFactory.option(options, "misc4", 0);
        // Pixi's angle property aliases rotation (in degrees), so assigning the
        // legacy angle array here would overwrite the fly's scripted heading.
        sprite.ai = [[], [], [], []];
        sprite.score = 5;

        sprite.ai[0].push(ai.outlinebeat.bind(sprite, outlineFilter, [
            {beat: 2, color: {x: 255, y: 0, z: 255}},
        ]));
        sprite.ai[0].push(ai.shadow.bind(sprite, shadowFilter));
        sprite.ai[1].push(waitf.bind(
            sprite,
            firstPhaseDuration / Math.sqrt(difficulty.enemy)
        ));
        sprite.ai[2].push(rotatef.bind(sprite, rotationSpeed));
        sprite.ai[2].push(waitf.bind(sprite, rotationDuration));
        sprite.ai[0].push(moveanglef.bind(sprite, 5+difficulty.enemy));
        sprite.floatcounter = 0;
        sprite.counter[0] = [300, 60, 6, 200, 0, 0];

        if (!options.nobullets) {
            sprite.ai[0].push(countf.bind(sprite));
            sprite.ai[0].push(patternfn.bind(sprite, {
                speed: 1.5+1.5*difficulty.bullets,
                beatlayer: 3,
                type: "bullet",
            }));
        }

        sprite.ai[0].push(offborderf.bind(sprite, 100));
        sprite.ai[0].push(dief.bind(sprite, 8));
        sprite.ai[0].push(hitf.bind(sprite));

        return finishLegacyEnemy("fly", sprite, 12, "front");
    }

    function buildSunflower(options) {
        var sprite = beginLegacyEnemy(
            "sunflower",
            new PIXI.Sprite(tSunflower),
            options
        );

        var sunflowerEffects = GameEffects.stack(sprite);
        sunflowerEffects.add("outline", get.outline());
        var glowFilter = sunflowerEffects.add(
            "glow",
            get.glowsingle({color: 0xDDAA33})
        );
        var shadowFilter = sunflowerEffects.add("shadow", get.shadow());
        glowFilter.offset = {x: -100, y: -100};
        glowFilter.blur = 5;
        sprite.squarex = 160;
        sprite.squarey = 160;
        sprite.light = 0.7;
        sprite.red = 0.7;
        sprite.blue = 0.7;
        sprite.green = 1;
        sprite.accY = -0.11;
        sprite.z = 1;
        sprite.score = 10;
        sprite.col = false;
        sprite.phase = 1;
        sprite.ai = [[], [], [], [], []];

        sprite.ai[0].push(ai.glowbeat.bind(sprite, glowFilter, 1, 1, 4));
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(zset.bind(sprite));
        sprite.ai[0].push(lightset.bind(sprite));
        sprite.ai[0].push(ai.shadow.bind(sprite, shadowFilter, 2));
        sprite.ai[1].push(waitf.bind(sprite, 60));
        sprite.ai[2].push(accf.bind(sprite));
        sprite.ai[2].push(waitf.bind(sprite, 160));
        sprite.ai[3].push(zoomf.bind(sprite, -0.01));
        sprite.ai[3].push(lightf.bind(sprite, 0.01, 1.5));
        sprite.ai[3].push(accchangef.bind(sprite, 0, 0.05));
        sprite.ai[3].push(accf.bind(sprite));
        sprite.ai[4].push(accchangef.bind(sprite, 0, 0.05));
        sprite.ai[4].push(accf.bind(sprite));
        sprite.ai[4].push(countf.bind(sprite));
        sprite.ai[4].push(patternfn.bind(sprite, {
            speed: 4,
            beatlayer: 4,
            type: "grain",
            aim: 2,
            steps: 7,
            offsetchange: 2*pi,
        }));
        sprite.ai[0].push(rotatef.bind(sprite, 0.01));
        sprite.angle = [directionh(options.x, options.y)];
        sprite.counter[0] = [300, 80, 10, 295, 0, 0];
        sprite.ai[4].push(function leaveSunflower() {
            if (this.speedY > 2) {
                this.col = "none";
                this.z += 0.003;
                this.red -= 0.002;
                this.blue -= 0.002;
            }
        }.bind(sprite));
        sprite.ai[4].push(offborderf.bind(sprite));
        sprite.ai[4].push(dief.bind(sprite, 5));
        sprite.ai[4].push(hitf.bind(sprite));

        return finishLegacyEnemy("sunflower", sprite, 5);
    }

    function buildHawkbit(options) {
        var sprite = beginLegacyEnemy(
            "hawkbit",
            new PIXI.spine.Spine(tex.hawkbit),
            options
        );

        sprite.state.addAnimation(0, "animation", true, 0);
        var hawkbitEffects = GameEffects.stack(sprite);
        hawkbitEffects.add("outline", get.outline());
        var glowFilter = hawkbitEffects.add(
            "glow",
            get.glowsingle({color: 0xFFFF00})
        );
        var shadowFilter = hawkbitEffects.add("shadow", get.shadow());
        glowFilter.offset = {x: -100, y: -100};
        glowFilter.blur = 5;
        sprite.squarex = 80;
        sprite.squarey = 80;
        sprite.light = 0.7;
        sprite.red = 0.7;
        sprite.blue = 0.7;
        sprite.green = 1;
        sprite.accY = -0.11;
        sprite.z = 1;
        sprite.col = false;
        sprite.phase = 1;
        sprite.ai = [[], [], [], [], []];

        sprite.ai[0].push(ai.glowbeat.bind(sprite, glowFilter, 2, 0.5, 2));
        sprite.ai[0].push(ai.shadow.bind(sprite, shadowFilter, 4));
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(zset.bind(sprite));
        sprite.ai[0].push(lightset.bind(sprite));
        sprite.ai[1].push(waitf.bind(sprite, 60));
        sprite.ai[2].push(accf.bind(sprite));
        sprite.ai[2].push(waitf.bind(sprite, 160));
        sprite.ai[3].push(zoomf.bind(sprite, -0.01));
        sprite.ai[3].push(lightf.bind(sprite, 0.01, 1.5));
        sprite.ai[3].push(accchangef.bind(sprite, 0, 0.05));
        sprite.ai[3].push(accf.bind(sprite));
        sprite.angle = [directionh(options.x, options.y)];
        sprite.counter[0] = [300, 50, 50, 250, 0, 0];
        sprite.ai[4].push(accchangef.bind(sprite, 0, 0.05));
        sprite.ai[4].push(accf.bind(sprite));
        sprite.ai[4].push(countf.bind(sprite));
        sprite.ai[4].push(function leaveHawkbit() {
            if (this.speedY > 2) {
                this.col = "none";
                this.z += 0.003;
                this.red -= 0.002;
                this.blue -= 0.002;
            }
        }.bind(sprite));
        sprite.ai[4].push(patternfn.bind(sprite, {
            speed: 3,
            beatlayer: 2,
            type: "grain",
            steps: 1,
            speedgain: 0.5,
            speedmulti: 5,
            offsetchange: 0.03,
            acc: false,
        }));
        sprite.ai[4].push(offborderf.bind(sprite));
        sprite.ai[4].push(dief.bind(sprite, 7));
        sprite.ai[4].push(hitf.bind(sprite));
        sprite.floatcounter = 0.6;
        sprite.ai[4].push(ai.float2.bind(sprite, 0.003, 50));
        sprite.score = 5;

        return finishLegacyEnemy("hawkbit", sprite, 12);
    }

    function setDragonflyExitVelocity(speedX, speedY) {
        this.speedX = speedX;
        this.speedY = speedY;
    }

    function buildDragonfly(options) {
        var sprite = beginLegacyEnemy(
            "dragonfly",
            new PIXI.spine.Spine(
                EnemyFactory.option(options, "texture", tex.dragonfly)
            ),
            options
        );
        var exitSpeedX = EnemyFactory.option(options, "misc1", 0);
        var exitSpeedY = EnemyFactory.option(options, "misc2", 0);

        sprite.state.addAnimation(0, "animation", true, 0);
        var dragonflyEffects = GameEffects.stack(sprite);
        var outlineFilter = dragonflyEffects.add("outline", get.outline());
        var shadowFilter = dragonflyEffects.add("shadow", get.shadow());
        shadowFilter.blur = 5;
        sprite.squarex = 200;
        sprite.squarey = 30;
        sprite.col = false;
        sprite.phase = 1;
        sprite.light = 0.5;
        sprite.z = 1;
        sprite.accY = 0.02;
        sprite.score = 20;
        sprite.ai = [[], [], [], [], []];
        sprite.ai[0].push(ai.shadow.bind(sprite, shadowFilter));
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(offborderf.bind(sprite));
        sprite.ai[0].push(zset.bind(sprite));
        sprite.floatcounter = 0;
        sprite.ai[3].push(ai.float.bind(sprite, 0.02, 30));
        sprite.ai[4].push(ai.float.bind(sprite, 0.02, 30));
        sprite.ai[1].push(waitf.bind(sprite, 300));
        sprite.ai[2].push(lightf.bind(sprite, 0.004));
        sprite.ai[0].push(lightset.bind(sprite));
        sprite.ai[2].push(zoomf.bind(sprite, -0.008));
        sprite.ai[3].push(accchangef.bind(sprite, 0, 0.013));
        sprite.ai[3].push(accf.bind(sprite));
        sprite.ai[3].push(phasechangef.bind(
            sprite,
            0,
            "speedy",
            true,
            "enemy"
        ));
        sprite.ai[3].push(hitf.bind(sprite));
        sprite.counter[0] = [50, 10000, 8, 0, 0, 0];
        sprite.ai[4].push(setDragonflyExitVelocity.bind(
            sprite,
            exitSpeedX,
            exitSpeedY
        ));
        sprite.ai[4].push(countf.bind(sprite));
        sprite.ai[4].push(patternfn.bind(sprite, {
            positionx: [-0],
            positiony: [100],
            offset: 1.57,
            speed: 8+2*difficulty.bullets,
            beatlayer: EnemyFactory.option(options, "beatlayer", 1),
            type: "stick",
            aim: 2,
        }));
        sprite.counter[1] = [50, 100, 10, 0, 0, 0];
        sprite.ai[4].push(offborderf.bind(sprite));

        if (options.texture) {
            sprite.ai[4].push(dief.bind(sprite, "zeppelin"));
        }
        else {
            sprite.ai[0].push(ai.outlinebeat.bind(sprite, outlineFilter, [
                {beat: 1, color: {x: 0, y: 255, z: 255}},
            ]));
            sprite.ai[4].push(dief.bind(sprite, 1));
        }
        sprite.ai[4].push(hitf.bind(sprite));

        return finishLegacyEnemy("dragonfly", sprite, 40, "spriteBack", "none");
    }

    function buildLegacyGhostCircle(options) {
        var sprite;
        var ghostBeatLayer;
        var explosion;
        var glowFilter;

        if (options.white) {
            sprite = new PIXI.spine.Spine(tex.ghostw2);
            ghostBeatLayer = 1;
            explosion = "citycloud";
            glowFilter = get.glowsingle({color: 0xAAAAFF});
        }
        else {
            sprite = new PIXI.spine.Spine(tex.ghostb2);
            ghostBeatLayer = 2;
            explosion = "zeppelin";
            glowFilter = get.glowsingle({color: 0xAA4444});
        }

        beginLegacyEnemy("legacyGhostCircle", sprite, options);
        sprite.beatlayer = ghostBeatLayer;
        sprite.angle = [directionh(options.x, options.y)];
        sprite.state.addAnimation(0, "animation", true, 0);
        GameEffects.stack(sprite).add("glow", glowFilter);
        sprite.ai = [[], [], [], [], []];
        sprite.alpha = 0;
        sprite.phase = 1;
        sprite.ai[0].push(ai.glowbeat.bind(
            sprite,
            glowFilter,
            ghostBeatLayer,
            1,
            3
        ));
        sprite.ai[1].push(function revealGhostCircle() {
            this.scale.x /= 1.01;
            this.scale.y /= 1.01;
            this.alpha = (1.2 / this.scale.x) - 0.25;
            if (this.scale.x < 1.1) {
                this.phase++;
            }
        }.bind(sprite));
        sprite.ai[2].push(waitf.bind(
            sprite,
            120+60*difficulty.enemy
        ));
        sprite.ai[3].push(fadein.bind(sprite, -0.01, 1, true));
        sprite.ai[4].push(function removeGhostCircle() {
            this.delete = true;
        }.bind(sprite));
        sprite.floatcounter = -1;
        sprite.ai[2].push(ai.float.bind(sprite, 0.05, 100));
        sprite.counter[0] = [60, 60, 60, 55, 0, 0];
        sprite.ai[0].push(hitf.bind(sprite));
        sprite.ai[0].push(countf.bind(sprite));
        sprite.ai[0].push(dief.bind(sprite, explosion));
        sprite.ai[2].push(patternfn.bind(sprite, {
            counter: 0,
            speed: 5,
            beatlayer: ghostBeatLayer,
            type: "whitecluster",
            steps: 10,
            speedgain: 0.2+difficulty.bullets*0.2,
            speedmulti: 0,
            offsetchange: 1,
            acc: false,
        }));
        sprite.score = 5;
        sprite.scale.x = 5;
        sprite.scale.y = 5;

        return finishLegacyEnemy("legacyGhostCircle", sprite, 12);
    }

    function buildHornet(options) {
        var sprite = beginLegacyEnemy(
            "hornet",
            new PIXI.spine.Spine(tex.hornet),
            options
        );

        sprite.squarex = 40;
        sprite.squarey = 40;
        sprite.accY = 0.002;
        sprite.ai = [[]];

        if (nobullets) {
            sprite.passed = 0;
            sprite.ai[0].push(ai.ziskadestroy.bind(sprite, 300));
        }

        sprite.animation = sprite.state.addAnimation(0, "animation", true, 0);
        sprite.animation.timeScale = 0;
        var hornetEffects = GameEffects.stack(sprite);
        var outlineFilter = hornetEffects.add("outline", get.outline());
        var shadowFilter = hornetEffects.add("shadow", get.shadow());
        sprite.ai[0].push(ai.shadow.bind(sprite, shadowFilter));

        if (options.beatlayer === 1) {
            sprite.ai[0].push(ai.outlinebeat.bind(sprite, outlineFilter, [
                {beat: 1, color: {x: 255, y: 255, z: 0}},
            ]));
        }
        else {
            sprite.ai[0].push(ai.outlinebeat.bind(sprite, outlineFilter, [
                {beat: 2, color: {x: 255, y: 0, z: 0}},
            ]));
        }

        sprite.ai[0].push(moveanglef.bind(sprite, 3+difficulty.enemy));
        sprite.rotation = 1.57;
        sprite.angle = [directionh(options.x, options.y)];
        sprite.anglespeed = 0;
        sprite.ai[0].push(function steerHornet() {
            var direction = directionh(this.x, this.y);
            if (this.rotation > pi) {
                this.rotation -= 2*pi;
            }
            else if (this.rotation < -pi) {
                this.rotation += 2*pi;
            }

            if (this.rotation > direction) {
                if (this.rotation-direction > pi) {
                    this.anglespeed += 0.0001+0.0002*difficulty.enemy;
                }
                else {
                    this.anglespeed -= 0.0001+0.0002*difficulty.enemy;
                }
            }
            else if (direction-this.rotation > pi) {
                this.anglespeed -= 0.0001+0.0002*difficulty.enemy;
            }
            else {
                this.anglespeed += 0.0001+0.0002*difficulty.enemy;
            }

            if (this.anglespeed < -0.01) {
                this.anglespeed = -0.01;
            }
            else if (this.anglespeed > 0.01) {
                this.anglespeed = 0.01;
            }

            this.rotation += this.anglespeed;
            this.state.tracks[0].trackTime = 0.333-(this.anglespeed*33);
        }.bind(sprite));
        sprite.ai[0].push(function emitHornetTrail() {
            create(
                0,
                "picture",
                this.x-Math.sin(this.rotation+pi/2+Math.random()*0.4-0.2)*80,
                this.y+Math.cos(this.rotation+pi/2+Math.random()*0.4-0.2)*80,
                {
                    tint: rgbToHex(
                        Math.random()*100+100,
                        100,
                        100
                    ),
                    accY: 0.2,
                    layer: "backlayer",
                    speedX: -Math.sin(
                        this.rotation+pi/2+Math.random()*0.4-0.2
                    )*7,
                    speedY: Math.cos(
                        this.rotation+pi/2+Math.random()*0.4-0.2
                    )*7,
                    subtype: tParticle02,
                    alpha: 0.4,
                    misc1: 2,
                    misc2: 2,
                    misc3: 8,
                    misc4: 1,
                    misc5: 1,
                }
            );
        }.bind(sprite));
        sprite.ai[0].push(countf.bind(sprite));
        sprite.counter[0] = [10, 10, 10, 0, 0, 0];
        sprite.ai[0].push(patternfn.bind(sprite, {
            speed: 1,
            offset: 0,
            beatlayer: EnemyFactory.option(options, "beatlayer", 4),
            type: EnemyFactory.option(options, "bullet", "bullet"),
            aim: 1,
        }));
        sprite.score = 5;
        sprite.ai[0].push(dief.bind(sprite, "fa18"));
        sprite.ai[0].push(hitf.bind(sprite));

        return finishLegacyEnemy(
            "hornet",
            sprite,
            40+20*difficulty.enemy
        );
    }

    function buildMeteor(options) {
        var sprite = beginLegacyEnemy(
            "meteor",
            new PIXI.Sprite(tex.meteor),
            options
        );
        var rotation = EnemyFactory.option(options, "rotation", pi);

        sprite.heightmap = setsprite(
            new PIXI.Sprite(tex.meteor_h),
            {
                anchor: {x: 0.5, y: 0.5},
                active: options.active,
                x: options.x,
                y: options.y,
                speedX: EnemyFactory.option(options, "speedX", 0),
                speedY: EnemyFactory.option(options, "speedY", 0),
                entityType: "meteorHeightmap",
            }
        );
        sprite.heightmap.rotation = rotation;
        var meteorEffects = GameEffects.stack(sprite);
        meteorEffects.add(
            "outline",
            get.outline({color: 0xFFFFAA})
        );
        var displacementFilter = meteorEffects.add(
            "displacement",
            new PIXI.DisplacementFilter(sprite.heightmap)
        );
        EntityManager.addDependent(sprite, sprite.heightmap);
        sprite.squarex = 80;
        sprite.squarey = 80;
        sprite.rotation = rotation;
        sprite.col = true;
        sprite.ai = [[], [], [], [], []];
        sprite.ai[0].push(function updateMeteorDisplacement() {
            displacementFilter.scale.x = Math.sin(this.rotation)*20;
            displacementFilter.scale.y = Math.cos(this.rotation)*20;
        }.bind(sprite));
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(rotatef.bind(sprite, 0.01));
        sprite.heightmap.ai[0].push(movef.bind(sprite.heightmap));
        sprite.heightmap.ai[0].push(rotatef.bind(sprite.heightmap, 0.01));
        sprite.counter[0] = [0, 50, 2, 0, 0, 0];
        sprite.ai[0].push(countf.bind(sprite));
        sprite.ai[0].push(offborderf.bind(sprite));
        sprite.heightmap.ai[0].push(offborderf.bind(sprite.heightmap));

        if (sprite.beatlayer > 0) {
            sprite.ai[0].push(shootf.bind(
                sprite,
                0,
                {
                    type: "bullet",
                    subtype: "bbullet",
                    beatlayer: sprite.beatlayer,
                },
                [[1, [
                    {
                        fx: "xy2hero",
                        key: ["speed"],
                        speedx: 3,
                        speedy: 0,
                    },
                ]]]
            ));
        }

        return finishLegacyEnemy("meteor", sprite, 150);
    }

    function syncMushroomPositionToMusic(
        modulo,
        height,
        exponent,
        offset,
        repeat
    ) {
        repeat = repeat === undefined ? 1 : repeat;

        if ((repeat === 0 || repeat > musictime/modulo) && musictime > 0) {
            var progress = (musictime % modulo) / modulo;
            var result;

            if (exponent >= 0) {
                result = height * Math.pow(progress, exponent);
            }
            else {
                result = -height * Math.pow(1-progress, -exponent);
            }

            this.position.y = result-offset;
        }
    }

    function advanceMushroomFightScene(limit) {
        if (limit === scene) {
            scene++;
            this.phase++;
            this.collision = "enemy";
        }
    }

    function alignMushroomAnimationWithBoss(boss) {
        // These are local coordinates inside the unscaled 1200x684 boss image.
        // The old code accidentally inherited this transform by overwriting
        // Pixi's `parent`; reproduce the intended result without corrupting the
        // display tree.
        this.position.x = boss.position.x + 537*boss.scale.x;
        // The 215 px animation frames need a half-pixel center so their
        // unchanged cloth pixels land exactly on the boss texture.
        this.position.y = boss.position.y + 575.5*boss.scale.y;
        this.scale.x = boss.scale.x;
        this.scale.y = boss.scale.y;
        if (Number.isFinite(boss.beatParticleDeathWarningStartedAt)) {
            this.alpha = boss.alpha;
        }
    }

    function updateMushroomAnimation(boss) {
        // A rhythmic death can run after this overlay's update. Cleanup then
        // destroys the boss before the overlay gets its next simulation step.
        if (boss.delete === true || boss.__soundstormDestroyed || dead > 0) {
            this.renderable = false;
            this.delete = true;
            return;
        }

        alignMushroomAnimationWithBoss.call(this, boss);

        if (scene < 21) {
            this.renderable = false;
        }
        else if (boss.health <= 0) {
            this.renderable = true;
            this.gotoAndStop(4);
        }
        else {
            this.atimer++;
            if (this.atimer < 5) {
                this.renderable = false;
            }
            else {
                this.renderable = true;
                if (this.atimer < 10) {
                    this.gotoAndStop(0);
                }
                else if (this.atimer < 15) {
                    this.gotoAndStop(1);
                }
                else if (this.atimer < 20) {
                    this.gotoAndStop(2);
                }
                else if (this.atimer < 25) {
                    this.gotoAndStop(3);
                }
                else if (this.atimer < 30) {
                    this.gotoAndStop(2);
                }
                else if (this.atimer < 35) {
                    this.gotoAndStop(1);
                }
                else {
                    this.gotoAndStop(0);
                }
            }
            if (this.atimer > 35) {
                this.atimer = 0;
            }
        }
    }

    function createMushroomAnimation(boss) {
        var sprite = setsprite(
            new PIXI.AnimatedSprite(tex.mushanime),
            {
                anchor: true,
                active: 0,
                entityType: "mushroomAnimation",
                layer: "background",
                x: 0,
                y: 0,
            }
        );

        sprite.atimer = 0;
        alignMushroomAnimationWithBoss.call(sprite, boss);
        EntityManager.addDependent(boss, sprite);
        sprite.ai = [[]];
        sprite.ai[0].push(updateMushroomAnimation.bind(sprite, boss));
        return sprite;
    }

    function addMushroomSmoke(sprite, phase, bossHealth) {
        sprite.ai[phase].push(smoke.bind(sprite, 350, -100, 0.8*bossHealth, 0.8*bossHealth));
        sprite.ai[phase].push(smoke.bind(sprite, 175, -120, 0.8*bossHealth, 0.7*bossHealth));
        sprite.ai[phase].push(smoke.bind(sprite, -100, -100, 0.8*bossHealth, 0.6*bossHealth));
        sprite.ai[phase].push(smoke.bind(sprite, 250, -120, 0.8*bossHealth, 0.45*bossHealth));
        sprite.ai[phase].push(smoke.bind(sprite, -50, -180, 0.8*bossHealth, 0.3*bossHealth));
        sprite.ai[phase].push(smoke.bind(sprite, 100, -160, 0.8*bossHealth, 0.2*bossHealth));
        sprite.ai[phase].push(smoke.bind(sprite, -150, -140, 0.8*bossHealth, 0.1*bossHealth));
    }

    function mushroomAimedShot(sprite, speed) {
        sprite.ai[speed === 5 ? 2 : 3].push(shootf.bind(
            sprite,
            0,
            {type: "bullet", subtype: "whitecluster", beatlayer: 1},
            [[speed === 5 ? 2 : 3, [
                {
                    fx: "xyrandom",
                    key: ["position"],
                    gainx: speed === 5 ? 400 : 500,
                    gainy: 100,
                    offsetx: -200,
                    offsety: -250,
                },
                {fx: "aim", key: ["angle"]},
                {fx: "xyrelative", key: ["speed"], speed: speed},
            ]]]
        ));
    }

    function addMushroomBeatWall(sprite, phase, speed) {
        sprite.ai[phase].push(function shootMushroomBeatWall() {
            if (beat[1] > 0 && this.beatbuffer === 0) {
                for (var index = 0; index < 40; index++) {
                    create(0, "bullet", index*48, 0, {
                        parent: this,
                        speedX: 0,
                        speedY: speed*difficulty.bullets,
                        subtype: "whitecluster",
                        beatlayer: 2,
                    });
                }
            }
            this.beatbuffer = beat[1];
        }.bind(sprite));
    }

    function buildMushroomBoss(options) {
        var bossHealth = difficulty.bullets >= 2 ? 3300 : 2300;
        var sprite = beginLegacyEnemy(
            "mushroomBoss",
            new PIXI.Sprite(tMushroom),
            options,
            "background",
            false
        );

        sprite.offsetX = 300;
        sprite.offsetY = -50;
        sprite.phase = 1;
        sprite.scale.x = 0.333;
        sprite.scale.y = 0.333;
        sprite.size = 0.333;
        sprite.c1 = 0;
        sprite.squarex = 500;
        sprite.squarey = 50;
        sprite.score = 100;
        sprite.createanime = 1;
        sprite.beatbuffer = 0;
        sprite.beatbuffer2 = 0;
        sprite.ai = [[], [], [], [], [], [], []];

        if (nobullets) {
            sprite.passed = 0;
            sprite.ai[0].push(ai.ziskadestroy.bind(sprite, 3500));
        }

        sprite.ai[0].push(function updateMushroomScoreTimer() {
            if (this.health >= 0) {
                scoretimer = 120-musictime;
                if (scoretimer < 0) {
                    scoretimer = 0;
                }
            }
        }.bind(sprite));
        sprite.ai[0].push(function tintMushroomWithZoom() {
            this.tint = rgbToHex(
                background.scale.x*255/5+(510/5),
                background.scale.x*255/5+(510/5),
                background.scale.x*255/5+(510/5)
            );
        }.bind(sprite));
        sprite.ai[2].push(timeoutdief.bind(sprite));
        sprite.ai[3].push(timeoutdief.bind(sprite));
        addMushroomSmoke(sprite, 2, bossHealth);
        addMushroomSmoke(sprite, 3, bossHealth);
        sprite.ai[1].push(syncMushroomPositionToMusic.bind(
            sprite,
            30,
            2837,
            -2,
            -350
        ));
        sprite.ai[1].push(advanceMushroomFightScene.bind(sprite, 20));
        sprite.ai[1].push(function initializeMushroomFight() {
            this.health = bossHealth;
            if (this.createanime) {
                createMushroomAnimation(this);
                this.createanime = 0;
            }
        }.bind(sprite));
        sprite.counter[0] = [1, 50, 10, 0, 0, 0];
        sprite.counter[1] = [100, 50, 10, 0, 0, 0];
        sprite.ai[2].push(countf.bind(sprite));
        mushroomAimedShot(sprite, 5);
        sprite.ai[2].push(phasechangef.bind(sprite, 1500, "health"));
        sprite.ai[2].push(hitf.bind(sprite));
        sprite.ai[3].push(countf.bind(sprite));
        sprite.ai[3].push(hitf.bind(sprite));
        mushroomAimedShot(sprite, 10);

        if (difficulty.bullets >= 2) {
            addMushroomBeatWall(sprite, 2, 1);
            addMushroomBeatWall(sprite, 3, 2);
        }

        sprite.ai[3].push(phasechangef.bind(
            sprite,
            0,
            "health",
            false
        ));
        sprite.ex_cicles = 0;
        sprite.ex_timer = 0;
        sprite.ai[4].push(explosionSequencef.bind(
            sprite,
            5,
            "mushroomexploding",
            true
        ));
        sprite.ai[6].push(dief.bind(sprite, "mushroomexplosion"));
        sprite.ai[5].push(scenenextf.bind(sprite));
        sprite.beatParticleDeathBehavior = function finishMushroomRhythmicDeath() {
            // Pulse 4 skips the timed explosions, but must still perform the
            // bullet cancellation and level completion of the normal path.
            cancel_all_bullets();
            scenenextf.call(this);
            dief.call(this, "mushroomexplosion");
        }.bind(sprite);

        return finishLegacyEnemy(
            "mushroomBoss",
            sprite,
            bossHealth,
            "background",
            "none"
        );
    }

    EnemyFactory.register("plane", buildPlane);
    EnemyFactory.register("spacefighter", buildSpacefighter);
    EnemyFactory.register("balloon", buildBalloon);
    EnemyFactory.register("satellite", buildSatellite);
    EnemyFactory.register("satelite", buildSatellite);
    EnemyFactory.register("fly", buildFly);
    EnemyFactory.register("e_fly2", buildFly);
    EnemyFactory.register("sunflower", buildSunflower);
    EnemyFactory.register("e_sunflower", buildSunflower);
    EnemyFactory.register("hawkbit", buildHawkbit);
    EnemyFactory.register("e_hawkbit", buildHawkbit);
    EnemyFactory.register("dragonfly", buildDragonfly);
    EnemyFactory.register("e_dragonfly", buildDragonfly);
    EnemyFactory.register("legacyGhostCircle", buildLegacyGhostCircle);
    EnemyFactory.register("e_ghostcircle", buildLegacyGhostCircle);
    EnemyFactory.register("hornet", buildHornet);
    EnemyFactory.register("e_fly", buildHornet);
    EnemyFactory.register("meteor", buildMeteor);
    EnemyFactory.register("rocket", buildMeteor);
    EnemyFactory.register("mushroomBoss", buildMushroomBoss);
    EnemyFactory.register("f_mushroom", buildMushroomBoss);

    set.enemy = spawnEnemy;
})();

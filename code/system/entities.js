(function exposeEntityManager(root) {
    "use strict";

    var DEFAULT_LAYER = "sprite";
    var dependentsByOwner = new WeakMap();
    var ownerByDependent = new WeakMap();

    function valueOr(options, key, fallback) {
        return options[key] === undefined ? fallback : options[key];
    }

    function normalizedOptions(options) {
        if (options && typeof options === "object") {
            return options;
        }
        if (Number.isFinite(options)) {
            return { active: options };
        }
        return {};
    }

    function normalizedEnemyOptions(rawOptions) {
        var options = Object.assign({
            active: 0,
            x: 0,
            y: 0,
        }, normalizedOptions(rawOptions));

        if (options.speedX === undefined && options.speedx !== undefined) {
            options.speedX = options.speedx;
        }
        if (options.speedY === undefined && options.speedy !== undefined) {
            options.speedY = options.speedy;
        }

        delete options.speedx;
        delete options.speedy;
        return options;
    }

    function addToSortedBackLayer(sprite) {
        var layer = root.backlayer;

        if (layer.children.length === 0) {
            layer.addChild(sprite);
            return;
        }

        for (var index = 0; index < layer.children.length; index++) {
            if (
                index === layer.children.length - 1
                || sprite.z <= layer.children[index].z
            ) {
                layer.addChildAt(sprite, index);
                return;
            }
        }
    }

    function attachToLayer(sprite, layerName) {
        if (layerName === "background") {
            root.background.addChild(sprite);
        }
        else if (layerName === "behindbackground") {
            root.background.addChildAt(sprite, 0);
        }
        else if (layerName === "backlayer") {
            root.backlayer.addChild(sprite);
        }
        else if (layerName === "behindbacklayer") {
            root.backlayer.addChildAt(sprite, 0);
        }
        else if (layerName === "sortbacklayer") {
            addToSortedBackLayer(sprite);
        }
        else if (layerName === "particle") {
            root.particlelayer.addChild(sprite);
        }
        else if (layerName === "sprite") {
            root.container.addChild(sprite);
        }
        else if (layerName === "spriteBack") {
            root.container.addChildAt(sprite, 0);
        }
        else if (layerName === "front") {
            root.frontlayer.addChild(sprite);
        }
        else if (layerName === "backfront") {
            root.frontlayer.addChildAt(sprite, 0);
        }
        else {
            // Preserve the legacy fallback for misspelled/custom layer names.
            root.container.addChildAt(sprite, 0);
        }

        sprite.entityLayer = layerName;
    }

    function initializeSprite(sprite, rawOptions) {
        var options = normalizedOptions(rawOptions);
        var activeAt = valueOr(options, "active", 0);
        var x = valueOr(options, "x", 0);
        var y = valueOr(options, "y", 0);

        sprite.visible = !(activeAt > 0);
        sprite.active = activeAt;
        sprite.ai = [[]];
        sprite.buffer = [];
        sprite.delete = false;
        sprite.x = x;
        sprite.y = y;
        sprite.z = valueOr(options, "z", 0);
        sprite.position.x = x;
        sprite.position.y = y;

        sprite.phase = 0;
        sprite.c1 = 0;
        sprite.c2 = 0;
        sprite.c3 = 0;
        sprite.counter = [];

        sprite.squarex = 0;
        sprite.squarey = 0;
        sprite.offsetX = 0;
        sprite.offsetY = 0;
        sprite.circle = 0;
        sprite.rotation = 0;
        root.fn.sethealth.call(sprite, 0);
        sprite.hit = 0;
        sprite.collision = "none";
        sprite.del = false;
        sprite.col = true;

        sprite.speedX = valueOr(options, "speedX", 0);
        sprite.speedY = valueOr(options, "speedY", 0);
        sprite.accX = valueOr(options, "accX", 0);
        sprite.accY = valueOr(options, "accY", 0);

        if (options.anchor && sprite.anchor) {
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
        }

        return sprite;
    }

    function addSprite(sprite, rawOptions) {
        var options = normalizedOptions(rawOptions);

        if (sprite.__soundstormRegistered) {
            throw new Error("Entity is already registered");
        }

        sprite.__soundstormRegistered = true;
        sprite.entityType = options.entityType || sprite.entityType || null;
        sprite.entityId = ++EntityManager.lastId;

        attachToLayer(sprite, options.layer || DEFAULT_LAYER);
        root.sprites.push(sprite);

        return sprite;
    }

    function registerSprite(sprite, options) {
        initializeSprite(sprite, options);
        return addSprite(sprite, options);
    }

    function isEntityReference(entity) {
        return entity !== null
            && (typeof entity === "object" || typeof entity === "function");
    }

    function addDependent(owner, dependent) {
        if (!isEntityReference(owner) || !isEntityReference(dependent)) {
            throw new TypeError(
                "EntityManager.addDependent requires an owner and dependent",
            );
        }
        if (owner === dependent) {
            throw new Error("An entity cannot depend on itself");
        }
        if (owner.__soundstormDestroyed || dependent.__soundstormDestroyed) {
            throw new Error("Destroyed entities cannot own dependencies");
        }

        var currentOwner = ownerByDependent.get(dependent);

        if (currentOwner && currentOwner !== owner) {
            throw new Error("Dependent entity already has an owner");
        }

        var dependents = dependentsByOwner.get(owner);
        if (!dependents) {
            dependents = new Set();
            dependentsByOwner.set(owner, dependents);
        }

        dependents.add(dependent);
        ownerByDependent.set(dependent, owner);
        return dependent;
    }

    function markStepVisual(sprite) {
        if (!isEntityReference(sprite)) {
            throw new TypeError(
                "EntityManager.markStepVisual requires an entity",
            );
        }
        if (sprite.__soundstormDestroyed) {
            throw new Error("Destroyed entities cannot become step visuals");
        }

        sprite.__soundstormStepVisual = true;
        return sprite;
    }

    function detachFromOwner(dependent) {
        var owner = ownerByDependent.get(dependent);
        if (!owner) {
            return;
        }

        var dependents = dependentsByOwner.get(owner);
        if (dependents) {
            dependents.delete(dependent);
            if (dependents.size === 0) {
                dependentsByOwner.delete(owner);
            }
        }

        ownerByDependent.delete(dependent);
    }

    function markDependentsForRemoval(owner) {
        var dependents = dependentsByOwner.get(owner);
        if (!dependents) {
            return;
        }

        dependentsByOwner.delete(owner);
        dependents.forEach(function markDependent(dependent) {
            if (ownerByDependent.get(dependent) === owner) {
                ownerByDependent.delete(dependent);
            }
            if (!dependent.__soundstormDestroyed) {
                dependent.delete = true;
                if (dependent.deleteReason === undefined) {
                    dependent.deleteReason = "owner-destroyed";
                }
            }
        });
    }

    function destroySprite(sprite) {
        if (!sprite || sprite.__soundstormDestroyed) {
            return;
        }

        sprite.__soundstormDestroyed = true;
        detachFromOwner(sprite);

        if (typeof sprite.onBeforeDestroy === "function") {
            sprite.onBeforeDestroy();
        }
        if (
            root.GameEffects
            && typeof root.GameEffects.disposeOwner === "function"
        ) {
            root.GameEffects.disposeOwner(sprite);
        }
        markDependentsForRemoval(sprite);
        if (sprite.parent && typeof sprite.parent.removeChild === "function") {
            sprite.parent.removeChild(sprite);
        }
        if (typeof sprite.destroy === "function") {
            sprite.destroy(false);
        }
    }

    var EntityManager = {
        lastId: 0,

        initialize: initializeSprite,
        add: addSprite,
        register: registerSprite,
        addDependent: addDependent,
        markStepVisual: markStepVisual,

        expireStepVisuals: function expireStepVisuals(list) {
            var entities = list || root.sprites;
            var removed = 0;

            for (var index = entities.length - 1; index >= 0; index--) {
                if (entities[index].__soundstormStepVisual === true) {
                    destroySprite(entities[index]);
                    entities.splice(index, 1);
                    removed++;
                }
            }

            return removed;
        },

        markForRemoval: function markForRemoval(sprite, reason) {
            if (!sprite) {
                return;
            }
            sprite.delete = true;
            sprite.deleteReason = reason || null;
        },

        flushDeleted: function flushDeleted(list) {
            var entities = list || root.sprites;
            var removed = 0;

            for (var index = entities.length - 1; index >= 0; index--) {
                if (entities[index].delete === true) {
                    destroySprite(entities[index]);
                    entities.splice(index, 1);
                    removed++;
                }
            }

            return removed;
        },

        clear: function clear(list) {
            var entities = list || root.sprites;

            for (var index = entities.length - 1; index >= 0; index--) {
                destroySprite(entities[index]);
            }
            entities.length = 0;
        },

        destroy: destroySprite,
    };

    var enemyDefinitions = Object.create(null);

    var EnemyFactory = {
        register: function register(kind, builder) {
            if (!kind || typeof builder !== "function") {
                throw new TypeError("EnemyFactory.register requires a kind and builder");
            }
            enemyDefinitions[kind] = builder;
        },

        has: function has(kind) {
            return typeof enemyDefinitions[kind] === "function";
        },

        option: valueOr,

        spawn: function spawn(kind, rawOptions) {
            var options = normalizedEnemyOptions(rawOptions);
            var builder = enemyDefinitions[kind];

            if (!builder) {
                throw new Error("Unknown enemy kind: " + kind);
            }

            var firstNewEntity = root.sprites.length;
            var enemy = builder(options);
            var createdEntities = root.sprites.slice(firstNewEntity);

            if (!enemy && createdEntities.length > 0) {
                enemy = createdEntities[0];
            }
            if (enemy) {
                enemy.entityType = kind;
            }

            return enemy;
        },

        kinds: function kinds() {
            return Object.keys(enemyDefinitions);
        },
    };

    root.spawnEnemy = function spawnEnemy(kind, options) {
        return EnemyFactory.spawn(kind, options);
    };
    root.EntityManager = EntityManager;
    root.EnemyFactory = EnemyFactory;
})(typeof window === "undefined" ? globalThis : window);

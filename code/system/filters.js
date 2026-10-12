var GameEffects = (function createGameEffects() {
    "use strict";

    var ownerRecords = new WeakMap();
    var ownedFilterOwners = new WeakMap();
    var disposedFilters = new WeakSet();

    function valueOr(options, key, fallback) {
        return options[key] === undefined ? fallback : options[key];
    }

    function normalizedOptions(options) {
        return options && typeof options === "object" ? options : {};
    }

    function isReference(value) {
        return (
            value !== null
            && (typeof value === "object" || typeof value === "function")
        );
    }

    function requireOwner(owner) {
        if (!isReference(owner)) {
            throw new TypeError("A filter owner must be an object");
        }
    }

    function requireFilter(filter) {
        if (!isReference(filter)) {
            throw new TypeError("A managed filter must be an object");
        }
        if (disposedFilters.has(filter)) {
            throw new Error("A disposed filter cannot be attached");
        }
    }

    function hasOwn(object, key) {
        return Object.prototype.hasOwnProperty.call(object, key);
    }

    function createRecord(owner) {
        return {
            owner: owner,
            entries: [],
            byName: Object.create(null),
            api: null,
        };
    }

    function recordFor(owner, createIfMissing) {
        requireOwner(owner);

        var record = ownerRecords.get(owner);
        if (!record && createIfMissing) {
            record = createRecord(owner);
            ownerRecords.set(owner, record);
        }
        return record;
    }

    function syncOwnerFilters(record) {
        if (record.entries.length === 0) {
            record.owner.filters = null;
            return;
        }

        record.owner.filters = record.entries.map(function filterFromEntry(entry) {
            return entry.filter;
        });
    }

    function claimOwnedFilter(owner, filter) {
        var currentOwner = ownedFilterOwners.get(filter);
        if (currentOwner && currentOwner !== owner) {
            throw new Error("An owned filter cannot belong to multiple owners");
        }
        ownedFilterOwners.set(filter, owner);
    }

    function releaseOwnedFilter(owner, filter) {
        if (ownedFilterOwners.get(filter) === owner) {
            ownedFilterOwners.delete(filter);
        }
    }

    function destroyFilter(filter) {
        if (!isReference(filter) || disposedFilters.has(filter)) {
            return;
        }

        disposedFilters.add(filter);
        if (typeof filter.destroy === "function") {
            filter.destroy();
        }
    }

    function attach(owner, name, filter, rawOptions) {
        var options = normalizedOptions(rawOptions);
        var record = recordFor(owner, true);
        var owned = valueOr(options, "owned", true) !== false;

        if (typeof name !== "string" || name.length === 0) {
            throw new TypeError("A managed filter needs a non-empty name");
        }
        requireFilter(filter);
        if (hasOwn(record.byName, name)) {
            throw new Error("Duplicate managed filter name: " + name);
        }
        for (var index = 0; index < record.entries.length; index++) {
            if (record.entries[index].filter === filter) {
                throw new Error("The same filter cannot be attached twice");
            }
        }

        if (owned) {
            claimOwnedFilter(owner, filter);
        }

        var entry = {
            name: name,
            filter: filter,
            owned: owned,
        };
        record.entries.push(entry);
        record.byName[name] = entry;

        try {
            syncOwnerFilters(record);
        }
        catch (error) {
            record.entries.pop();
            delete record.byName[name];
            if (owned) {
                releaseOwnedFilter(owner, filter);
            }
            throw error;
        }

        return filter;
    }

    function get(owner, name) {
        var record = recordFor(owner, false);
        if (!record || !hasOwn(record.byName, name)) {
            return null;
        }
        return record.byName[name].filter;
    }

    function remove(owner, name, rawOptions) {
        var options = normalizedOptions(rawOptions);
        var record = recordFor(owner, false);
        if (!record || !hasOwn(record.byName, name)) {
            return null;
        }

        var entry = record.byName[name];
        var index = record.entries.indexOf(entry);
        record.entries.splice(index, 1);
        delete record.byName[name];
        syncOwnerFilters(record);

        if (entry.owned) {
            releaseOwnedFilter(owner, entry.filter);
            if (valueOr(options, "destroy", true) !== false) {
                destroyFilter(entry.filter);
            }
        }

        return entry.filter;
    }

    function clearRecord(record, rawOptions) {
        var options = normalizedOptions(rawOptions);
        var entries = record.entries.slice();

        record.entries.length = 0;
        entries.forEach(function removeEntryName(entry) {
            delete record.byName[entry.name];
        });
        syncOwnerFilters(record);

        entries.forEach(function releaseEntry(entry) {
            if (!entry.owned) {
                return;
            }
            releaseOwnedFilter(record.owner, entry.filter);
            if (valueOr(options, "destroy", true) !== false) {
                destroyFilter(entry.filter);
            }
        });

        return entries.map(function filterFromEntry(entry) {
            return entry.filter;
        });
    }

    function clear(owner, options) {
        var record = recordFor(owner, false);
        return record ? clearRecord(record, options) : [];
    }

    function disposeOwner(owner) {
        var record = recordFor(owner, false);
        if (!record) {
            return;
        }

        clearRecord(record);
        ownerRecords.delete(owner);
    }

    function inspect(owner) {
        var record = recordFor(owner, false);
        if (!record) {
            return [];
        }

        return record.entries.map(function describeEntry(entry, index) {
            return {
                index: index,
                name: entry.name,
                owned: entry.owned,
                enabled: entry.filter.enabled !== false,
                type: (
                    entry.filter.constructor
                    && entry.filter.constructor.name
                ) || "Filter",
            };
        });
    }

    function stack(owner) {
        var record = recordFor(owner, true);
        if (!record.api) {
            record.api = Object.freeze({
                add: function add(name, filter, options) {
                    return attach(owner, name, filter, options);
                },
                get: function getByName(name) {
                    return get(owner, name);
                },
                remove: function removeByName(name, options) {
                    return remove(owner, name, options);
                },
                clear: function clearStack(options) {
                    return clear(owner, options);
                },
                inspect: function inspectStack() {
                    return inspect(owner);
                },
            });
        }
        return record.api;
    }

    function copyOptions(options) {
        var copy = {};
        Object.keys(options).forEach(function copyOption(key) {
            copy[key] = options[key];
        });
        return copy;
    }

    function createOutline(rawOptions) {
        var options = normalizedOptions(rawOptions);
        var filter = new PIXI.filters.OutlineFilter(
            valueOr(options, "size", 4),
            valueOr(options, "color", 0x222222),
            valueOr(options, "quality", 0.03)
        );
        if (settings.outline === false) {
            filter.enabled = false;
        }
        return filter;
    }

    function createGlow(rawOptions) {
        var options = normalizedOptions(rawOptions);
        var filterOptions = copyOptions(options);
        filterOptions.outerStrength = valueOr(options, "outerStrength", 0.1);
        filterOptions.color = valueOr(options, "color", 0xFFFFFF);
        filterOptions.distance = valueOr(options, "distance", 50);
        filterOptions.quality = valueOr(options, "quality", 0.01);

        var filter = new PIXI.filters.GlowFilter(filterOptions);
        if (!settings.outline) {
            filter.enabled = false;
        }
        return filter;
    }

    function createShadow(rawOptions) {
        var options = normalizedOptions(rawOptions);
        var filterOptions = copyOptions(options);
        filterOptions.shadowOnly = valueOr(options, "shadowOnly", false);

        var filter = new PIXI.filters.DropShadowFilter(filterOptions);
        if (!settings.shadow) {
            filter.enabled = false;
        }
        return filter;
    }

    function createAlpha(rawOptions) {
        var options = normalizedOptions(rawOptions);
        return new PIXI.AlphaFilter(valueOr(options, "alpha", 0));
    }

    function createHeightmap(texture, textureHeight, textureNormal, rawOptions) {
        var options = normalizedOptions(rawOptions);
        var filter = new HeightmapFilter(
            textureHeight,
            valueOr(options, "intensity", 20),
            texture,
            textureNormal
        );
        filter.scale.x = valueOr(options, "scaleX", 0);
        filter.scale.y = valueOr(options, "scaleY", 120);
        filter.light = valueOr(options, "light", 1.0);
        filter.invert = valueOr(options, "invert", -1.0);
        filter.repeat = valueOr(options, "repeat", 1.0);
        filter.normal = valueOr(options, "normal", {x: 0.0, y: 0.0});
        filter.factor = valueOr(options, "factor", {x: 1.0, y: 1.0});
        filter.offset = valueOr(options, "offset", {x: 0.0, y: 0.0});
        filter.zoom = valueOr(options, "zoom", 1.0);
        filter.alpha = valueOr(options, "alpha", 1.0);
        return filter;
    }

    function createGlobalFilters() {
        return {
            twist: new PIXI.filters.TwistFilter({
                angle: 10,
                radius: 0,
                enabled: false,
                offset: {x: 960, y: 540},
            }),
            shockwave: new PIXI.filters.ShockwaveFilter(
                {x: 0, y: 0},
                {
                    speed: 1000,
                    enabled: false,
                    amplitude: 50,
                    wavelength: 200,
                    brightness: 1.5,
                    radius: 1000,
                }
            ),
            adjust: new PIXI.filters.AdjustmentFilter({
                contrast: 0,
                enabled: false,
            }),
            motionblur: new PIXI.filters.MotionBlurFilter({
                enabled: false,
                kernel: 25,
                x: 0,
                y: 0,
            }),
            zoomblur: new PIXI.filters.ZoomBlurFilter({
                enabled: false,
                center: {x: 960, y: 540},
                strength: 0,
                radius: 1960,
            }),
        };
    }

    function createBackgroundAlpha() {
        return new PIXI.filters.AlphaFilter();
    }

    function createLightningFlash() {
        return new PIXI.filters.AdjustmentFilter({});
    }

    return Object.freeze({
        create: Object.freeze({
            outline: createOutline,
            glow: createGlow,
            shadow: createShadow,
            alpha: createAlpha,
            heightmap: createHeightmap,
            globalFilters: createGlobalFilters,
            backgroundAlpha: createBackgroundAlpha,
            lightningFlash: createLightningFlash,
        }),
        stack: stack,
        attach: attach,
        get: get,
        remove: remove,
        clear: clear,
        disposeOwner: disposeOwner,
        inspect: inspect,
    });
})();

var ScreenEffects = (function createScreenEffects(gameEffects) {
    "use strict";

    var filters = gameEffects.create.globalFilters();

    function clearContainer(owner) {
        if (!owner) {
            return [];
        }

        var removed = gameEffects.clear(owner);
        owner.filters = [];
        return removed;
    }

    function replace(owner, entries) {
        clearContainer(owner);
        var effects = gameEffects.stack(owner);

        entries.forEach(function attachEntry(entry) {
            effects.add(
                entry.name,
                entry.filter,
                {owned: entry.owned !== false}
            );
        });
        return effects;
    }

    function shared(name, filter) {
        return {
            name: name,
            filter: filter,
            owned: false,
        };
    }

    function owned(name, filter) {
        return {
            name: name,
            filter: filter,
            owned: true,
        };
    }

    function attachStage(stageOwner) {
        replace(stageOwner, [
            shared("shockwave", filters.shockwave),
            shared("twist", filters.twist),
        ]);
    }

    function attachGameplayBackground(backgroundOwner) {
        replace(backgroundOwner, [
            shared("adjust", filters.adjust),
            shared("zoomblur", filters.zoomblur),
            shared("motionblur", filters.motionblur),
        ]);
    }

    function attachAdjustmentBackground(backgroundOwner) {
        replace(backgroundOwner, [
            shared("adjust", filters.adjust),
        ]);
    }

    function attachBackgroundAlpha(backgroundOwner) {
        var alphaFilter = gameEffects.create.backgroundAlpha();
        replace(backgroundOwner, [
            owned("alpha", alphaFilter),
        ]);
        return alphaFilter;
    }

    function attachLightningFlash(backlayerOwner) {
        var flashFilter = gameEffects.create.lightningFlash();
        replace(backlayerOwner, [
            owned("lightning-flash", flashFilter),
        ]);
        return flashFilter;
    }

    function getLightningFlash(backlayerOwner) {
        return gameEffects.get(backlayerOwner, "lightning-flash");
    }

    function disposeStageGraph(stageOwner, backgroundOwner, backlayerOwner) {
        clearContainer(backgroundOwner);
        clearContainer(backlayerOwner);
        clearContainer(stageOwner);
    }

    function resetGlobalFilters() {
        filters.shockwave.enabled = false;
        filters.adjust.enabled = false;
        filters.motionblur.enabled = false;
        filters.zoomblur.enabled = false;
    }

    return Object.freeze({
        filters: filters,
        attachStage: attachStage,
        clearStage: clearContainer,
        attachGameplayBackground: attachGameplayBackground,
        attachAdjustmentBackground: attachAdjustmentBackground,
        attachBackgroundAlpha: attachBackgroundAlpha,
        clearBackground: clearContainer,
        attachLightningFlash: attachLightningFlash,
        getLightningFlash: getLightningFlash,
        clearBacklayer: clearContainer,
        disposeStageGraph: disposeStageGraph,
        resetGlobalFilters: resetGlobalFilters,
    });
})(GameEffects);

var globalfilters = ScreenEffects.filters;

var get = {}; // Compatibility helpers for existing sprite builders.

get.heightmap = function heightmap(texture, textureHeight, textureNormal, options) {
    return GameEffects.create.heightmap(
        texture,
        textureHeight,
        textureNormal,
        options
    );
};

// Keep the historical misspelling for external/older builders only.
get.heightfiler = get.heightmap;

get.outline = function outline(options) {
    return GameEffects.create.outline(options);
};

get.glowsingle = function glowsingle(options) {
    return GameEffects.create.glow(options);
};

get.shadow = function shadow(options) {
    return GameEffects.create.shadow(options);
};

get.alpha = function alpha(options) {
    return GameEffects.create.alpha(options);
};

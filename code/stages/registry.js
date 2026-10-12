var StageRegistry = (function createStageRegistry() {
    "use strict";

    var handlers = {
        0: stage0,
        1: stage1,
        2: stage2,

        // The historical file/function numbering is reversed for these acts.
        // Keeping the mapping explicit prevents a "cleanup" from swapping them.
        3: stage4,
        4: stage3,

        5: stage5,
    };

    function handlerFor(stageNumber) {
        if (stageNumber < 0) {
            return debugstage;
        }
        return handlers[stageNumber] || null;
    }

    function isAvailable(stageNumber) {
        if (stageNumber <= 1) {
            return true;
        }
        return stageNumber <= 5 && settings.version !== "demo";
    }

    function advanceExcludedPlaytestStage(stageNumber) {
        if (
            stageNumber >= 2
            && settings.version === "test"
            && !settings.playtest.includes(stageNumber)
        ) {
            stagecount++;
        }
    }

    function run(stageNumber) {
        var handler = handlerFor(stageNumber);
        if (!handler || !isAvailable(stageNumber)) {
            return false;
        }

        // Preserve the old same-tick behavior: choose the current handler first,
        // then advance the global counter when this stage is excluded.
        advanceExcludedPlaytestStage(stageNumber);
        handler();
        return true;
    }

    return Object.freeze({
        handlerFor: handlerFor,
        run: run,
    });
})();

(function installGamepadInputTest(root) {
    "use strict";

    var AXIS_THRESHOLD = 0.5;
    var ACTIONS = ["left", "right", "up", "down", "shield", "pause"];
    var KEYBOARD_BINDINGS = {
        ArrowLeft: {label: "LEFT ARROW", actions: ["left"]},
        ArrowRight: {label: "RIGHT ARROW", actions: ["right"]},
        ArrowUp: {label: "UP ARROW", actions: ["up"]},
        ArrowDown: {label: "DOWN ARROW", actions: ["down"]},
        KeyA: {label: "A", actions: ["left"]},
        KeyD: {label: "D", actions: ["right"]},
        KeyW: {label: "W", actions: ["up"]},
        KeyS: {label: "S", actions: ["down"]},
        Space: {label: "SPACE", actions: ["shield"]},
        KeyP: {label: "P", actions: ["pause"]},
    };
    var STANDARD_BUTTON_ACTIONS = {
        0: "shield",
        1: "shield",
        2: "shield",
        3: "shield",
        8: "pause",
        9: "pause",
        12: "up",
        13: "down",
        14: "left",
        15: "right",
        16: "pause",
    };
    var animationFrame = null;
    var keyboardListenersInstalled = false;
    var pressedKeyboardCodes = {};

    function finiteNumber(value, fallback) {
        var number = Number(value);
        return Number.isFinite(number) ? number : fallback;
    }

    function buttonPressed(button) {
        return Boolean(button && (
            button.pressed === true
            || finiteNumber(button.value, 0) > AXIS_THRESHOLD
        ));
    }

    function axisValue(gamepad, index) {
        if (!gamepad || !gamepad.axes) {
            return 0;
        }
        return finiteNumber(gamepad.axes[index], 0);
    }

    function emptyActions() {
        return {
            left: false,
            right: false,
            up: false,
            down: false,
            shield: false,
            pause: false,
        };
    }

    function standardActions(gamepad) {
        var actions = emptyActions();
        var buttons = gamepad && gamepad.buttons || [];

        if (!gamepad || gamepad.mapping !== "standard") {
            return actions;
        }

        actions.shield = [0, 1, 2, 3].some(function faceButton(index) {
            return buttonPressed(buttons[index]);
        });
        actions.pause = [8, 9, 16].some(function menuButton(index) {
            return buttonPressed(buttons[index]);
        });
        actions.up = buttonPressed(buttons[12]) || axisValue(gamepad, 1) < -AXIS_THRESHOLD;
        actions.down = buttonPressed(buttons[13]) || axisValue(gamepad, 1) > AXIS_THRESHOLD;
        actions.left = buttonPressed(buttons[14]) || axisValue(gamepad, 0) < -AXIS_THRESHOLD;
        actions.right = buttonPressed(buttons[15]) || axisValue(gamepad, 0) > AXIS_THRESHOLD;
        return actions;
    }

    function mappingIsActive(gamepad, mapping) {
        if (!gamepad || !mapping) {
            return false;
        }

        var index = finiteNumber(mapping.index, -1);
        if (index < 0) {
            return false;
        }
        if (finiteNumber(mapping.axis, 0) !== 0) {
            return axisValue(gamepad, index) * finiteNumber(mapping.axis, 0) > AXIS_THRESHOLD;
        }
        return buttonPressed((gamepad.buttons || [])[index]);
    }

    function customActions(gamepad, controlMapping) {
        var actions = emptyActions();

        ACTIONS.forEach(function readMappedAction(action) {
            actions[action] = mappingIsActive(gamepad, controlMapping && controlMapping[action]);
        });
        return actions;
    }

    function keyboardActions(codes) {
        var actions = emptyActions();

        Array.from(codes || []).forEach(function readKeyboardAction(code) {
            var binding = KEYBOARD_BINDINGS[code];
            if (!binding) {
                return;
            }
            binding.actions.forEach(function activate(action) {
                actions[action] = true;
            });
        });
        return actions;
    }

    function activeKeyboardCodes() {
        return Object.keys(pressedKeyboardCodes).filter(function pressed(code) {
            return pressedKeyboardCodes[code] === true;
        });
    }

    function activeInputs(gamepad) {
        var inputs = [];

        (gamepad && gamepad.buttons || []).forEach(function pressedButton(button, index) {
            if (buttonPressed(button)) {
                inputs.push({
                    type: "button",
                    index: index,
                    value: finiteNumber(button.value, 1),
                });
            }
        });
        (gamepad && gamepad.axes || []).forEach(function movedAxis(value, index) {
            var numericValue = finiteNumber(value, 0);
            if (Math.abs(numericValue) > AXIS_THRESHOLD) {
                inputs.push({
                    type: "axis",
                    index: index,
                    direction: numericValue < 0 ? -1 : 1,
                    value: numericValue,
                });
            }
        });
        return inputs;
    }

    function standardActionForInput(input, gamepad) {
        if (!gamepad || gamepad.mapping !== "standard") {
            return null;
        }
        if (input.type === "button") {
            return STANDARD_BUTTON_ACTIONS[input.index] || null;
        }
        if (input.type === "axis" && input.index === 0) {
            return input.direction < 0 ? "left" : "right";
        }
        if (input.type === "axis" && input.index === 1) {
            return input.direction < 0 ? "up" : "down";
        }
        return null;
    }

    function customActionsForInput(input, controlMapping) {
        return ACTIONS.filter(function inputMatchesAction(action) {
            var mapping = controlMapping && controlMapping[action];
            if (!mapping || finiteNumber(mapping.index, -1) !== input.index) {
                return false;
            }
            var mappingAxis = finiteNumber(mapping.axis, 0);
            if (input.type === "button") {
                return mappingAxis === 0;
            }
            return mappingAxis !== 0 && mappingAxis === input.direction;
        });
    }

    function actionLabel(action) {
        if (action === "left" || action === "right" || action === "up" || action === "down") {
            return "MOVE " + action.toUpperCase();
        }
        return action ? action.toUpperCase() : "NOT ASSIGNED";
    }

    function describeKeyboardInput(code) {
        var binding = KEYBOARD_BINDINGS[code];
        if (!binding) {
            return "KEYBOARD " + code + " → NOT ASSIGNED";
        }
        return "KEYBOARD " + binding.label + " → "
            + (binding.displayActions || binding.actions).map(actionLabel).join(" + ");
    }

    function describeInput(input, gamepad, controlMapping) {
        var name = input.type === "button"
            ? "BUTTON " + input.index
            : "AXIS " + input.index + " " + input.value.toFixed(2);
        var customMatches = customActionsForInput(input, controlMapping);
        var actions = controlMapping
            ? customMatches
            : [standardActionForInput(input, gamepad)];
        if (actions.length === 0) {
            actions = [null];
        }
        return name + " → " + actions.map(actionLabel).join(" + ");
    }

    function connectedGamepads() {
        if (!root.navigator || typeof root.navigator.getGamepads !== "function") {
            return [];
        }
        return Array.from(root.navigator.getGamepads() || []).filter(function connected(gamepad) {
            return Boolean(gamepad && gamepad.connected !== false);
        });
    }

    function currentGamepad(gamepads) {
        var selectedIndex = finiteNumber(root.gamepad_id, -1);
        return gamepads.find(function selected(gamepad) {
            return gamepad.index === selectedIndex;
        }) || gamepads[0] || null;
    }

    function currentControlMapping(gamepad) {
        var control = root.document && root.document.getElementById("control");
        if (!control || control.value !== "gamepad" || !gamepad || !root.controlmap) {
            return null;
        }
        return root.controlmap[gamepad.index] || null;
    }

    function editableTarget(target) {
        if (!target) {
            return false;
        }
        var tagName = String(target.tagName || "").toLowerCase();
        return tagName === "input"
            || tagName === "textarea"
            || tagName === "select"
            || target.isContentEditable === true;
    }

    function handleKeyboardDown(event) {
        var code = event && event.code;
        if (root.play === true || !KEYBOARD_BINDINGS[code] || editableTarget(event.target)) {
            return;
        }
        pressedKeyboardCodes[code] = true;
        if (typeof event.preventDefault === "function") {
            event.preventDefault();
        }
        render();
    }

    function handleKeyboardUp(event) {
        var code = event && event.code;
        if (!KEYBOARD_BINDINGS[code] || editableTarget(event.target)) {
            return;
        }
        delete pressedKeyboardCodes[code];
        if (typeof event.preventDefault === "function") {
            event.preventDefault();
        }
        if (root.play !== true) {
            render();
        }
    }

    function clearKeyboardState() {
        pressedKeyboardCodes = {};
        if (root.play !== true) {
            render();
        }
    }

    function installKeyboardListeners() {
        if (keyboardListenersInstalled || !root.document) {
            return;
        }
        root.document.addEventListener("keydown", handleKeyboardDown);
        root.document.addEventListener("keyup", handleKeyboardUp);
        if (typeof root.addEventListener === "function") {
            root.addEventListener("blur", clearKeyboardState);
        }
        keyboardListenersInstalled = true;
    }

    function uninstallKeyboardListeners() {
        if (!keyboardListenersInstalled || !root.document) {
            return;
        }
        root.document.removeEventListener("keydown", handleKeyboardDown);
        root.document.removeEventListener("keyup", handleKeyboardUp);
        if (typeof root.removeEventListener === "function") {
            root.removeEventListener("blur", clearKeyboardState);
        }
        pressedKeyboardCodes = {};
        keyboardListenersInstalled = false;
    }

    function toggleActive(selector, active) {
        if (!root.document) {
            return;
        }
        Array.from(root.document.querySelectorAll(selector)).forEach(function toggle(element) {
            element.classList.toggle("is-active", Boolean(active));
        });
    }

    function clearVisualState() {
        if (!root.document) {
            return;
        }
        Array.from(root.document.querySelectorAll("#inputtestvisual .is-active")).forEach(function clear(element) {
            element.classList.remove("is-active");
        });
    }

    function setGamepadSignal(gamepad, active) {
        if (!root.document) {
            return;
        }
        var wrapper = root.document.getElementById("gamepadtestsignal");
        var statusElement = root.document.getElementById("gamepadteststatus");
        var connected = Boolean(gamepad);

        if (wrapper) {
            wrapper.setAttribute("data-connected", connected ? "true" : "false");
            wrapper.setAttribute("data-active", active ? "true" : "false");
            wrapper.setAttribute("aria-hidden", connected ? "false" : "true");
        }
        if (statusElement) {
            statusElement.textContent = connected ? gamepad.id || "GAMEPAD" : "";
        }
    }

    function render(gamepadOverride) {
        var hasOverride = arguments.length > 0;
        var gamepads = hasOverride ? [gamepadOverride] : connectedGamepads();
        var gamepad = hasOverride ? gamepadOverride : currentGamepad(gamepads);
        var controlMapping = gamepad ? currentControlMapping(gamepad) : null;
        var gamepadActions = gamepad
            ? controlMapping
                ? customActions(gamepad, controlMapping)
                : standardActions(gamepad)
            : emptyActions();
        var keyboardCodes = activeKeyboardCodes();
        var currentKeyboardActions = keyboardActions(keyboardCodes);
        var actions = emptyActions();
        var gamepadInputs = activeInputs(gamepad);
        var descriptions = keyboardCodes.map(describeKeyboardInput);

        clearVisualState();
        Object.keys(actions).forEach(function mergeAction(action) {
            actions[action] = Boolean(gamepadActions[action] || currentKeyboardActions[action]);
        });

        if (root.document) {
            Array.from(root.document.querySelectorAll("[data-key-codes]")).forEach(function showKeyboardKey(element) {
                var codes = String(element.getAttribute("data-key-codes") || "").split(/\s+/);
                element.classList.toggle("is-active", codes.some(function activeCode(code) {
                    return pressedKeyboardCodes[code] === true;
                }));
            });
            Array.from(root.document.querySelectorAll("[data-gamepad-button]")).forEach(function showButton(element) {
                var index = finiteNumber(element.getAttribute("data-gamepad-button"), -1);
                var action = element.getAttribute("data-gamepad-action");
                var directionalAction = ["left", "right", "up", "down"].includes(action);
                var keyboardAction = action === "shield"
                    ? currentKeyboardActions.shield
                    : currentKeyboardActions[action];
                var customGamepadAction = gamepad
                    && gamepad.mapping !== "standard"
                    && gamepadActions[action];
                var active = buttonPressed((gamepad && gamepad.buttons || [])[index])
                    || keyboardAction
                    || customGamepadAction
                    || (directionalAction && gamepadActions[action]);
                element.classList.toggle("is-active", Boolean(active));
            });
        }
        toggleActive(
            '[data-gamepad-axis="0"]',
            Math.abs(axisValue(gamepad, 0)) > AXIS_THRESHOLD
                || Math.abs(axisValue(gamepad, 1)) > AXIS_THRESHOLD
                || currentKeyboardActions.left
                || currentKeyboardActions.right
                || currentKeyboardActions.up
                || currentKeyboardActions.down
                || (controlMapping && (
                    gamepadActions.left
                    || gamepadActions.right
                    || gamepadActions.up
                    || gamepadActions.down
                ))
        );

        descriptions = descriptions.concat(gamepadInputs.slice(0, 4).map(function describe(input) {
                return describeInput(input, gamepad, controlMapping);
            }));
        var inputText = descriptions.slice(0, 6).join("  /  ");

        setGamepadSignal(gamepad, gamepadInputs.length > 0);
        return {
            gamepad: gamepad,
            actions: actions,
            gamepadActions: gamepadActions,
            gamepadInputs: gamepadInputs,
            keyboardActions: currentKeyboardActions,
            keyboardCodes: keyboardCodes,
            inputText: inputText,
        };
    }

    function loop() {
        if (root.play === true) {
            uninstallKeyboardListeners();
            animationFrame = null;
            return;
        }
        render();
        animationFrame = root.requestAnimationFrame(loop);
    }

    function start() {
        installKeyboardListeners();
        if (animationFrame !== null || typeof root.requestAnimationFrame !== "function") {
            render();
            return;
        }
        render();
        animationFrame = root.requestAnimationFrame(loop);
    }

    function stop() {
        if (animationFrame !== null && typeof root.cancelAnimationFrame === "function") {
            root.cancelAnimationFrame(animationFrame);
        }
        animationFrame = null;
        uninstallKeyboardListeners();
    }

    root.GamepadInputTest = {
        activeInputs: activeInputs,
        customActions: customActions,
        describeKeyboardInput: describeKeyboardInput,
        describeInput: describeInput,
        keyboardActions: keyboardActions,
        render: render,
        standardActions: standardActions,
        start: start,
        stop: stop,
    };
})(typeof window !== "undefined" ? window : globalThis);

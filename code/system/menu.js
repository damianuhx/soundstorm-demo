var MenuController = (function createMenuController()
{
    "use strict";

    var optionBindings = {
        startstage: function bindStartStage(index) {
            startstage=index+1;
        },
        cantdie: function bindInvincibility(index) {
            cantdie=index;
        },
        stage: function bindStage(index) {
            startstage=index;
        },
        nobullets: function bindBulletSetting(index) {
            nobullets=index;
        },
        trystock: function bindTrySetting(index) {
            trystock=index ? 42 : 3;
        },
        difficulty: function bindDifficulty(index) {
            difficulty.set(index+1);
        }
    };

    function resolve(value)
    {
        return typeof value === "function" ? value() : value;
    }

    function render(items)
    {
        items.forEach(function renderItem(item) {
            var value=resolve(item.value);
            var options=resolve(item.options) || {};

            if (item.kind==="menu"){
                cmenu(value, item.position, item.x, item.y, options);
            }
            else if (item.kind==="picture"){
                set.menupic(value, item.x, item.y, item.scene, options);
            }
        });
    }

    function resetGameOptions()
    {
        startstage=1;
        cantdie=0;
        nobullets=0;
        trystock=3;
    }

    function acceptsDirectionalInput()
    {
        return inputcontrol==="key" || inputcontrol==="gamepad";
    }

    function navigateLinear(options)
    {
        if (!acceptsDirectionalInput()){
            return;
        }

        var key=options.key;
        if (
            options.previous
            && menuposition[key]>options.min
            && remember.wait<0
        ){
            remember.wait=options.moveWait;
            menuposition[key]--;
        }
        if (
            options.next
            && menuposition[key]<options.max
            && remember.wait<0
        ){
            remember.wait=options.moveWait;
            menuposition[key]++;
        }
        if (
            options.confirm
            && remember.wait<0
            && (!options.canConfirm || options.canConfirm(menuposition[key]))
        ){
            menuselected[key]=menuposition[key];
            remember.wait=options.selectWait;
        }
    }

    function applyOption(name, index)
    {
        if (optionBindings[name]){
            optionBindings[name](index);
        }
    }

    return Object.freeze({
        acceptsDirectionalInput: acceptsDirectionalInput,
        applyOption: applyOption,
        navigateLinear: navigateLinear,
        render: render,
        resetGameOptions: resetGameOptions
    });
})();

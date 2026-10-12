var Stage0Menu = (function createStage0Menu()
{
    "use strict";

    var mainMenuItems = [
        {
            kind: "menu",
            value: "NORMAL\n   GAME",
            position: 1,
            x: 360,
            y: 920,
            options: {key: 0, fontsize: 100}
        },
        {
            kind: "menu",
            value: "  SCORE\nATTACK",
            position: 2,
            x: 960,
            y: 920,
            options: {key: 0, fontsize: 100}
        },
        {
            kind: "menu",
            value: "CUSTOM\n   GAME",
            position: 3,
            x: 1560,
            y: 920,
            options: {key: 0, fontsize: 100}
        }
    ];

    var difficultyMenuItems = [
        {
            kind: "menu",
            value: "    CASUAL\nDIFFICULTY",
            position: 1,
            x: 250,
            y: 900,
            options: {key: 1, fontsize: 72}
        },
        {
            kind: "menu",
            value: "   SERIOUS\nDIFFICULTY",
            position: 2,
            x: 750,
            y: 900,
            options: {key: 1, fontsize: 72}
        },
        {
            kind: "menu",
            value: "     INSANE\nDIFFICULTY",
            position: 3,
            x: 1250,
            y: 900,
            options: {key: 1, fontsize: 72}
        },
        {
            kind: "menu",
            value: "     EXIT TO\nMAIN MENU",
            position: 4,
            x: 1700,
            y: 900,
            options: {key: 1, fontsize: 72}
        }
    ];

    var difficultyNotes = [
        {
            kind: "picture",
            value: "     RECOMMENDED\nFOR MOST PLAYERS",
            x: 250,
            y: 1020,
            options: {fontsize: 36}
        },
        {
            kind: "picture",
            value: " VETERANS FAMILIAR WITH \nSHMUPS OR RYTHM GAMES",
            x: 750,
            y: 1020,
            options: {fontsize: 36}
        },
        {
            kind: "picture",
            value: "THE ULTIMATE CHALLENGE\n     FOR SHMUP MANIACS",
            x: 1250,
            y: 1020,
            options: {fontsize: 36}
        }
    ];

    function currentTouchPoint()
    {
        if (inputcontrol!=="touch" || typeof ReplaySystem==="undefined"){
            return null;
        }
        var pointerData=ReplaySystem.currentPointerData();
        return pointerData && pointerData.global || null;
    }

    var scoreRows = [
        {stage: 1, texture: function () {return tTrip01;}, y: 200, acts: 3},
        {stage: 2, texture: function () {return tTrip02;}, y: 360, acts: 3},
        {stage: 3, texture: function () {return tex.trip04;}, y: 520, acts: 4},
        {stage: 4, texture: function () {return tex.trip03;}, y: 680, acts: 4},
        {stage: 5, texture: function () {return tex.trip05;}, y: 840, acts: 4}
    ];

    function stageButtonId(stageNumber, actNumber)
    {
        return (stageNumber-1)*10+actNumber;
    }

    function scoreRowAvailable(stageNumber)
    {
        if (stageNumber===1){
            return settings.version!=="test" || settings.playtest.includes(1);
        }
        return (
            settings.version!=="test"
            && settings.version!=="demo"
        ) || settings.playtest.includes(stageNumber);
    }

    function scoreRowOptions(stageNumber, available)
    {
        if (!available){
            return {version: "demo"};
        }
        if (stageNumber===1){
            return {};
        }
        return {version: settings.version};
    }

    function renderScoreRow(row)
    {
        if (row.stage>1 && settings.version==="demo"){
            return;
        }

        var available=scoreRowAvailable(row.stage);
        var rowOptions=scoreRowOptions(row.stage, available);
        set.menupic(
            row.texture(),
            120,
            row.y-75,
            9,
            rowOptions
        );

        for (var act=1; act<=row.acts; act++){
            var position=stageButtonId(row.stage, act);
            cmenu(
                "ACT "+act,
                position,
                [0, 650, 1000, 1350, 1650][act],
                row.y,
                {
                    version: rowOptions.version,
                    key: 2,
                    fontsize: 100
                }
            );
            if (row.stage===1 && available){
                set.menupic(
                    (
                        getCookie(
                            "score"
                            +row.stage
                            +act
                            +"d"
                            +difficulty.general
                        ) || 0
                    ).toString(),
                    [0, 650, 1000, 1350, 1650][act],
                    row.y+70,
                    9,
                    {fontsize: 50}
                );
            }
        }

        if (row.stage!==1 && available){
            for (var scoreAct=1; scoreAct<=row.acts; scoreAct++){
                set.menupic(
                    (
                        getCookie(
                            "score"
                            +row.stage
                            +scoreAct
                            +"d"
                            +difficulty.general
                        ) || 0
                    ).toString(),
                    [0, 650, 1000, 1350, 1650][scoreAct],
                    row.y+70,
                    9,
                    {fontsize: 50}
                );
            }
        }
    }

    function enterMainMenu()
    {
        if (!(ticks>600 || (shoot && ticks>100))){
            return;
        }

        menuselected[0]=0;
        remember.scoreattack=false;
        MenuController.resetGameOptions();
        MenuController.render(mainMenuItems);
        remember.wait=50;
        scene++;
    }

    function updateMainMenu()
    {
        var touchPoint=currentTouchPoint();
        MenuController.navigateLinear({
            key: 0,
            previous: left,
            next: right,
            confirm: shoot,
            min: 1,
            max: 3,
            moveWait: 10,
            selectWait: 150
        });

        if (touchPoint && (keys.shoot.touch || touch) && touchPoint.y>700){
            remember.wait=150;
            if (touchPoint.x<660){
                menuselected[0]=1;
            }
            else if (touchPoint.x>1260){
                menuselected[0]=3;
            }
            else{
                menuselected[0]=2;
            }
        }

        if (menuselected[0]>0){
            if (menuselected[0]===1){
                scene=6;
            }
            else if (menuselected[0]===2){
                scene=6.5;
            }
            else{
                scene=10;
            }

            menuposition[2]=1;
            remember.wait=150;
        }
    }

    function enterDifficultyMenu()
    {
        menuposition[1]=1;
        menuselected[1]=0;
        MenuController.resetGameOptions();
        MenuController.render(difficultyMenuItems);
        MenuController.render(difficultyNotes.map(function withScene(item) {
            return {
                kind: item.kind,
                value: item.value,
                x: item.x,
                y: item.y,
                scene: scene+1,
                options: item.options
            };
        }));
        scene++;
    }

    function updateDifficultyMenu()
    {
        var touchPoint=currentTouchPoint();
        if (menuselected[1]===0){
            MenuController.navigateLinear({
                key: 1,
                previous: left,
                next: right,
                confirm: shoot,
                min: 1,
                max: 4,
                moveWait: 10,
                selectWait: 100
            });
        }

        if (
            touchPoint
            && menuselected[1]===0
            && (keys.shoot.touch || touch)
            && touchPoint.y>700
            && remember.wait<0
        ){
            if (touchPoint.x<500){
                menuselected[1]=1;
            }
            else if (touchPoint.x>500 && touchPoint.x<1000){
                menuselected[1]=2;
            }
            else if (touchPoint.x>1000 && touchPoint.x<1500){
                menuselected[1]=3;
            }
            else{
                menuselected[1]=4;
            }
            remember.wait=150;
        }

        if (menuselected[1]>0){
            if (menuselected[1]<4){
                stage.alpha-=0.01;
            }
            else{
                scene=4;
                remember.wait=100;
            }

            if (remember.wait<0){
                if (menuselected[1]===1){
                    difficulty.set(1);
                }
                if (menuselected[1]===2){
                    difficulty.set(2);
                }
                if (menuselected[1]===3){
                    difficulty.set(3);
                }

                if (scene===7){
                    trystock=3;
                    scoretotal=0;
                    remember.save=true;
                    scene=12;
                    tutorialgoals=0;
                }
                else{
                    scene=8;
                }
            }
        }
    }

    function enterScoreAttackMenu()
    {
        menuselected[2]=0;
        MenuController.resetGameOptions();
        set.menupic(
            difficulty.name+" SCORE ATTACK",
            960,
            60,
            9,
            {fontsize: 100, font: "inline"}
        );
        scoreRows.forEach(renderScoreRow);
        cmenu(
            "EXIT TO MAIN MENU",
            51,
            960,
            1000,
            {key: 2, fontsize: 100}
        );
        scene++;
    }

    function canChooseScorePosition(position)
    {
        if (position===51){return true;}
        var stageNumber=Math.floor(position/10)+1;
        var actNumber=position%10;
        var row=scoreRows.find(function (item) {return item.stage===stageNumber;});
        return Boolean(row && actNumber>=1 && actNumber<=row.acts
            && (settings.version!=="demo" || stageNumber===1)
            && scoreRowAvailable(stageNumber));
    }

    function updateScoreCursor()
    {
        if (!MenuController.acceptsDirectionalInput()){
            return;
        }

        if (left && menuposition[2]%10>1 && remember.wait<0){
            remember.wait=10;
            menuposition[2]--;
        }
        if (right && menuposition[2]%10<4 && remember.wait<0){
            remember.wait=10;
            menuposition[2]++;
        }
        if (up && menuposition[2]>10 && remember.wait<0){
            remember.wait=10;
            menuposition[2]=settings.version==="demo" ? 1 : menuposition[2]-10;
        }
        if (down && menuposition[2]<50 && remember.wait<0){
            remember.wait=10;
            menuposition[2]=settings.version==="demo" ? 51 : menuposition[2]+10;
        }
        if (menuposition[2]===4){menuposition[2]=3;}
        if (menuposition[2]===14){menuposition[2]=13;}
        if (menuposition[2]>51){menuposition[2]=51;}
        if (
            shoot
            && remember.wait<0
            && canChooseScorePosition(menuposition[2])
        ){
            menuselected[2]=menuposition[2];
            remember.wait=100;
        }
    }

    function scorePositionFromTouch(x, y)
    {
        if (y<240){
            if (x<1000){return 1;}
            if (x<1350){return 2;}
            return 3;
        }
        if (y<420){
            if (x<1000){return 11;}
            if (x<1350){return 12;}
            return 13;
        }
        if (y<600){
            if (x<1000){return 21;}
            if (x<1350){return 22;}
            if (x<1650){return 23;}
            return 24;
        }
        if (y<780){
            if (x<1000){return 31;}
            if (x<1350){return 32;}
            if (x<1650){return 33;}
            return 34;
        }
        if (y<940){
            if (x<1000){return 41;}
            if (x<1350){return 42;}
            if (x<1650){return 43;}
            return 44;
        }
        return 51;
    }

    function updateScoreAttackMenu()
    {
        var touchPoint=currentTouchPoint();
        updateScoreCursor();

        if (touchPoint && (keys.shoot.touch || touch) && remember.wait<0){
            var touchedPosition=scorePositionFromTouch(touchPoint.x, touchPoint.y);
            if (canChooseScorePosition(touchedPosition)){
                remember.wait=100;
                menuselected[2]=touchedPosition;
            }
        }

        if (menuselected[2]>0){
            if (menuselected[2]<50){
                menuposition[2]=menuselected[2];
                stage.alpha-=0.01;
            }
            else{
                scene=1;
                ticks=0;
                skipscene=0;
                clear_sprites();
                playing="nowloading";
                music[playing].play();
                remember.wait=100;
            }

            if (remember.wait<-100){
                remember.save=false;
                remember.scoreattack=true;
                beginAnonymousGameSession();
                stagecount=Math.ceil(menuselected[2]/10);
                actcount=menuselected[2]%10;
                trystock=42;
                scoretotal=0;
                log2db("scoreattackstart");
                globalreset();
                startscreen();
            }
        }
    }

    function customStartStage()
    {
        if (settings.version==="demo"){
            return {
                text: "ONE",
                values: ["ONE"]
            };
        }
        if (settings.version==="test"){
            return {
                text: settings.playtest[0],
                values: settings.playtest
            };
        }
        return {
            text: "ONE",
            values: ["ONE", "TWO", "THREE", "FOUR", "FIVE"]
        };
    }

    function customMenuItems()
    {
        var start=customStartStage();
        return [
            {
                kind: "picture",
                value: "START STAGE",
                x: 700,
                y: 60,
                scene: 11,
                options: {fontsize: 100}
            },
            {
                kind: "menu",
                value: start.text,
                position: 1,
                x: 1360,
                y: 60,
                options: {
                    setvalue: "startstage",
                    scene: 10,
                    key: 3,
                    fontsize: 100,
                    settings: start.values
                }
            },
            {
                kind: "picture",
                value: "DIFFICULTY",
                x: 700,
                y: 210,
                scene: 11,
                options: {fontsize: 100}
            },
            {
                kind: "menu",
                value: "CASUAL",
                position: 2,
                x: 1360,
                y: 210,
                options: {
                    setvalue: "difficulty",
                    scene: 10,
                    key: 3,
                    fontsize: 100,
                    settings: ["CASUAL", "SERIOUS", "INSANE"]
                }
            },
            {
                kind: "picture",
                value: "MANY TRIES",
                x: 700,
                y: 360,
                scene: 11,
                options: {fontsize: 100}
            },
            {
                kind: "menu",
                value: "OFF",
                position: 3,
                x: 1360,
                y: 360,
                options: {
                    setvalue: "trystock",
                    scene: 10,
                    key: 3,
                    fontsize: 100,
                    settings: ["OFF", "ON"]
                }
            },
            {
                kind: "picture",
                value: "INVINCIBLE",
                x: 700,
                y: 510,
                scene: 11,
                options: {fontsize: 100}
            },
            {
                kind: "menu",
                value: "OFF",
                position: 4,
                x: 1360,
                y: 510,
                options: {
                    setvalue: "cantdie",
                    scene: 10,
                    key: 3,
                    fontsize: 100,
                    settings: ["OFF", "ON"]
                }
            },
            {
                kind: "picture",
                value: "NO BULLETS",
                x: 700,
                y: 660,
                scene: 11,
                options: {fontsize: 100}
            },
            {
                kind: "menu",
                value: "OFF",
                position: 5,
                x: 1360,
                y: 660,
                options: {
                    setvalue: "nobullets",
                    scene: 10,
                    key: 3,
                    fontsize: 100,
                    settings: ["OFF", "ON"]
                }
            },
            {
                kind: "menu",
                value: "START CUSTOM GAME",
                position: 6,
                x: 960,
                y: 850,
                options: {key: 3, fontsize: 100}
            },
            {
                kind: "menu",
                value: "EXIT TO MAIN MENU",
                position: 7,
                x: 960,
                y: 1000,
                options: {key: 3, fontsize: 100}
            }
        ];
    }

    function enterCustomMenu()
    {
        menuposition[3]=1;
        menuselected[3]=0;
        difficulty.set(1);
        MenuController.resetGameOptions();
        MenuController.render(customMenuItems());
        scene++;
    }

    function updateCustomMenu()
    {
        MenuController.navigateLinear({
            key: 3,
            previous: up,
            next: down,
            confirm: shoot,
            min: 1,
            max: 7,
            moveWait: 10,
            selectWait: 10
        });

        if (menuselected[3]===7){
            scene=3;
            remember.wait=100;
        }
        if (menuselected[3]>=6){
            stage.alpha-=0.01;
            if (remember.wait<-100){
                if (menuselected[3]===6){
                    beginAnonymousGameSession();
                    if (settings.version!=="test"){
                        stagecount=startstage;
                    }
                    else{
                        stagecount=settings.playtest[startstage-1];
                    }
                    if (stagecount<1){
                        stagecount=1;
                    }
                    actcount=1;
                    scene=1;
                }
                if (menuselected[3]===7){
                    scene=4;
                    remember.wait=100;
                    remember.save=false;

                    stagecount=0;
                    actcount=1;
                    startstage=0;
                    cantdie=0;
                    nobullets=0;
                    invincible=0;

                    trystock=Number(getCookie("trystock")) || 3;
                    scoretotal=Number(getCookie("scoretotal")) || 0;
                    remember.extend=Math.floor(scoretotal+1000/2000);
                    globalreset();
                    startscreen();
                }
            }
        }
    }

    function update()
    {
        if (scene===4 && !stagecount){
            enterMainMenu();
        }
        if (scene===5){
            updateMainMenu();
        }
        if (scene>=6 && scene<7){
            enterDifficultyMenu();
        }
        if (scene>=7 && scene<8){
            updateDifficultyMenu();
        }
        if (scene===8){
            enterScoreAttackMenu();
        }
        if (scene===9){
            updateScoreAttackMenu();
        }
        if (scene===10 && !stagecount){
            enterCustomMenu();
        }
        if (scene===11 && !stagecount){
            updateCustomMenu();
        }
    }

    return Object.freeze({
        scorePositionFromTouch: scorePositionFromTouch,
        update: update
    });
})();

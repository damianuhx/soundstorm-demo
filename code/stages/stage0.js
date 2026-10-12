function stage0()
{
    if (typeof ReplaySystem !== "undefined" && ReplaySystem.shouldDeferMenuReset()) {
        return;
    }
    //Initialize and display title screen
    if (scene==1 && !stagecount){
        clear_sprites();
        globalreset();
        nobullets=0;
        cantdie=0;
        remember.extend=0;
        lifestock=2;
        resettime();
        scoretotal=0;
        ticks=0;
        scene++;
        stage.alpha=0;
        set.foresttitle();
        if (skipscene>0){
            scene=skipscene;
        }
        else{
            ctext(150, 20, "VERSION "+settings.number, {});

            playing="nowloading";
            music[playing].volume(1);
            music[playing].loop(true);
            music[playing].play();
            scene=2;
        }
    }

    if (scene==2 && !stagecount){
        if (ticks>10 && stage.alpha<1.0){
            stage.alpha+=0.02;
        }
        if (ticks>10){
            scene++;
            ticks=0;
        }
    }

    if (scene==3 && !stagecount){
        if (ticks>350 || (shoot && ticks>50)){
            set.menupic(
                tSoundstorm,
                230,
                300,
                7.5,
                {max: true, scale: 1, glow: true}
            );
            if (settings.version=="demo"){
                set.menupic(
                    "DEMO VERSION",
                    980,
                    600,
                    7,
                    {max: true, scale: 1, fontsize: 80}
                );
            }
            else if (settings.version=="test"){
                set.menupic(
                    "PLAYTEST "
                        +settings.number
                        +" STAGES "
                        +settings.playtest,
                    980,
                    600,
                    7,
                    {max: true, scale: 1, fontsize: 80}
                );
            }
            scene++;
        }
    }

    Stage0Menu.update();

    //Tutorial start
    if (scene==12 && !stagecount){
        if (ticks>60){
            globalreset();
            clear_sprites();
            beginAnonymousGameSession();
            log2db("tutorial started");
            playing="tutorial";
            music[playing].loop(true);
            music[playing].play();
            music[playing].fade(0, 1, 3000);
            scene++;
        }
    }

    if (scene==13 && !stagecount){
        resettime();
        for (let index=0; index<100; index+=2){
            set.laserstar(index);
        }

        create(0, "hero", 1300, 800, {control: 50});
        create(
            0,
            "label",
            600,
            540,
            {wait: 100, speedX: 3.5, subtype: tTrip00, glowcolor: 0xFFFFAA}
        );

        cherocenter();
        if (settings.stinger==1){
            cherostinger("back");
        }
        else if (settings.stinger==2){
            cherostinger("left");
            cherostinger("right");
        }

        scene++;
    }

    if (scene==14 && !stagecount){
        if (ticks>0){
            ctutorialtext();
            scene++;
        }
    }

    if (scene==99 && !stagecount){
        clear_sprites();
        globalreset();
        for (var i=frontlayer.children.length-1; i>=0; i--){
            frontlayer.removeChild(frontlayer.children[i]);
        }
        stagecount=1;
        actcount=1;
        scene=1;
        tutorialgoals=0;
    }
}

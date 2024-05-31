
function stage0(){

    //Initialize and display title screen
    if (scene==1 && !stagecount){
        log2db('titlescreen');
        clear_sprites();
        globalreset();
        aidelete=0;
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
            //cpicturetitle(tWaldtitel);
            //set.spine();
            //set.forestground();
            //cpicture(tex.logo, {layer: 'backlayer', fadeout: 0.02, fadein: 0.01, size: 1, zoom: 1.0001, zoommax: 1.02, x: 960, y: 540, speedX: 0, speedY: 0, alpha: 1, light: 1, lightin: 0.001});
            ctext(150, 20, 'VERSION '+settings.number, {});
            
            playing = 'nowloading';
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
        if (ticks>10){ //300
            
            
            scene++;
            ticks=0;
        }
    }

    if (scene==3 && !stagecount){
        if (ticks>350 || (shoot && ticks>50)){ //350
            set.menupic(tSoundstorm, 230, 300, 7.5, {max: true, scale: 1, glow: true})
            if (settings.version=='demo'){
                set.menupic('DEMO VERSION' , 980, 600, 7, {max: true, scale: 1, fontsize: 80});
            }
            scene++;
        }
    }

    if (scene==4 && !stagecount){
        //Display and activate start menu after some seconds
        if (ticks>600 || (shoot && ticks>100)){ //600
            menuselected[0] = 0;
            remember.scoreattack=false;
                
            cmenu('NORMAL\n   GAME', 1, 360, 920, {key: 0, fontsize: 100});
            cmenu('  SCORE\nATTACK', 2, 960, 920, {key: 0, fontsize: 100});
            cmenu('CUSTOM\n   GAME', 3, 1560, 920, {key: 0, fontsize: 100});
            remember.wait=50;
            scene++;
        }
    }

    if (scene==5){
        if (inputcontrol == 'key' || inputcontrol == 'gamepad'){
            //remember.wait--;
            if (left && menuposition[0]>1 && remember.wait<0){
                remember.wait=10;
                menuposition[0]--;
            }
            if (right && menuposition[0]<3 && remember.wait<0){
                remember.wait=10;
                menuposition[0]++;
            }
            if (shoot && remember.wait<0){
                menuselected[0]=menuposition[0];
                remember.wait=150;
            }
        }

        
        if (mouse && (keys.shoot.mouse || touch) && mouse.y>700 ){ //mousedown or touchstart
                
                if (mouse.x<660){
                    remember.wait=150;
                    menuselected[0]=1;
                    //scene=6;
                }
                else if (mouse.x>1260){
                    remember.wait=150;
                    menuselected[0]=3;
                    //scene=8;
                }
                else{
                    remember.wait=150;
                    menuselected[0]=2;
                    //scene=10;
                }
        }

        if (menuselected[0]>0){
            if (menuselected[0]==1){
                scene=6; 
            }
            else if (menuselected[0]==2){
                scene=6.5; 
            }
            else{
                scene=10;
            }
            
            menuposition[2] = 1;
            remember.wait=150;
        }
    }

    // if mode1
    if (scene>=6 && scene<7){
        //Display and activate start menu after some seconds
            menuposition[1] = 1;
            menuselected[1] = 0;
            cmenu('    CASUAL\nDIFFICULTY', 1, 250, 900, {key: 1, fontsize: 72});
            cmenu('   SERIOUS\nDIFFICULTY', 2, 750, 900, {key: 1, fontsize: 72});
            cmenu('     INSANE\nDIFFICULTY', 3, 1250, 900, {key: 1, fontsize: 72});
            cmenu('     EXIT TO\nMAIN MENU', 4, 1700, 900, {key: 1, fontsize: 72});

            set.menupic('     RECOMMENDED\nFOR MOST PLAYERS', 250, 1020, scene+1, { fontsize: 36})
            set.menupic(' VETERANS FAMILIAR WITH \nSHMUPS OR RYTHM GAMES', 750, 1020, scene+1, {fontsize: 36})
            set.menupic('THE ULTIMATE CHALLENGE\n     FOR SHMUP MANIACS', 1250, 1020, scene+1, {fontsize: 36})
            
            //set.menupic('STAGE SCORE TRIES', 750, 1010, 7, {fontsize: 36})
            //set.menupic(''+(getCookie('stagecount') || 1)+'-'+(getCookie('actcount') || 1)+(gstringformat(getCookie('scoretotal') || 0, 5))+'   '+(getCookie('trystock') || 3), 750, 1040, 7, {fontsize: 36})
            //set.centertext('Stage Score Tries', 100, 999999, {fontsize: 36, x: 960, y: 1030});
            //set.centertext(''+(getCookie('stagecount') || 1)+'-'+(getCookie('actcount') || 1)+(gstringformat(getCookie('scoretotal') || 0, 5))+'   '+(getCookie('trystock') || 3), 100, 999999, {fontsize: 36, x: 960, y: 1060});
            scene++;
        
    }

    if (scene>=7 && scene<8){ //ARCADE MENU
        //remember.wait--;
        if (inputcontrol == 'key' || inputcontrol == 'gamepad'){
            
            if (left && menuposition[1]>1 && remember.wait<0){
                remember.wait=10;
                menuposition[1]--;
            }
            if (right && menuposition[1]<4 && remember.wait<0){
                remember.wait=10;
                menuposition[1]++;
            }
            if (shoot && remember.wait<0){
                menuselected[1]=menuposition[1];
                remember.wait=100;
            }
        }

        if (mouse && (keys.shoot.mouse || touch) && mouse.y>700 && remember.wait<0){ //mousedown or touchstart
                
                if (mouse.x<500){
                    remember.wait=150;
                    menuselected[1]=1;
                }
                else if (mouse.x>500 && mouse.x<1000){
                    remember.wait=150;
                    menuselected[1]=2;
                }
                else if (mouse.x>1000 && mouse.x<1500){
                    remember.wait=150;
                    menuselected[1]=3;
                }
                else{
                    remember.wait=150;
                    menuselected[1]=4;
                }
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
                if (menuselected[1]==1){
                    difficulty.set(1);
                }
                if (menuselected[1]==2){
                    difficulty.set(2);
                }
                if (menuselected[1]==3){
                    difficulty.set(3);
                }
                    if (scene==7){
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

    if (scene==8){
        //Display and activate start menu after some seconds
            menuselected[2] = 0;
            set.menupic(tTrip01, 120, 200-75, 9)
            cmenu('ACT 1', 1, 650, 200, {key: 2, fontsize: 100});
            set.menupic( difficulty.name+ ' SCORE ATTACK' , 960, 60, 9, {fontsize: 100, font: 'inline'});
            
            set.menupic( (getCookie('score11d'+difficulty.general)||0).toString() , 650, 270, 9, {fontsize: 50});
            cmenu('ACT 2', 2, 1000, 200, {key: 2, fontsize: 100});
            set.menupic( (getCookie('score12d'+difficulty.general)||0).toString() , 1000, 270, 9, {fontsize: 50});
            cmenu('ACT 3', 3, 1350, 200, {key: 2, fontsize: 100});
            set.menupic( (getCookie('score13d'+difficulty.general)||0).toString() , 1350, 270, 9, {fontsize: 50});
            
            //cmenu('ACT 4', 4, 1700, 100, {key: 2, fontsize: 100});
            if (settings.version!=='demo'){
                set.menupic( (getCookie('score21d'+difficulty.general)||0).toString() , 650, 430, 9, {fontsize: 50});
                set.menupic( (getCookie('score22d'+difficulty.general)||0).toString() , 1000, 430, 9, {fontsize: 50});
                set.menupic( (getCookie('score23d'+difficulty.general)||0).toString() , 1350, 430, 9, {fontsize: 50});
                set.menupic( (getCookie('score31d'+difficulty.general)||0).toString() , 650, 590, 9, {fontsize: 50});
                set.menupic( (getCookie('score32d'+difficulty.general)||0).toString() , 1000, 590, 9, {fontsize: 50});
                set.menupic( (getCookie('score33d'+difficulty.general)||0).toString() , 1350, 590, 9, {fontsize: 50});
                set.menupic( (getCookie('score34d'+difficulty.general)||0).toString() , 1650, 590, 9, {fontsize: 50});
                set.menupic( (getCookie('score41d'+difficulty.general)||0).toString() , 650, 750, 9, {fontsize: 50});
                set.menupic( (getCookie('score42d'+difficulty.general)||0).toString() , 1000, 750, 9, {fontsize: 50});
                set.menupic( (getCookie('score43d'+difficulty.general)||0).toString() , 1350, 750, 9, {fontsize: 50});
                set.menupic( (getCookie('score44d'+difficulty.general)||0).toString() , 1650, 750, 9, {fontsize: 50});
                set.menupic( (getCookie('score51d'+difficulty.general)||0).toString() , 650, 910, 9, {fontsize: 50});
                set.menupic( (getCookie('score52d'+difficulty.general)||0).toString() , 1000, 910, 9, {fontsize: 50});
                set.menupic( (getCookie('score53d'+difficulty.general)||0).toString() , 1350, 910, 9, {fontsize: 50});
                set.menupic( (getCookie('score54d'+difficulty.general)||0).toString() , 1650, 910, 9, {fontsize: 50});
            }
                set.menupic(tTrip02, 120, 360-75, 9, {version: settings.version})
                cmenu('ACT 1', 11, 650, 360, {version: settings.version, key: 2, fontsize: 100});
                cmenu('ACT 2', 12, 1000, 360, {version: settings.version, key: 2, fontsize: 100});
                cmenu('ACT 3', 13, 1350, 360, {version: settings.version, key: 2, fontsize: 100});
                //cmenu('ACT 4', 4, 1700, 920, {key: 2, fontsize: 100});

                set.menupic(tex.trip04, 120, 520-75, 9, {version: settings.version})
                cmenu('ACT 1', 21, 650, 520, {version: settings.version, key: 2, fontsize: 100});
                cmenu('ACT 2', 22, 1000, 520, {version: settings.version, key: 2, fontsize: 100});
                cmenu('ACT 3', 23, 1350, 520, {version: settings.version, key: 2, fontsize: 100});
                cmenu('ACT 4', 24, 1650, 520, {version: settings.version, key: 2, fontsize: 100});
                
                set.menupic(tex.trip03, 120, 680-75, 9, {version: settings.version})
                cmenu('ACT 1', 31, 650, 680, {version: settings.version, key: 2, fontsize: 100});
                cmenu('ACT 2', 32, 1000, 680, {version: settings.version, key: 2, fontsize: 100});
                cmenu('ACT 3', 33, 1350, 680, {version: settings.version, key: 2, fontsize: 100});
                cmenu('ACT 4', 34, 1650, 680, {version: settings.version, key: 2, fontsize: 100});
                
                set.menupic(tex.trip05, 120, 840-75, 9, {version: settings.version})
                cmenu('ACT 1', 41, 650, 840, {version: settings.version, key: 2, fontsize: 100});
                cmenu('ACT 2', 42, 1000, 840, {version: settings.version, key: 2, fontsize: 100});
                cmenu('ACT 3', 43, 1350, 840, {version: settings.version, key: 2, fontsize: 100});
                cmenu('ACT 4', 44, 1650, 840, {version: settings.version, key: 2, fontsize: 100});
                
            cmenu('EXIT TO MAIN MENU', 51, 960, 1000, {key: 2, fontsize: 100});
            scene++;
        
    }

    if (scene==9){ //ARCADE MENU
        //remember.wait--;
        if (inputcontrol == 'key' || inputcontrol == 'gamepad')
        {
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
                menuposition[2]-=10;
            }
            if (down && menuposition[2]<50 && remember.wait<0){
                remember.wait=10;
                menuposition[2]+=10;
            }
            if (shoot && remember.wait<0){
                if (settings.version!=='demo' || menuposition[2]<10 || menuposition[2]>=50){
                    menuselected[2]=menuposition[2];
                    remember.wait=100;
                }
            }
            if (menuposition[2]==4){menuposition[2]=3;}
            if (menuposition[2]==14){menuposition[2]=13;}
            if (menuposition[2]>51){menuposition[2]=51;}
        }

        if ((keys.shoot.mouse || touch) && remember.wait<0){ //mousedown or touchstart
            remember.wait=100;
            if (mouse.y<240){
                if (mouse.x<1000){
                menuselected[2]=1;
                }
                else if (mouse.x<1350){
                    menuselected[2]=2;
                }
                else {
                    menuselected[2]=3;
                }
            }
            else if (mouse.y<420){
                if (mouse.x<1000){
                    menuselected[2]=11;
                    }
                    else if (mouse.x<1350){
                        menuselected[2]=12;
                    }
                    else {
                        menuselected[2]=13;
                    }
            }
            else if (mouse.y<600){
                if (mouse.x<1000){
                    menuselected[2]=21;
                    }
                    else if (mouse.x<1350){
                        menuselected[2]=22;
                    }
                    else if (mouse.x<1650){
                        menuselected[2]=23;
                    }
                    else {
                        menuselected[2]=24;
                    }
            }
            else if (mouse.y<780){
                if (mouse.x<1000){
                    menuselected[2]=31;
                    }
                    else if (mouse.x<1350){
                        menuselected[2]=32;
                    }
                    else if (mouse.x<1650){
                        menuselected[2]=33;
                    }
                    else {
                        menuselected[2]=34;
                    }
            }
            else if (mouse.y<940){
                if (mouse.x<1000){
                    menuselected[2]=41;
                    }
                    else if (mouse.x<1350){
                        menuselected[2]=42;
                    }
                    else if (mouse.x<1650){
                        menuselected[2]=43;
                    }
                    else {
                        menuselected[2]=44;
                    }
            }
            else{
                menuselected[2]=51;
            }
        }
        if (menuselected[2]>0){
            if (menuselected[2]<50){
                menuposition[2] = menuselected[2];
                stage.alpha-=0.01;
            }
            else{
                scene=1;
                ticks=0;
                skipscene=0;
                clear_sprites();
                playing = 'nowloading';
                music[playing].play();
                remember.wait=100;
            }
            if (remember.wait<-100){
                remember.save=false;
                remember.scoreattack=true;
                stagecount=Math.ceil(menuselected[2]/10);
                actcount=menuselected[2]%10;
                trystock=42;
                scoretotal=0;
                log2db('scoreattackstart');
                globalreset()
                startscreen();
            }
        }
    }


    //CUSTO MENU

    if (scene==10 &&!stagecount){
            menuposition[3] = 1;
            menuselected[3] = 0;
            difficulty.set(1);

            set.menupic('START STAGE', 700, 200-140, 11, {fontsize: 100})
            if (settings.version=='demo'){
                cmenu('ONE', 1, 1360, 200-140, {setvalue: 'startstage', scene: 10, key: 3, fontsize: 100, settings: ['ONE']});
            }
            else{
                cmenu('ONE', 1, 1360, 200-140, {setvalue: 'startstage', scene: 10, key: 3, fontsize: 100, settings: ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE']});
            }
            set.menupic('DIFFICULTY', 700, 350-140, 11, {fontsize: 100})
            cmenu('CASUAL', 2, 1360, 350-140, {setvalue: 'difficulty', scene: 10, key: 3, fontsize: 100, settings: ['CASUAL', 'SERIOUS', 'INSANE']});
            set.menupic('MANY TRIES', 700, 360, 11, {fontsize: 100})
            cmenu('OFF', 3, 1360, 360, {setvalue: 'trystock', scene: 10, key: 3, fontsize: 100, settings: ['OFF', 'ON']});
            set.menupic('INVINCIBLE', 700, 510, 11, {fontsize: 100})
            cmenu('OFF', 4, 1360, 510, {setvalue: 'cantdie', scene: 10, key: 3, fontsize: 100, settings: ['OFF', 'ON']});
            set.menupic('NO BULLETS', 700, 660, 11, {fontsize: 100})
            cmenu('OFF', 5, 1360, 660, {setvalue: 'nobullets', scene: 10, key: 3, fontsize: 100, settings: ['OFF', 'ON']});
            cmenu('START CUSTOM GAME', 6, 960, 850, {key: 3, fontsize: 100});
            cmenu('EXIT TO MAIN MENU', 7, 960, 1000, {key: 3, fontsize: 100});
            scene++;
        
    }
    
    if (scene==11&&!stagecount){
        //remember.wait--;
        if (inputcontrol == 'key' || inputcontrol == 'gamepad'){
            if (up && menuposition[3]>1 && remember.wait<0){
                remember.wait=10;
                menuposition[3]--;
            }
            if (down && menuposition[3]<7 && remember.wait<0){
                remember.wait=10;
                menuposition[3]++;
            }
            if (shoot && remember.wait<0){
                menuselected[3]=menuposition[3];
                remember.wait=10;
            }
        }

        /*if (mouse && (keys.shoot.mouse || touch) && remember.wait<0){ //mousedown or touchstart
            if (mouse.y<250){
                menuselected[3] = 1;
            }
            else if(mouse.y<400){
                menuselected[3] = 2;
            }
            else if(mouse.y<550){
                menuselected[3] = 3;
            }
            else if(mouse.y<700){
                menuselected[3] = 4;
            }
            else if(mouse.y<850){
                menuselected[3] = 5;
            }
            else {
                menuselected[3] = 6;
            }
        }*/
        if (menuselected[3]==7){
            scene=3;
            remember.wait=100;
        }
        if (menuselected[3]>=6){
            stage.alpha-=0.01;
            if (remember.wait<-100){
                if (menuselected[3]==6){
                    stagecount=startstage;
                    if (stagecount<1){stagecount=1;}
                    actcount=1;
                    scene=1;
                }
                if (menuselected[3]==7){
                    scene=4;
                    remember.wait=100;
                    remember.save=false;
                    
                    stagecount=0;
                    actcount=1;
                    startstage=0;
                    cantdie=0;
                    nobullets=0;
                    invincible=0;

                    //stagecount=Number(getCookie('stagecount')) || 1;
                    //actcount=Number(getCookie('actcount')) || 1;
                    trystock=Number(getCookie('trystock')) || 3;
                    scoretotal=Number(getCookie('scoretotal')) || 0;
                    remember.extend = Math.floor(scoretotal+1000/2000);
                    globalreset()
                    startscreen();
                }
            }
        }

    }

    //*************** */



    //Tutorial start
    if (scene==12&&!stagecount){
        
        if (ticks>60){
            globalreset();
            clear_sprites();
            log2db('tutorial started');
            playing = 'tutorial';
            music[playing].loop(true);
            
            music[playing].play();
            music[playing].fade(0, 1, 3000);
            scene++;
            
        }
    }

    
    if (scene==13&&!stagecount){
        resettime();
        for (let index=0; index<100; index+=2){
            set.laserstar(index);
        }
        

        //create(0, 'b_grasstex', 0, 0, {speedY: 1, r: 255, g:70, b: 50});
        //create(0, 'b_tutorial', 960, 540, {});
        create(0, 'hero', 1300, 800, {control: 50});
        create(0, 'label', 600, 540, {wait: 100, speedX: 3.5, subtype: tTrip00, glowcolor: 0xFFFFAA});   
        //set.tutorialnumber();
        
        cherocenter();
        if (settings.stinger==1){
            cherostinger('back');
        }
        else if (settings.stinger==2){
            cherostinger('left');
            cherostinger('right');
        }
        
        scene++;

        
    }
    if (scene==14&&!stagecount){
        if (ticks>0){
            ctutorialtext();
            scene++;
        }
    }

    if (scene==99&&!stagecount)
    {   
        clear_sprites();
        globalreset();
        for (var i = frontlayer.children.length - 1; i >= 0; i--) {	frontlayer.removeChild(frontlayer.children[i]);};            
        stagecount=1;
        actcount=1;
        scene=1;
        tutorialgoals=0;
    }

}
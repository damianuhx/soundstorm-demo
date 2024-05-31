function stage1(){


    if (scene <= 9){
        startscreen();
    }

    //act0
if (scene==10)
{
    //herocreate();

    create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});
    create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});
    create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});
    create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});
    create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});
    create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});
    create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});
    create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});
    create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});

    if (ticks>650)
    {
        //create(0, 'b_grasstex', 0, 0, {speedY: 9});
        playing = 'greengrass';
            music[playing].volume(1);
            music[playing].play();
            set.sound({active: 0, nosfx: true});

        ticks=0;
        scene++;

        set.centertext('Red bullets flash\nto this sound', 200, 180);
        set.centertext('Press shield near\nflashing bullets', 650, 180);
        set.centertext('Feel the music to know\nwhen you can destroy the bullets', 960, 240);

        set.centertext('Yellow bullets flash\nto the beat of the music', 1300, 180);
        set.centertext('Press shield near\nflashing bullets', 1650, 180);
        set.centertext('Feel the rythm to know\nwhen you can destroy the bullets', 2000, 240);

        
        create(350, 'e_sunflower', 860, -100, {speedY: 10, beatlayer: 2});
        create(700, 'e_sunflower', 1060, -100, {speedY: 10, beatlayer: 2});
        //set.sound({nosfx: true, active: 30});
        /*create(770, 'e_hawkbit', Math.random() * 1700+110, -100, {speedY: 10, beatlayer: 4});
        create(920, 'e_hawkbit', Math.random() * 1700+110, -100, {speedY: 10, beatlayer: 4});
        create(620, 'e_hawkbit', Math.random() * 1700+110, -100, {speedY: 10, beatlayer: 4});
        create(420, 'e_hawkbit', Math.random() * 1700+110, -100, {speedY: 10, beatlayer: 4});*/
    }
}


if (scene==11)
{
    //scoretimer=100-musictime;
    if (ticks<4000) //3700
    {
        create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});
        create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});
        create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});
        create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});
        create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});
        create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});
        create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});
        create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});
        create(0, 'b_grass', Math.random() * maxX, -200, {speedY: 9.5});
    }


    if (pace1 > 440 / difficulty.number) {
        if (ticks>1000 && ticks<4000)
        {
            beatlayer++;
            //ticks=0;
            if (beatlayer>2){beatlayer=1;}
            create(100/difficulty.number+ticks, 'e_hawkbit', Math.random() * 960+0, -100, {speedY: 10, beatlayer: 4});
            create(50/difficulty.number+ticks, 'e_hawkbit', Math.random() * 960+960, -100, {speedY: 10, beatlayer: 4});
            if (musictime>=25)
            {
            create(200/difficulty.number+ticks, 'e_sunflower', Math.random() * 960+(beatlayer-1)*960, -100, {speedY: 10, beatlayer: 2});
            }
        pace1 = 0;
        }
    }


    if (ticks>4000) //3700
    {
        create(0, 'picture', 960, -300, {speedY: 4, subtype: tGrassborder, misc1:1, misc2:600, misc3:1, misc4: 0.3, misc5: 1});
        create(0, 'picture', 960, -300, {speedY: 4.7, subtype: tGrassborder, misc1:1, misc2:500, misc3:1, misc4: 0.4, misc5: 1.1});
        create(0, 'picture', 960, -300, {speedY:5.8, subtype: tGrassborder, misc1:1, misc2:400, misc3:1, misc4: 0.5, misc5: 1.2});
        create(0, 'picture', 960, -350, {speedY: 7.3, subtype: tGrassborder, misc1:1, misc2:300, misc3:1, misc4: 0.6, misc5: 1.3});
        create(0, 'picture', 960, -376, {speedY:9, subtype: tGrassborder, misc1:1, misc2:300, misc3:1, misc4: 0.7, misc5: 1.4});
        
        ticks=0;
        scene++;
    }
}
if (scene==12){
    if (ticks>80) //80?
    {
        ticks=0;
        bgchange=1;

        scene++;
        set.bonustext(700);
        
        set.forestground();
        create(0, 'fog1', 960, 540, {});
        //create(0, 'b_forestground', 960, 540, {speedY: 2});
        ticks+=360;
    }
}

if (scene==13){
    scene++;
    
    /*set.centertext('You can use flashing bullets\nto destroy non-flashing bullets.', 1600, 240);
    set.centertext('If a flashing bullet explodes\nit will destroy non-flashing bullets.', 2100, 240);
    set.centertext('This gives you 8 points per bullet.\nYou get an extra try every '+difficulty.extend+' points.', 2600, 240);*/

    //act2: forestground, herocreate, play seek

    create(1000, 'e_dragonfly', 400, 1200, {speedY: -2, misc1: 3+difficulty.enemy});

    create(1800, 'e_dragonfly', 1500, 1200, {speedY: -2, misc1: -3-difficulty.enemy});

    create(2600, 'e_dragonfly', 400, 1200, {speedY: -2, misc1: 3+difficulty.enemy});

    if (difficulty.number>1){
        create(1400, 'e_dragonfly', 1500, 1200, {speedY: -2, misc1: -3-difficulty.enemy});

    create(2200, 'e_dragonfly', 400, 1200, {speedY: -2, misc1: 3+difficulty.enemy});

    create(3000, 'e_dragonfly', 400, 1200, {speedY: -2, misc1: 3+difficulty.enemy});
    }
    //create(3400, 'e_dragonfly', 1500, 1200, {speedY: -2, misc1: -3});



    for (var once=0; once<8; once++)
    {
            create(1100+once*100, 'e_fly2', 1600,-100, {misc1: 100, misc2: 30, misc3: 0.03, misc4: 2});
    }
    
    for (var once=0; once<8; once++)
    {
        create(2000+once*90, 'e_fly2', 300,-100, {misc1: 100, misc2: 30, misc3: -0.03, misc4: 1});  
    }

    for (var once=0; once<9; once++)
    {

            create(2900+once*80, 'e_fly2', 1600,-100, {misc1: 100, misc2: 30, misc3: 0.03, misc4: 2});
    }



    if (difficulty.number>1){

        for (var once=0; once<8; once++)
    {
            create(1150+once*100, 'e_fly2', 300,-100, {misc1: 100, misc2: 30, misc3: -0.03, misc4: 1});  
    }
    
    for (var once=0; once<8; once++)
    {
        create(2045+once*90, 'e_fly2', 1600,-100, {misc1: 100, misc2: 30, misc3: 0.03, misc4: 2});
    }

    for (var once=0; once<9; once++)
    {

            create(2940+once*80, 'e_fly2', 300,-100, {misc1: 100, misc2: 30, misc3: -0.03, misc4: 1});  
    }
    }
}

    if (scene==14)
    {       
        //if (ticks>500) //8300
        
        if (musictime>=132)
        {
            set.bonustext();
            ticks=0;
            if (!remember.scoreattack){
                bgchange=1;
                scene++;
                bgspeedy=0.5;
            }
            else{
                scene=30;
            }
        }
    }

if (scene==15)
{        
    //act3: forestground
    music[playing].stop();
    playing = 'scarybeat';
    music[playing].volume(1);
    music[playing].play();
    musictime=0;
    scene++;
    ticks=0;


        

}

if (scene==16)
{
    create(0, 'f_mushroom', 800, -200);
    for (var i=0; i<15*difficulty.number; i++){
    create(i*40/difficulty.number+400, 'e_fly2', Math.random()*1920, -100, {misc1: 500, misc2: 0, misc3: -0.03, misc4: pi/2, nobullets: true});  
    }
   

    
    scene++;
}

if (scene==17)
{
    if (musictime>25)
    {
        ticks=0;
        create(100, 'label', 600, 700, {speedX: 3.5, subtype: tFear01, wait: 200, glowcolor: 0xFFAAAA});
        scene++;
    }
}
if (scene==18)
{
    bgzoomf.call(background, 0.0025, 3);
}

if (scene==19)
{
    ctimetext();
    scene++;

    if (difficulty.number>=5){
        create(2000, 'e_fly2', 1800,-100, {misc1: 50, misc2: 30, misc3: 0.03, misc4: 2});
        create(2300, 'e_fly2', 100,-100, {misc1: 50, misc2: 30, misc3: -0.03, misc4: 1});  
        create(2600, 'e_fly2', 1800,-100, {misc1: 50, misc2: 30, misc3: 0.03, misc4: 2});
        create(800, 'e_fly2', 1800,-100, {misc1: 50, misc2: 30, misc3: 0.03, misc4: 2});
        create(1100, 'e_fly2', 100,-100, {misc1: 50, misc2: 30, misc3: -0.03, misc4: 1});  
        create(1400, 'e_fly2', 1800,-100, {misc1: 50, misc2: 30, misc3: 0.03, misc4: 2});
        create(1700, 'e_fly2', 100,-100, {misc1: 50, misc2: 30, misc3: -0.03, misc4: 1});  
    }

}

if (scene>19 && scene<22){
}

}
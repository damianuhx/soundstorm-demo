function zoomStageOneBackgroundf(speed, max=2)
{
    background.scale.x+=2*speed;
    background.scale.y+=2*speed;
    background.position.x=-(background.scale.x-1)*960;
    background.position.y=-(background.scale.y-1)*540;

    if (background.scale.x>=max && speed>0)
    {
        scene++;
    }
}

function stage1(){


    if (scene <= 9){
        startscreen();
    }

    //act0
if (scene==10)
{
    //herocreate();
    set.beatparticle(tex.sp_note, 20, 4, {});

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


        spawnEnemy('sunflower', {speedY: 10, beatlayer: 2, active: 350, x: 860, y: -100});
        spawnEnemy('sunflower', {speedY: 10, beatlayer: 2, active: 700, x: 1060, y: -100});

    }
}


if (scene==11)
{
    //scoretimer=100-musictime;
    if (ticks<4000) //3700
    {
        set.beatparticle(tex.sp_note1, 20, 2, {});
        set.beatparticle(tex.sp_note, 20, 4, {});

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
            spawnEnemy('hawkbit', {speedY: 10, beatlayer: 4, active: 100/difficulty.number+ticks, x: Math.random() * 960+0, y: -100});
            spawnEnemy('hawkbit', {speedY: 10, beatlayer: 4, active: 50/difficulty.number+ticks, x: Math.random() * 960+960, y: -100});
            if (musictime>=25)
            {
            spawnEnemy('sunflower', {speedY: 10, beatlayer: 2, active: 200/difficulty.number+ticks, x: Math.random() * 960+(beatlayer-1)*960, y: -100});
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

    spawnEnemy('dragonfly', {speedY: -2, misc1: 3.5+0.5*difficulty.enemy, active: 1000, x: 400, y: 1200});

    spawnEnemy('dragonfly', {speedY: -2, misc1: -3.5-0.5*difficulty.enemy, active: 1800, x: 1500, y: 1200});

    spawnEnemy('dragonfly', {speedY: -2, misc1: 3.5+0.5*difficulty.enemy, active: 2600, x: 400, y: 1200});

    if (difficulty.number>1){
        spawnEnemy('dragonfly', {speedY: -2, misc1: -3-0.5*difficulty.enemy, active: 1400, x: 1500, y: 1200});

    spawnEnemy('dragonfly', {speedY: -2, misc1: 3.5+0.5*difficulty.enemy, active: 2200, x: 400, y: 1200});

    spawnEnemy('dragonfly', {speedY: -2, misc1: 3.5+0.5*difficulty.enemy, active: 3000, x: 400, y: 1200});
    }
    //spawnEnemy('dragonfly', {speedY: -2, misc1: -3, active: 3400, x: 1500, y: 1200});



    for (var once=0; once<8; once++)
    {
            spawnEnemy('fly', {misc1: 100, misc2: 30, misc3: 0.03, misc4: 2, active: 1100+once*100, x: 1600, y: -100});
    }

    for (var once=0; once<8; once++)
    {
        spawnEnemy('fly', {misc1: 100, misc2: 30, misc3: -0.03, misc4: 1, active: 2000+once*90, x: 300, y: -100});
    }

    for (var once=0; once<9; once++)
    {

            spawnEnemy('fly', {misc1: 100, misc2: 30, misc3: 0.03, misc4: 2, active: 2900+once*80, x: 1600, y: -100});
    }



    if (difficulty.number>1){

        for (var once=0; once<8; once++)
    {
            spawnEnemy('fly', {misc1: 100, misc2: 30, misc3: -0.03, misc4: 1, active: 1150+once*100, x: 300, y: -100});
    }

    for (var once=0; once<8; once++)
    {
        spawnEnemy('fly', {misc1: 100, misc2: 30, misc3: 0.03, misc4: 2, active: 2045+once*90, x: 1600, y: -100});
    }

    for (var once=0; once<9; once++)
    {

            spawnEnemy('fly', {misc1: 100, misc2: 30, misc3: -0.03, misc4: 1, active: 2940+once*80, x: 300, y: -100});
    }
    }
}

    if (scene==14)
    {
        //if (ticks>500) //8300
        if (random(10)>8){set.beatparticle(tex.sp_leaf, 0, {});}
        ai.bgpulse.call(background, 5, 1, 1.25);
        set.beatparticle(tex.sp_leaf, 20, 1, {});
        set.beatparticle(tex.sp_leaf2, 20, 3, {});

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
    spawnEnemy('mushroomBoss', {active: 0, x: 800, y: -200});
    for (var i=0; i<15*difficulty.number; i++){
    spawnEnemy('fly', {misc1: 500, misc2: 0, misc3: -0.03, misc4: pi/2, nobullets: true, active: i*40/difficulty.number+400, x: Math.random()*1920, y: -100});
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
    zoomStageOneBackgroundf(0.0025, 3);
}

if (scene==19)
{
    ctimetext();
    scene++;



    if (difficulty.number>=5){
        spawnEnemy('fly', {misc1: 50, misc2: 30, misc3: 0.03, misc4: 2, active: 2000, x: 1800, y: -100});
        spawnEnemy('fly', {misc1: 50, misc2: 30, misc3: -0.03, misc4: 1, active: 2300, x: 100, y: -100});
        spawnEnemy('fly', {misc1: 50, misc2: 30, misc3: 0.03, misc4: 2, active: 2600, x: 1800, y: -100});
        spawnEnemy('fly', {misc1: 50, misc2: 30, misc3: 0.03, misc4: 2, active: 800, x: 1800, y: -100});
        spawnEnemy('fly', {misc1: 50, misc2: 30, misc3: -0.03, misc4: 1, active: 1100, x: 100, y: -100});
        spawnEnemy('fly', {misc1: 50, misc2: 30, misc3: 0.03, misc4: 2, active: 1400, x: 1800, y: -100});
        spawnEnemy('fly', {misc1: 50, misc2: 30, misc3: -0.03, misc4: 1, active: 1700, x: 100, y: -100});
    }

}

}

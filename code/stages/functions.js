function herocreate()
{
    if (actcount!==1 || (stagecount!==3 && stagecount!==1)){
        create(0, 'hero', 1300, 800, {control: 50});
        cherocenter(0);
        for (let index=0; index<100; index+=2){
            set.laserstar(index);
        }
    }
    else if (stagecount==1){
        create(0, 'hero', 700, 820, {control: 100});
        cherocenter(0);
        for (let index=0; index<100; index+=2){
            set.laserstar(index);
        }
    }
    else if (stagecount==3){
        create(200, 'hero', 500, 700, {control: 300, alpha: 300});
        cherocenter(500);
        for (let index=0; index<100; index+=2){
            set.laserstar(index, 500);
        }
    }

    
    if (settings.stinger==1){
        cherostinger('back');
    }
    else if (settings.stinger==2){
        cherostinger('left');
        cherostinger('right');
    }
    
    //create hero sword
/*scoretotal=22345;
    score=1234;
    trystock= 42;*/
    if (remember.scoreattack){
        create(0, 'score', 1650, 30, {variable: 'score', fontsize: 60});
    }
    else{
        create(0, 'score', 1650, 90, {variable: 'score', fontsize: 60});
        create(0, 'score', 1650, 30, {variable: 'scoretotal', fontsize: 60});
        create(0, 'lifesprite', 50, 55, {});
        create(0, 'score',  330, 40, {variable: 'trystock', fontsize: 60});
    }
    
    
    //create(0, 'lasersprite', 1887, 1045, {});
    create(0, 'lifebars', 215, 50, {index: 0});
    create(0, 'lifebars', 275, 50, {index: 1});
    create(0, 'lifebars', 335, 50, {index: 2});
    /*create(0, 'lifebars', 40, 1040, {index: 0});
    create(0, 'lifebars', 40, 980, {index: 1});
    create(0, 'lifebars', 40, 920, {index: 2});*/
    //create(0, 'laserbars',1880, 1005);
    create(0, 'combobar',1880, 800);



}

function actcreate(){
    //saving-1

    herocreate(); 
    resettime(); 
    stage.alpha=0;
    globalfilters.twist.enabled = true;
    globalfilters.twist.radius = 1000;
    globalfilters.twist.angle = 10;
    if (stagecount<0){
            playing = 'spacespeed';
            //music starts in stage.js
            scene=10;
            
    }

    background.filters=[
        globalfilters.adjust,
    ];

    if (stagecount==1){
        if (actcount==1){
            set.sound({active: 0, nosfx: false});
            create(0, 'label', 600, 540, {wait: 150, speedX: 3.5, subtype: tTrip01, glowcolor: 0xAAFFAA});

            ticks=300;
            

            

            //music starts in stage.js
            scene=10;
            create(600, 'e_sunflower', 1060, -100, {speedY: 10, beatlayer: 2});
            create(0, 'b_grasstex', 0, 0, {speedY: 9});
            //create(100+ticks, 'e_hawkbit', Math.random() * 960+0, -100, {speedY: 10, beatlayer: 4});
            //create(0, 'picture', 960, 620, {speedY: -0.15, subtype: tForesttitle, misc1: 1, misc2:650, misc3:80, misc4: 1, misc5: 1});
            //create(300, 'picture', 1400, 1200, {speedX: -5.9, speedY: -5, subtype: tHero, accX: 0.02, accY: 0.018, misc1:1, misc2:350, misc3:80, misc4:1, misc5:2, misc6:-0.005});
            
            
            //set.sound({active:400}); 
            //set.centertext('HEAR THAT SOUND?', 400, 120);
            set.centertext('FOCUS THIS SOUND!', 600, 120);
        }
        if (actcount==2){
            //remember.control=1;
            scene=13;
            ticks=1000;
            
            //create(0, 'b_forestground', 960, 540, {speedY: 2});
            
            
            set.forestground();
            create(0, 'fog1', 960, 540, {});
            
            //use enable, add to invert logic: if any filter for background or stage enabled: invert

            playing = 'greengrass';
            music[playing].seek(78);
            music[playing].volume(0);
            music[playing].play();
            music[playing].fade(0, 1, 2000);
        }
    
        if (actcount==3){
            //remember.control=1;
            //stagecount=2;
            //create(0, 'b_forestground', 960, 540, {speedY: 2});
            background.filters=[
                globalfilters.adjust
            ];

            set.forestground();
            scene=15;
            //scene=0;
        }
    } 

    else if (stagecount==2){
        if (actcount==1){
            //remember.control=1;
            playing = 'spacespeed';
            music[playing].volume(1);
            music[playing].play();

            create(50, 'label', 540, 540, {speedX: 3.5, subtype: tTrip02});
            scene=11;
        }
        if (actcount==2){
            //remember.control=1;
            scene=12;
            ticks=85*60;
            playing = 'spacespeed';
            music[playing].seek(85);
            music[playing].volume(0);
            music[playing].play();
            music[playing].fade(0, 1, 2000);
        }
    
        if (actcount==3){
            //remember.control=1;
            //create(8000, 'b_space', 960, 540, {});
            set.spaceground(8000);
            ticks=10200;
            scene=13;
        }
    } 

    else if (stagecount==3){
        renderer.background.color = 0x000000;
        
        if (actcount==1){
            playing = 'cokecity';
            music[playing].volume(0.8);
            music[playing].play();
            scene=10;
        }

        if (actcount==2){
            //remember.control=1;
            playing = 'cokecity';
            set.cityground(0, 1.0);
            //create(0, 'b_city', 960, 540, {zoom: 1.1, scroll: 1});
            create(0, 'b_city', 960, 540, {fog: 1, scroll: 2});
        
            music[playing].seek(70);
            music[playing].volume(0);
            music[playing].play();
            music[playing].fade(0, 0.8, 2000);
            ticks=70*60;
            scene=12;
        }
        if (actcount==3){
            //remember.control=1;
            playing = 'cokecity';
            set.cityground(0, 1.8);
            create(0, 'b_city', 960, 540, {fog: 1, scroll: 2});
            create(0, 'b_city', 960, 540, {fog: 1, scroll: 3, zoom: 0.5, alpha: 1});
        
            music[playing].seek(130);
            music[playing].volume(0);
            music[playing].play();
            music[playing].fade(0, 0.8, 2000);
            ticks=130*60;
            scene=14;
        }
        if (actcount==4){
            set.cityground(0, 2.5);
            create(0, 'b_city', 960, 540, {fog: 1, scroll: 3, zoom: 0.5, alpha: 1});
            create(0, 'b_city', 960, 540, {fog: 1, scroll: 2, zoom: 0.25, alpha: 1});
        
            //remember.control=1;
            scene=17;
        }
        
    }

    else if (stagecount==4){
        //remember.control=1;
        renderer.background.color = 0x000000;
        temp.eaglewait=0;
        temp.fadeout=0;

        if (actcount==1){
            playing = 'freeflight';
            music[playing].volume(1);
            music[playing].play();

            scene=10;
        }

        if (actcount==2){
            playing = 'freeflight';
            music[playing].seek(60);
            music[playing].volume(0);
            music[playing].play();
            music[playing].fade(0, 1, 2000);
            set.riverground();
            //create(0, 'b_river', 960, 540, {alpha: 0.8});
            ticks=60*60;
            scene=13;
        }
        if (actcount==3){
            playing = 'freeflight';
            music[playing].seek(120);
            music[playing].volume(1);
            music[playing].play();
            set.riverground();
            //create(0, 'b_river', 960, 540, {alpha: 0.8});
            ticks=120*60;
            scene=15;
        }
        if (actcount==4){
            ticks=13400;
            scene=17;
        }
        
    }

    else if (stagecount==5){
        //remember.control=1;
        renderer.background.color = 0x000000;

        if (actcount==1){
            playing = 'blendedbrain';
            music[playing].volume(1);
            music[playing].play();
            music[playing].fade(0, 1, 2000);
            scene=10;
        }

        if (actcount==2){
            playing = 'blendedbrain';
            music[playing].seek(90);
            music[playing].volume(0);
            music[playing].play();
            music[playing].fade(0, 1, 2000);
            scene=12;
        }
        if (actcount==3){
            playing = 'blendedbrain';
            music[playing].seek(180);
            music[playing].volume(0);
            music[playing].play();
            music[playing].fade(0, 1, 2000);
            scene=14;
        }
        if (actcount==4){
            scene=17;
        }
        
    }
}
function shotproceed()
{
    if (shoot || touch)  {
        shotwait++;
        if (shotwait>30){
            scene++;
        }
    }
    else{
        shotwait=0;
    }
}

function resettime(){
    ticks=0; 
    date = new Date();
    time=date.getTime();
}
function startscreen(){
    clear_sprites(true);
    renderer.background.color = 0x000000;
    stage.alpha=1;
    laserstock=0;
    remember.control=0;
    background.filters = [];
    background.renderable=1;
    if (remember.scoreattack){
        globalreset();          
        actcreate(actcount);
    }
    else if (done<=0){
        done++;
        globalreset();
        readytext = creadytext();
        textlayer.addChild(readytext);

        subtext= new PIXI.BitmapText('HOLD PAUSE TO EXIT TO MAIN MENU', { 
            fontName: "solid",
            anchor: (0.5,0.5),
            textAlign: 'right',
            fontSize: 50,
        });
        subtext.x=1150;
        textlayer.addChild(subtext);
        titletext= new PIXI.BitmapText(difficulty.name+ '   '+stagecount+' - '+actcount, { 
            fontName: "inline",
            anchor: (0.5,0.5),
            textAlign: 'right',
            fontSize: 200,
        });
        textlayer.addChild(titletext);
        titletext.x=350;
        titletext.y=100;

        saveStage({
            stagecount: stagecount,
            actcount: actcount,
            trystock: trystock,
            scoretotal: scoretotal
        });
    }
    else if (pausepressed>50 || (mouse.x>1150 && mouse.y<100 && keys.shoot.mouse))
    {
        done=0;
        pausepressed=0;
        textlayer.removeChild(readytext);
        readytext.destroy(false); 
        textlayer.removeChild(subtext);
        subtext.destroy(false); 
        textlayer.removeChild(titletext);
        titletext.destroy(false); 
        stagecount=0;
        actcount=0;
        scene=1;
    }
    else if (done++>100 && (shoot || touch))  {
        done=0;
        log2db('act started');
        textlayer.removeChild(readytext);
        readytext.destroy(false);    
        textlayer.removeChild(subtext);
        subtext.destroy(false);     
        textlayer.removeChild(titletext);
        titletext.destroy(false);    
        actcreate(actcount);

        saveStage({
            stagecount: stagecount,
            actcount: actcount,
            trystock: trystock-1,
            scoretotal: scoretotal
        });
    }
}
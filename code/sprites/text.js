
//Adds act score to total score -- if boss: multiply by timer
set.centertext=function(text='', active=100, wait=100, options={}){
var sprite =  new PIXI.BitmapText(text, { 
        fontName: "solid",
        anchor: (0.5,0.5),
        textAlign: 'right',
        fontSize: options.fontsize || 80,
    });

    sprite.alpha=0;
    sprite.visible=false;
    sprite.active=active;
    sprite.anchor.x=0.5;
    sprite.anchor.y=0.5;
    sprite.x=options.x || 960;
    sprite.y=options.y || 540;
    sprite.phase=1;
    sprite.c3=0;
    sprite.ai = [[], [], [], []];

    sprite.ai[0].push(function(){
        this.text=text.toUpperCase();
    }.bind(sprite));

    sprite.ai[1].push(fadein.bind(sprite, 0.02, 1, 1));

    sprite.ai[2].push(waitf.bind(sprite, wait));

    sprite.ai[3].push(function(){
        this.alpha-=0.02;
        if (this.alpha<=0)
        {
            this.delete=true;   
        }
    }.bind(sprite));

    sprites.push(sprite);
    frontlayer.addChild(sprite);
}

set.oneup= function(string='', options={}){
    sfx.play('stageclear');
    if (string==''){
        trystock++;
        remember.extend++;
        var sprite=setsprite(
        new PIXI.Sprite(tex.oneup),
        {anchor: true, active: 0, x: width/2, y: height/2});
    }
    else{
        var sprite=setsprite(
            new PIXI.BitmapText(string, { 
                fontName: "solid",
                anchor: (0.5,0.5),
                textAlign: 'center',
                fontSize: 80,
            }),
            {anchor: true, active: 0, x: width/2, y: height/2});
        frontlayer.addChild(sprite);

    }
    
    sprite.scale.x=0.2;
    sprite.scale.y=0.2;

    sprite.ai = [[]];

    sprite.ai[0].push(ai.zoom.bind(sprite, 1.06, 2.5));

}

set.creditstext=function(text='CREDITS', active=0, options={}){
        let sprite=setsprite(
            new PIXI.BitmapText(text, { 
                fontName: options.font || "solid",
                anchor: (0.5,0.5),
                textAlign: 'right',
                fontSize: options.fontsize || 80,
            }),
            {anchor: true, active: active, x: 1500, y: 1180}
        );

        sprite.ai[0].push(function(){
            this.y-=1;
            if (this.y<-100 && !this.delete){
                this.delete=true;
            }
        }.bind(sprite));
    }

set.laserrecharged= function(){
    sfx.play('energy');
    remember.laser=1;
    var sprite=setsprite(
    new PIXI.Sprite(tex.recharge),
    {anchor: true, active: 0, x: herox, y: heroy});
    
    if (lifestock>=3){
        sprite.tint=rgbToHex(255, 255, 255);
    }
    else if (lifestock>=2){
        sprite.tint=rgbToHex(255, 255, 80);
    }
    else if (lifestock>=1){
        sprite.tint=rgbToHex(255, 180, 80);
    }
    else if (lifestock>=0){
        sprite.tint=rgbToHex(255, 30, 80);
    }

    sprite.scale.x=2;
    sprite.scale.y=2;
    sprite.blendMode=PIXI.BLEND_MODES.ADD;
    sprite.ai = [[]];
    sprite.ai[0].push(function(){
        this.x=herox;
        this.y=heroy;
    }.bind(sprite));
    sprite.ai[0].push(ai.zoom.bind(sprite, 0.9, 0.2));
}

set.bonustext = function (active=0, boss=false)
{
    var sprite = new PIXI.BitmapText('', { 
        fontName: "monospace",
        anchor: (0.5,0.5),
        textAlign: 'right',
        fontSize: 80,
        letterSpacing: 0
    });
    if (!boss)
    {
        var titlesprite=new PIXI.BitmapText('ACT CLEAR', 
        { 
            fontName: "inline",
            textAlign: 'right',
            fontSize: 200,
            letterSpacing: 0
        });
    }
    else
    {
        var titlesprite=new PIXI.BitmapText('STAGE CLEAR', 
        { 
            fontName: "inline",
            textAlign: 'right',
            fontSize: 200,
            letterSpacing: 0
        });
    }
    var framesprite=setsprite(
        new PIXI.Sprite(tex.frame),
    {active: active, x: 960, y: 540, alpha: 0});

    sprite.visible=false;
    sprite.active=active;
    sprite.anchor.x=0.5;
    sprite.anchor.y=0.5;
    sprite.x=960;
    sprite.y=640;

    setsprite(titlesprite,{x: 960, y:340});
    titlesprite.visible=false;
    titlesprite.active=active;
    titlesprite.anchor.x=0.5;
    titlesprite.anchor.y=0.5;
    titlesprite.alpha=0;
    titlesprite.x=960;
    titlesprite.y=340;

    framesprite.visible=false;
    framesprite.anchor.x=0.5;
    framesprite.anchor.y=0.5;
    framesprite.scale.y=1.2;
    framesprite.scale.x=1.2;
    framesprite.active=active;
    framesprite.alpha=0;

    //sprite.pivot.set(sprite.width/2, sprite.height/2);
    sprite.phase=1;
    sprite.ai = [[], [], [], [], [], [], []];
    
    if (boss){
        sprite.ai[0].push(function(){
            this.text='';
            this.text+='\nBOSS:  '+gstringformat(Math.round(score));
            this.text+='\nTIME:  x'+gstringformat(''+Math.round(100*scoretimer/60)/100);
            this.text+='\nACT:   '+gstringformat(''+Math.round(score*scoretimer/60));
            this.text+='\nTOTAL: '+gstringformat(Math.round(scoretotal));
        }.bind(sprite));
    }
    else{
        sprite.ai[0].push(function(){
            this.text='';
            this.text+='ACT:   '+gstringformat('+'+Math.round(score));
            this.text+='\nTOTAL: '+gstringformat(Math.round(scoretotal));
        }.bind(sprite));
    }

    sprite.c3=0;
    sprite.alpha=0;
    sprite.ai[1].push(function(){
        if (dead>0){
            this.delete=true;  
        }
        for (var f =0; f<sprites.length; f++)
        {
            if (sprites[f].collision=='bullet' && sprites[f].delete==false)
            {
                    sprites[f].delete = true;
                    particle(sprites[f].x, sprites[f].y,3);
            }
            else if (sprites[f].visible && sprites[f].collision!=='hero') {
                sprites[f].health=-1;
                sprites[f].ohealth=-1;
            }
        }
    }.bind(sprite));
    sprite.ai[1].push(fadein.bind(sprite, 0.01, 1, 1));
    sprite.ai[1].push(function(){
        if (remember.scoreattack){scoretotal=lifestock*200;}
        titlesprite.alpha+=0.01;
        framesprite.alpha+=0.005;
        if (!boss && remember.scoreattack){music[playing].fade(1,0,2000);}
    }.bind(sprite));
    sprite.ai[2].push(waitf.bind(sprite, 50));
    sprite.ai[3].push(function(){
        if (dead==0 && lifestock>=0){
            //saving-1
            log2db('act cleared');
            actcount++;
            this.phase++;
        }
    }.bind(sprite));
    sprite.ai[4].push(function(){
        invincible=20;
        if (boss){ticks=0;}
        if (score>10){
            score-=10;
            if (!boss){
                scoretotal+=10;
            }
            else{
                scoretotal+=10*Math.round(scoretimer/60);
            }
        }
        else if (score>0){
            if (!boss){
                scoretotal+=score;
            }
            else{
                scoretotal+=score*Math.round(scoretimer/60);
            }
            score=0;
        }
        else{
            this.phase++;
            if (remember.scoreattack){
                if ((parseInt(getCookie('score'+stagecount+(actcount-1)+'d'+difficulty.general)) || 0)<scoretotal){
                    setCookie('score'+stagecount+(actcount-1)+'d'+difficulty.general,scoretotal,36500);
                    set.oneup('NEW RECORD');
                }
                setCookie('stage'+stagecount+(actcount-1),true,36500);
            }
            else{
                if (scoretotal>highscore){
                    setCookie('highscore'+difficulty.general,scoretotal,36500);
                    highscore=scoretotal;
                }
            }
        }
        if (!remember.scoreattack && scoretotal+1000>=(1+Number(remember.extend))*Number(difficulty.extend)){
            set.oneup();
        }
    }.bind(sprite));
    sprite.ai[5].push(waitf.bind(sprite, 80));
    sprite.ai[6].push(function(){
            
        this.alpha-=0.01;
        titlesprite.alpha-=0.01;
        framesprite.alpha-=0.005;
        if (remember.scoreattack || boss){
            dead=0;
            globalfilters.twist.enabled = true;
            globalfilters.twist.radius += 10;
            globalfilters.twist.angle += 0.1;
            stage.alpha-=0.01;
        }

        if (this.alpha<=0)
        {
            this.delete=true;   
            titlesprite.delete=true;
            framesprite.delete=true;

            if (remember.scoreattack){
                
                stagecount=0;
                actcount=1;
                scene=1;
                skipscene=8;
                renderer.background.color = 0x000000;
            }
            if (!boss)
            {
                saveStage({
                    stagecount: stagecount,
                    actcount: actcount,
                    trystock: trystock-1,
                    scoretotal: scoretotal
                });
            }
        }
    }.bind(sprite));

    //push it to the array of all sprites
    sprites.push(sprite);
    frontlayer.addChild(sprite);

}

function ctimetext()
{
    var sprite = new PIXI.BitmapText('', { 
        fontName: "inline",
        anchor: (0.5,0.5),
        textAlign: 'right',
        fontSize: 100,
    });
    sprite.ai = [[]];
    sprite.ai[0].push(timetextf.bind(sprite));
    //sprite.pivot.set(sprite.width/2, sprite.height/2);
    sprite.x=950;
    sprite.y=10;
    
    //push it to the array of all sprites
    sprites.push(sprite);
    frontlayer.addChild(sprite);
}

function timetextf()
{
    if (scoretimer>99){
        this.text=99;
    }
    else{
        this.text=Math.round(scoretimer);
    }
}

function creadytext()
{
    var sprite = new PIXI.BitmapText('', { 
        fontName: "monospace",
        anchor: (0.5,0.5),
        textAlign: 'center',
        fontSize: 100,
        letterSpacing: 0
    });

    if (inputcontrol == 'key' || inputcontrol == 'gamepad'){sprite.text+='\n\n     Tries: '+gstringformat(trystock)+'\n     Score: '+gstringformat(scoretotal)+'\n     RECORD:'+gstringformat(highscore)+'\n\n  PRESS SHIELD TO START';}
    else if (inputcontrol == 'mouse'){sprite.text+='\n\n  Tries:'+gstringformat(trystock)+'\n  Score:'+gstringformat(scoretotal)+'\n     RECORD:'+gstringformat(highscore)+'\n\n CLICK TO START';}
    else if (inputcontrol == 'touch'){sprite.text+='\n\n       Tries:'+gstringformat(trystock)+'\n       Score:'+gstringformat(scoretotal)+'\n     RECORD:'+gstringformat(highscore)+'\n\n  TOUCH THE SCREEN TO START';}
    else {sprite.text+='\n\n     Tries:'+gstringformat(trystock)+'\n     Score:'+gstringformat(scoretotal)+'\n     RECORD:'+gstringformat(highscore)+'\n\n';}

    sprite.text=sprite.text.toUpperCase();

    sprite.pivot.set(sprite.width/2, sprite.height/2);
    
    sprite.x=960;
    sprite.y=600;
    
    return sprite;
}

function gstringformat(string, length=6){
    if (!string){
        string = '0';
    }
    string= string.toString();
    while (string.length<=length){
        string=' '+string;
    }
    return string;
}


//The Text displayed in the Tutorial
//Gives instruction and checks on succeed
function ctutorialtext()
{
    var sprite = new PIXI.BitmapText('', { 
        fontName: "solid",
        anchor: (0.5,0.5),
        textAlign: 'right',
        fontSize: 80,
    });
    sprite.subtext= new PIXI.BitmapText('FLY HERE TO EXIT TUTORIAL', { 
        fontName: "solid",
        anchor: (0.5,0.5),
        textAlign: 'right',
        fontSize: 50,
    });
    sprite.background=set.tutorialnumber();

    sprite.x=300;
    sprite.y=400;
    sprite.subtext.x=1250;
    sprite.subtext.y=50;

    sprite.phase=1;
    sprite.goals=[[0],[0],[0],[0]];
    sprite.ai = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
    sprite.ai[0].push(function (){
        this.background.highlight=[];
        if (lifestock<=1.01){
            lifestock=1.01;
        }
        if (heroy<100 && herox>1020){
            this.c1+=5;
            music[playing].fade(0.4, 0, 1000);
            this.phase=18;
        }
        if (ticks>300 && this.phase==1){
            this.phase=2;
        }
    }.bind(sprite));
    sprite.c1=0;


    sprite.ai[2].push(function (){
        this.background.highlight=[];
        if (inputcontrol=='key')
        { 
            buffer=Math.floor((max(this.goals[0], 50)+max(this.goals[1], 50)+max(this.goals[2], 50)+max(this.goals[3], 50))/2);
            this.text='MOVE IN EACH DIRECTION \nPRESS LEFT, RIGHT, UP AND DOWN';
            
            if (up){this.goals[0]++;}
            if (down){this.goals[1]++;}
            if (left){this.goals[2]++;}
            if (right){this.goals[3]++;}
            if (this.goals[0]>1 && this.goals[1]>1 && this.goals[2]>1 && this.goals[3]>1){
                this.goals=[[0],[0],[0],[0]];
                remember.control=1;
                this.phase++;
                ticks=0;
            }
        }
        else if (inputcontrol == 'gamepad'){
            if (up){this.goals[0]++;}
            if (down){this.goals[1]++;}
            if (left){this.goals[2]++;}
            if (right){this.goals[3]++;}
            this.text='MOVE IN EACH DIRECTION \nPRESS LEFT, RIGHT, UP AND DOWN';
            if (this.goals[0]>1 && this.goals[1]>1 && this.goals[2]>1 && this.goals[3]>1){
                this.goals=[[0],[0],[0],[0]];
                remember.control=1;
                this.phase++;
                ticks=0;
            }
        }
        else if (inputcontrol == 'touch'){
            this.text='MOVE BY TOUCHING THE SCREEN\nMOVE TO THE LEFT SIDE';
            if (herox<200){
                this.goals=[[0],[0],[0],[0]];
                remember.control=1;
                this.phase++;
                ticks=0;
            }
        }
        else if (inputcontrol == 'mouse'){
            this.text='MOVE WITH THE CURSOR\nMOVE TO THE LEFT SIDE';
            if (herox<200){
                this.goals=[[0],[0],[0],[0]];
                remember.control=1;
                this.phase++;
                ticks=0;
            }
        }
    }.bind(sprite));

    sprite.ai[3].push(function (){
        this.background.highlight=[];
        if (inputcontrol == 'key'){
            this.text='PRESS THE SHIELD BUTTON';
        }
        else if (inputcontrol == 'touch'){
            this.text='TOUCH THE PLAYER TO USE YOUR SHIELD';
        }
        else if (inputcontrol == 'mouse'){
            this.text='CLICK TO USE YOUR SHIELD';
        }
        else if (inputcontrol == 'gamepad'){
            this.text='PRESS THE SHIELD BUTTON';
        }
        if (shoot){
            this.phase++; 
            ticks=0;
            remember.wait=150;
        }
    }.bind(sprite));
    
    sprite.ai[4].push(function (){
        this.background.highlight=[];
        if (inputcontrol == 'key' || inputcontrol == 'gamepad'){
            this.text='THE SHIELD RECHARGES AFTER SOME SECS';
        }
        if (remember.wait<0){
            this.phase++; 
            ticks=0;
            remember.wait=0;
            set.ghost(0, 0, 400, 300, {full: true, layer: 'front'});
        }
    }.bind(sprite));
    
    sprite.ai[5].push(function (){
        this.background.highlight=[2];
        this.text='                    APPROACH THE BLUE BULLETS';
        if (herox<620 && herox>180){
            this.text='                    PRESS SHIELD WHEN BULLETS ARE \n                    FLASHING TO THE BEAT';
        }
        if (invincible>0){
            this.text='                DON\'T TOUCH THE BULLETS';
        }
        if (tutorialgoals>0){
            tutorialgoals=0;
            this.phase++; 
            ticks=0;
            remember.wait=-50;
            score=0;
            set.ghost(0, 1, 1520, 300, {full: true, layer: 'front'});
        }
    }.bind(sprite));

    sprite.ai[6].push(function (){
        this.background.highlight=[3];
        this.text='APPROACH THE PURPLE BULLETS';
        if (herox<1740 && herox>1260){
            this.text='PRESS SHIELD EXACTLY WHEN\nBULLETS ARE FLASHING TO THE BEAT';
        }
        if (invincible>0){
            this.text='DON\'T TOUCH THE BULLETS';
        }
        if (tutorialgoals>0){
            tutorialgoals=0;
            this.phase++; 
            ticks=0;
            remember.wait=-50;
            score=0;
            set.ghost(0, 0, 500, 300, {full: true, layer: 'front'});
        }
    }.bind(sprite));

    sprite.ai[7].push(function (){
        this.background.highlight=[2];
        this.text='                    DESTROY THE BLUE BULLETS';
        if (herox<760 && herox>280){
            this.text='                    LISTEN TO THE MUSIC TO\n                    KNOW WHEN THEY FLASH';
        }
        if (invincible>0){
            this.text='                DON\'T TOUCH THE BULLETS';
        }
        if (tutorialgoals>0){
            tutorialgoals=0;
            this.phase++; 
            ticks=0;
            remember.wait=-50;
            score=0;
            set.ghost(0, 1, 1520, 300, {full: true, layer: 'front'});
        }
    }.bind(sprite));

    sprite.ai[8].push(function (){
        this.background.highlight=[3];
        this.text='DESTROY THE PURPLE BULLETS';
        if (herox<1740 && herox>1260){
            this.text='LISTEN TO THE MUSIC TO\nKNOW WHEN THEY FLASH';
        }
        if (invincible>0){
            this.text='DON\'T TOUCH THE BULLETS';
        }
        if (tutorialgoals>0){
            tutorialgoals=0;
            this.phase=11; 
            ticks=0;
            remember.wait=-50;
            score=0;
            set.ghost(0, 0, 500, 300, {layer: 'front'});
            set.ghost(0, 1, 1400, 300, {layer: 'front'});
            //set.ghost(0, 0, 1500, 200, {layer: 'front'});
        }
    }.bind(sprite));

    sprite.ai[9].push(function (){
        this.background.highlight=[2];
        this.text='DESTROYING BULLETS \nHITS THE SHOOTING ENEMY';
        if (tutorialgoals>=1){
            this.phase++;
            tutorialgoals=0;
            ticks=0;
            set.ghost(0, 1, 500, 200, {layer: 'front'});
        }
    }.bind(sprite));

    
    sprite.ai[10].push(function (){
        this.background.highlight=[3];
        this.text='                    FEEL THE RHYTHM';
        if (tutorialgoals>=1){
            this.phase++;
            tutorialgoals=0;
            ticks=0;
            set.ghost(0, 0, 500, 300, {layer: 'front'});
            set.ghost(0, 1, 1400, 300, {layer: 'front'});
        }
    }.bind(sprite));


    sprite.ai[11].push(function (){
        this.background.highlight=[2,3];
        this.text='DIFFERENT COLORS FLASH \nTO A DIFFERENT BEAT';
        if (tutorialgoals>=2){
            this.phase++;
            tutorialgoals=0;
            ticks=0;
            set.ghost(100, 0, 500, 200, {layer: 'front'});
            set.ghost(100, 1, 1400, 200, {layer: 'front'});
        }
    }.bind(sprite));


    sprite.ai[12].push(function (){
        this.background.highlight=[2,3];
        this.text='                 FEEL THE RHYTHM';
        if (tutorialgoals>=2){
            this.phase++;
            tutorialgoals=0;
            ticks=0;
            set.ghost(100, 2, 400, 200, {layer: 'front'});
            set.ghost(100, 3, 1500, 200, {layer: 'front'});
            log2db('tutorial half');
        }
        }.bind(sprite));


    sprite.ai[13].push(function (){
        this.background.highlight=[2,3];
        this.text='USE FLASHING BULLETS TO \nDESTROY NON-FLASHING BULLETS';
        if (heroy<900){heroshift.y+=10;}
        if (tutorialgoals>=2){
            this.phase++;
            tutorialgoals=0;
            ticks=0;
            set.ghost(100, 2, 500, 200, {layer: 'front'});
            set.ghost(100, 3, 1400, 200, {layer: 'front'});
        }
    }.bind(sprite));

    sprite.ai[14].push(function (){
        this.background.highlight=[2,3];
        if (heroy<900){heroshift.y+=10;}
        this.text='NON-FLASHING BULLETS GIVE 5X SCORE';
        if (tutorialgoals>=2){
            this.phase=18;
            tutorialgoals=0;
            ticks=0;
            //set.ghost(0, 4, 500, 400, {layer: 'front'});
        }
    }.bind(sprite));

    sprite.ai[15].push(function (){
        this.text='            SOME ENEMIES NEED MORE HITS';
        if (tutorialgoals>=1){
            this.phase++;
            tutorialgoals=0;
            ticks=0;
            set.ghost(0, 4, 1600, 300, {layer: 'front'});
        }
    }.bind(sprite));

    sprite.ai[16].push(function (){
        this.text='RED HEARTS RESTORE HEALTH A BIT';
        if (tutorialgoals>=1){
            this.phase++;
            tutorialgoals=0;
            ticks=0;
            set.ghost(0, 0, -0, 200, {speedX: 1, layer: 'front'});
            set.ghost(100, 1, 1900, 300, {speedX: -1, layer: 'front'});
            set.ghost(700, 0, -0, 200, {speedX: 1, layer: 'front'});
            set.ghost(800, 1, 1900, 300, {speedX: -1, layer: 'front'});
            set.ghost(1300, 0, -0, 200, {speedX: 1, layer: 'front'});
            set.ghost(1400, 1, 1900, 300, {speedX: -1, layer: 'front'});
            set.ghost(1900, 0, -0, 200, {speedX: 1, layer: 'front'});
            set.ghost(2000, 1, 1900, 300, {speedX: -1, layer: 'front'});
            set.ghost(2400, 0, -0, 200, {speedX: 1, layer: 'front'});
            set.ghost(2400, 1, 1900, 300, {speedX: -1, layer: 'front'});
        }
    }.bind(sprite));

    sprite.ai[17].push(function (){
        this.text='NOW YOU CAN PRACTISE';
        if (ticks > 3300){
            this.phase++;
            tutorialgoals=0;
            ticks=0;
            log2db('tutorial full');
        }
    }.bind(sprite));

    sprite.ai[18].push(function (){
        this.background.highlight=[];
        this.text='TUTORIAL COMPLETED!';
        stage.alpha-=0.01;
    
        if (this.c1++>300){
            log2db('tutorial completed');
            lifestock=2;
            this.subtext.destroy();
            scene=99;
        }
    }.bind(sprite));

    //shield
    //blue heart
    //sword
    //combo when flashing
    //hit flashing 
    //life get


    
    //push it to the array of all sprites
    sprites.push(sprite);
    frontlayer.addChild(sprite);
    frontlayer.addChild(sprite.subtext);
}

set.menu = function () {


    var sprite = new PIXI.BitmapText('', { 
        fontName: "inline",
        anchor: (0.5,0.5),
        textAlign: 'right',
        fontSize: 100,
    });

    sprite.pointer=0;
    sprite.menu1=[
            {'name': 'START STAGE', 'values':[1,2,3,4,5], 'function': function() {}},
            {'name': 'INFINITE TRIES ', 'values':['OFF', 'ON'], 'function': function() {}},
            {'name': 'INVINCIBLE', 'values':['OFF', 'ON'], 'function': function() {}},
            {'name': 'NO BULLETS', 'values':['OFF', 'ON'], 'function': function() {}},
            {'name': 'HARD MODE', 'values':['OFF', 'ON'], 'function': function() {}},
            {'name': 'EXIT TO MAIN MENU', 'function': function() {}},
    ];

sprite.menu=sprite.menu1;

    sprite.alpha=0;
    sprite.phase=1;
    sprite.active=active;
    sprite.anchor.x=0.5;
    sprite.anchor.y=0;
    sprite.x=960;
    sprite.y=100;
    sprite.wait=30;
    sprite.ai = [[],[],[],[]];

    sprite.ai[1].push(fadein.bind(sprite, 0.01, 1, 1));
    sprite.buffer=0;
    sprite.ai[2].push(function (){
        this.buffer++;
        if (this.buffer>600){
            this.phase++;
        }
        if (left+right+up+down+shoot+laser>=1){
            this.buffer=0;
        }
    }.bind(sprite));

    sprite.ai[0].push(function (){
        this.text='';
        for (i=0; i < sprite.menu.length; i++){
            if (this.pointer==i){
                this.text+='->'
            }
            else{
                this.text+='  '
            }
            this.text+=this.menu[i].name
            if (typeof(this.menu[i].pointer)=='number'){
                this.text+=': '+this.menu[i].values[this.menu[i].pointer];
            }
            else if (typeof(this.menu[i].value)=='number' && this.menu[i].wait==false)
            {
                this.text+=': '+this.menu[i].value;
            }
            else if (typeof(this.menu[i].active)=='string' && this.menu[i].wait==true){
                this.text+=': '+this.menu[i].active;
            }
            this.text+='\n';
        }
        //this.text='New Game\nContinue\nControls\nOptions'
    }.bind(sprite));
    sprite.ai[0].push(function (){
        this.wait--;
        if (down && this.wait<=0){this.pointer++; this.wait=10;}
        if (up && this.wait<=0){this.pointer--; this.wait=10;}
        if (this.pointer < 0){
            this.pointer=this.menu.length-1;
        }
        if (this.pointer >= this.menu.length){
            this.pointer= 0;
        }
        
        if (typeof(this.menu[this.pointer].pointer)=='number'){
            if (right && this.wait<=0){this.menu[this.pointer].pointer++; this.wait=10;}
            if (this.menu[this.pointer].pointer >= this.menu[this.pointer].values.length){
                this.menu[this.pointer].pointer=0
            }
            if (left && this.wait<=0){this.menu[this.pointer].pointer--; this.wait=10;}
            if (this.menu[this.pointer].pointer < 0){
                this.menu[this.pointer].pointer=this.menu[this.pointer].values.length-1
            }
            this.menu[this.pointer].function(this.menu[this.pointer].values[this.menu[this.pointer].pointer]);
        }
        else{
            if (shoot && this.wait<=0){this.menu[this.pointer].function(); this.wait=10;}
        }
        
    
    }.bind(sprite));

    sprite.ai[3].push(function(){
        this.alpha-=0.01;
        if (this.alpha<=0)
        {
            this.delete=true;   
            scene--;
        }
    }.bind(sprite));

    sprites.push(sprite);
    frontlayer.addChild(sprite);
    
    function getpadkey()
    {
        gamepads = navigator.getGamepads();
        if (gamepads.length-1>=gamepadindex && gamepads[gamepadindex]!==null){
        var returnvalue = -1;
        if (typeof(gamepads[gamepadindex])=='object'){
            for (i=0; i<gamepads[gamepadindex].buttons.length; i++){
                if (gamepads[gamepadindex].buttons[i].touched==true){
                    returnvalue=i;
                }
            }
        }
        return returnvalue;
    }
    }
    
    function setpadkey(key){
        var counter=100;
        var x = -1;
        this.wait=true;
        while (x<0 && counter-->0){
            sleep(50);
            x=getpadkey();
            
        }
        if (x>=0){
            pad[key]=x;
            this.wait=false;
            this.value=x;
        }
        else{
            this.value=0;
            this.wait=false;
        }
    }
}

set.laserstar = function (index, active=0)
{
   
    var sprite=setsprite(
    new PIXI.Sprite(tex.p2),
    {anchor: true, active: active, x: 400, y: 300});
    //sprite.blendMode=PIXI.BLEND_MODES.ADD
    sprite.alpha=0.4;
    sprite.index=index;
    sprite.rotate=0;
    //sprite.scale.y=10;
    //sprite.scale.x=10;
    sprite.ai=[[]];
    sprite.ai[0].push(function (){
        this.rotation+=0.1;
        this.offset+=0.01;
        if (laserstock>=1){
            this.rotate+=0.3;
        }
        else{
            this.rotate+=0.03;
        }
        if (this.rotate>=2.0){
            this.rotate=0;
        }
        this.x=herox+240*Math.sin((index+this.rotate)*0.02*pi); 
        this.y=heroy-240*Math.cos((index+this.rotate)*0.02*pi);
        if (laserstock*100<this.index){
            this.tint=rgbToHex(0,0,0);
        }
        else {
            if (lifestock >=3){
                this.tint=rgbToHex(255,255,255);
                this.alpha=0.3;
            }
            else if (lifestock >=2){
                this.tint=rgbToHex(255,255,0);
                this.alpha=0.4;
            }
            else if (lifestock >=1){
                this.tint=rgbToHex(255,100,0);
                this.alpha=0.45;
            }
            else {
                this.tint=rgbToHex(255,0,0);
                this.alpha=0.5;
            }
                
        }
    }.bind(sprite));
}



function create(active, type, x, y, options) //layer,
{
    //
    
    if (typeof(options)==='undefined') options = {};
    var excolor = options.excolor || {x: 255, y: 255, z:255};
    var speedX = options.speedX || 0;
    var speedY = options.speedY || 0;
    var offsetX = options.offsetX || 0;
    var offsetY = options.offsetY || 0;
    var subtype = options.subtype || 'none'; 
    var beatlayer = options.beatlayer || 0;
    var accX = options.accX || 0;
    var accY = options.accY || 0;
    var misc1 = options.misc1 || 0;
    var misc2 = options.misc2 || 0;
    var misc3 = options.misc3 || 0; 
    var misc4 = options.misc4 || 0; 
    var misc5 = options.misc5 || 0; 
    var misc6 = options.misc6 || 0;
    var layer='container';

    var tint=options.tint || parseInt('0xFFFFFF', 16);
    var light=1;
    var red=1;
    var green=1;
    var blue=1;
    var z=0;

    var phase=0;

    var squarex=0;
    var squarey=0;
    var circle=0;
    var rotation=0;
    var health=0;
    var hit=0;
    var collision='none';
    var del = false;
    var col=true;

    var c1=0;
    var c2=0;
    var c3=0;

    var counter=[];

    if (type=='particle'){
        var color = options.color || {r: 255, g: 255, b:255};
        //layer='particle';
        var sprite = new PIXI.Sprite(subtype);
        var rotspeed = options.rotspeed || 1;
        sprite.ai = [[]];
        sprite.alpha=options.alpha || 2;
        tint=rgbToHex(color.r,color.g,color.b);

        sprite.blendMode = options.blendmode || PIXI.BLEND_MODES.ADD;

        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(breakf.bind(sprite));
        sprite.ai[0].push(offborderf.bind(sprite, 10));
        sprite.ai[0].push(rotatef.bind(sprite, rotspeed));
        sprite.ai[0].push(ai.zoom.bind(sprite, options.zoomX || 1, options.zoomY || 1));

        layer='sprite';

    }

    if (type=='score')
    {

    var sprite = new PIXI.BitmapText('X', { 
        fontName: "monospace",
        anchor: (0.5,0.5),
        textAlign: 'right',
        fontSize: 58,
        letterSpacing: 0
    });
    //score=1234525252;
    sprite.ai = [[]];
    sprite.alpha=options.alpha || 0.8;
    layer='front';
    sprite.ai[0].push(varupdate.bind(sprite, options.variable || 'score'));                     
    }
    if (type=='lifesprite'){
        if (stagecount==0){
            var sprite = new PIXI.Sprite(tTuthero);
        }
        if (stagecount==1){
            var sprite = new PIXI.Sprite(tHero);
        }
        else if (stagecount==2)
        {
            var sprite = new PIXI.Sprite(tHero2);
        }
        else if (stagecount==3)
        {
            var sprite = new PIXI.Sprite(tHero4);
        }
        else if (stagecount==4)
        {
            var sprite = new PIXI.Sprite(tHero3);
        }
        else{
            var sprite = new PIXI.Sprite(tTuthero);
        }
        //var sprite = new PIXI.Sprite(tHero);
        sprite.alpha=options.alpha || 0.8;
        sprite.scale.x=0.35;
        sprite.scale.y=0.35;
        sprite.ai = [[]];
        layer='front';
    }
    if (type=='lasersprite'){
        var sprite = new PIXI.Sprite(tex.recharge);
        sprite.alpha=options.alpha || 0.8;
        sprite.scale.x=0.24;
        sprite.scale.y=0.24;
        sprite.ai = [[]];
        layer='front';
    }
    /*if (type=='healthsprite'){
        var sprite = new PIXI.Sprite(tLife);
        sprite.alpha=options.alpha || 0.8;
        sprite.scale.x=0.5;
        sprite.scale.y=0.5;
        sprite.ai = [[]];
        layer='front';
    }*/

    if (type=='laserbars')
    {
        layer='backfront';
        var sprite = new PIXI.Graphics();
        sprite.alpha=options.alpha || 0.8;
        
        sprite.ai = [[]];
        sprite.ai[0].push(varupdate.bind(sprite, 'laser'));                     
    }
    if (type=='combobar')
    {
        layer='backfront';
        var sprite = new PIXI.Graphics();
        sprite.alpha=options.alpha || 0.8;
        
        sprite.ai = [[]];
        sprite.ai[0].push(varupdate.bind(sprite, 'combovalue'));                     
    }
    if (type=='lifebars')
    {
        layer='front';
        var sprite = new PIXI.Sprite(tex.lifewhite);//new PIXI.Graphics();
        sprite.scale.x=0.5;
        sprite.scale.y=0.5;
        sprite.anchor.set(0.5);
        sprite.index=options.index || 0;
        if (options.index==0){
            tint=rgbToHex(255, 0, 0);
        }
        else if (options.index==1){
            tint=rgbToHex(255, 100, 0);
        }
        else if (options.index==2){
            tint=rgbToHex(255, 255, 0);
        }
        alpha= 0.1;
        
        sprite.ai = [[]];
        sprite.ai[0].push(varupdate.bind(sprite, 'life'));                     
    }

    if (type=='text')
    {
    
    var text = options.text || '+';
    
    var sprite = new PIXI.BitmapText(text, { 
        fontName: "monospace",
        anchor: (0.5,0.5),
        textAlign: 'right',
        fontSize: options.size || 50,
    });
    sprite.alpha=options.alpha || 1;
    
    sprite.ai = [[]];
    sprite.ai[0].push(autofadeout.bind(sprite, 0.01));           
    }


    if (type=='solidparticle'){
        //layer='particle';
        var sprite = new PIXI.Sprite(subtype);
        misc2=options.rotspeed||misc2;
        tint=rgbToHex(misc1*255,misc1*255,misc1*255);
        sprite.alpha=options.alpha || 1;


        sprite.ai = [[]];

        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(rotatef.bind(sprite, misc2));

        sprite.ai[0].push(fadein.bind(sprite, misc3, 1));
        sprite.ai[0].push(breakf.bind(sprite));
        sprite.ai[0].push(offborderf.bind(sprite, 10));

        layer='sprite';
    }


    if (type=='laser')
    {
        if (subtype=='bullet'){
            var sprite = new PIXI.Sprite();
            sprite.ai = [[]];
            circle=200/Math.sqrt(difficulty.chain);
            sprite.ai[0].push(autodestroy.bind(sprite));
        }
        else{
            remember.shieldframe=true;

            globalfilters.shockwave.time=0;
            globalfilters.shockwave.enabled=true;
            globalfilters.shockwave.brightness=1.5;
            globalfilters.shockwave.amplitude=50;

            var sprite = new PIXI.Sprite(tLaser[Math.floor(Math.random()*4)]);
            sprite.ai = [[]];
            if (lifestock>=3){
                tint=rgbToHex(255, 255, 255);
            }
            else if (lifestock>=2){
                tint=rgbToHex(255, 255, 80);
            }
            else if (lifestock>=1){
                tint=rgbToHex(255, 180, 80);
            }
            else if (lifestock>=0){
                tint=rgbToHex(255, 30, 80);
            }
            remember.lasthit=0;
            sprite.ai[0].push(function(){
                this.x=herox;
                this.y=heroy;
                if (this.alpha<0.6){
                    this.collision='none';
                }
                if (this.alpha<=0.05 && remember.lasthit==0){
                    sfx.play('miss');
                    ctext(herox, heroy, 'MISS', {speedY: -1, color:{x: 255, y: 100, z:100}});
                
                }
            }.bind(sprite));
            circle=240;
            sprite.ai[0].push(autofadeout.bind(sprite, 0.05));
            sprite.blendMode = PIXI.BLEND_MODES.ADD;
            remember.shield=1;
        }


        sprite.ai[0].push(laserhitf.bind(sprite));
        layer='front';
        collision='laser';
    }

    //Picture Type: 
    else if (type=='picture'){
        //misc1= fadein in frames
        //misc2=duration in frames
        //misc3= fadeout in frames
        //misc4= light from 0-1
        //misc5=scale
        //misc6=zoom
        var sprite = new PIXI.Sprite(subtype);

        phase=1;
        tint=options.tint||rgbToHex(misc4*255,misc4*255,misc4*255);
        sprite.blendMode = options.blendmode || PIXI.BLEND_MODES.NORMAL;
        sprite.scale.x=misc5;
        sprite.scale.y=misc5;

        if (subtype==tGrassborder){
            layer='backlayer';
            sprite.scale.x*=2;
            //sprite.scale.y/=2;
        }
        
        else{
            var layer = options.layer || 'front';
        }

        sprite.alpha=0;
        sprite.ai = [[], [], [], [], []];

        
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(backgroundzoomf.bind(sprite, misc6));
        sprite.ai[0].push(accf.bind(sprite));

        sprite.ai[1].push(waitf.bind(sprite, misc1));
        sprite.ai[1].push(fadein.bind(sprite, 1/misc1, options.alpha || 1));
        sprite.ai[2].push(waitf.bind(sprite, misc2));
        sprite.ai[3].push(fadein.bind(sprite, -1/misc3, 1, true));

        sprite.ai[4].push(autodestroy.bind(sprite));
    }

    else if (type=='hero')
    {
        var sprite = new PIXI.projection.Container2d();
        sprite.persp={};
        sprite.persp.x=0;
        sprite.persp.y=0;


        if (stagecount==0){
            var sprite2 = new PIXI.projection.Sprite2d(tTuthero);
        }
        if (stagecount==1){
            var sprite2 = new PIXI.spine.Spine(tex.butterfly);
            
        sprite.filters=[
            //new PIXI.filters.OutlineFilter(2, 0x222222),
            get.outline(),
            get.shadow(),
        ];
        sprite.filters[1].offset={x: -100, y:-100};
        sprite.filters[1].blur=8;

            sprite2.state.addAnimation(0, 'animation', true, 0);
            //var sprite2 = new PIXI.projection.Sprite2d(new PIXI.spine.Spine(tex.butterfly));
        }
        else if (stagecount==2)
        {
                var sprite2 = new PIXI.spine.Spine(tex.hero2);
                
                sprite.filters=[
                    get.outline(),
                    get.shadow(),
                    //new PIXI.filters.DropShadowFilter({shadowOnly: false})
                ];
                sprite.filters[1].offset={x: -100, y:-100};

                sprite2.animation = sprite2.state.addAnimation(0, 'turn', true, 0);
                sprite2.animation.timeScale=0; //stop animation, sets speed to animation 0=0%, 1=100%, use to make animation synchron
                sprite2.ai = [[],[],[]];
                sprite2.turn=1;
                
        }
        else if (stagecount==3)
        {
            //var sprite2 = new PIXI.projection.Sprite2d(tHero4);
            var sprite2 = new PIXI.spine.Spine(tex.hero4);
            
            sprite.filters=[
                get.outline(),
                get.shadow(),
            ];
            sprite.filters[1].offset={x: -100, y:-100};
            sprite.filters[1].blur=8;

            sprite2.state.addAnimation(0, 'animation', true, 0);

        }
        else if (stagecount==4)
        {
            var sprite2 = new PIXI.spine.Spine(tex.hero3);
            
            sprite.filters=[
                get.outline(),
                get.shadow(),
            ];
            sprite.filters[1].offset={x: -100, y:-100};
            sprite.filters[1].blur=8;

            sprite2.state.addAnimation(0, 'animation', true, 0);
        }
        else{
            var sprite2 = new PIXI.spine.Spine(tex.tuthero);
            
        sprite.filters=[
            get.outline(),
            new PIXI.filters.GlowFilter({outerStrength: 1, distance: 30})
        ];
        sprite.filters[1].offset={x: -100, y:-100};
        sprite.filters[1].blur=8;

            sprite2.state.addAnimation(0, 'animation', true, 0);
        }
        
        //sprite2.anchor.set(0.5);
        sprite.addChild(sprite2);
        sprite.anchor={x: 0.5, y: 0.5};
        hero=sprite2;
        
        phase=1;

        sprite.ai = [[],[],[]];
        
        if (stagecount==2)
        {
            sprite.ai[1].push(ai.shadow.bind(sprite, sprite.filters[1]));
            //particle effect afterburner
            sprite.ai[0].push(function () {
                create(0, 'picture', this.x, this.y+45, {
                tint: rgbToHex(
                    Math.random()*100+100,
                    100,
                    100
                ),
                accY: 0.2, 
                layer: 'front', 
                speedX: 2-4*Math.random(), 
                speedY: (Math.random()*5+8), 
                subtype: tParticle02, 
                alpha: 0.4,
                misc1:2, misc2:2, misc3:8, misc4: 1, misc5: 1});
        }.bind(sprite));

        //rotation of rocket
            sprite.ai[0].push(function () {
                if (right && this.turn>0){
                    this.turn -=0.04;
                }
                if (left && this.turn<2){
                    this.turn +=0.04;
                }
                if (!left && !right){
                    if (this.turn>1){
                        this.turn -=0.04;
                    }
                    else if (this.turn<1){
                        this.turn +=0.04;
                    }
                }
                if (this.turn<0){
                    this.turn=0.0;
                }
                else if (this.turn>1.9){
                    this.turn=1.9;
                }
                this.state.tracks[0].trackTime=this.turn * 0.3333;
            }.bind(sprite2));
        }
        sprite.controlcounter=0;
        sprite.ai[1].push(ai.shadow.bind(sprite, sprite.filters[1]));
        sprite.ai[1].push(herodief.bind(sprite));
        sprite.ai[1].push(heromovef.bind(sprite, options.control));
        sprite.ai[1].push(movef.bind(sprite));
        sprite.ai[1].push(herohitf.bind(sprite));
        sprite.ai[1].push(hitf.bind(sprite));
        //sprite.ai[1].push(sword.bind(sprite));
        sprite.ai[1].push(pushborder.bind(sprite, 50));
        if (options.alpha>0){
            sprite.alpha=0;
            sprite.ai[1].push(function(){this.alpha+=1/options.alpha}.bind(sprite));
        }
        
        if (stagecount==1){
            sprite.ai[1].push(ai.shadow.bind(sprite, sprite.filters[1]));
        }
        
        
        circle=20;
        offsetY= -50;
        health=999999;
        collision='hero';        
    }
    // create hero


    if (type=='b_grasstex'){
        layer='behindbackground';
        var sprite = new PIXI.TilingSprite(tGrass, 1920, 1080);

        sprite.c1=0;

        tint=rgbToHex(options.r || 180, options.g || 180, options.b || 180);

        sprite.ai = [[]];
        sprite.ai[0].push(scrollf.bind(sprite, 0));
        sprite.ai[0].push(ai.beatadjust.bind(sprite, globalfilters.adjust));

        x=0;
        y=0;
    }



    if (type=='b_grass'){
        layer='backlayer';
        var buffer = Math.random();
        if (buffer<0.4)
        {
        var sprite = new PIXI.Sprite(tGrass1);
        }
        else if (buffer<0.8){
            var sprite = new PIXI.Sprite(tGrass2);
        }
        else{
            var sprite = new PIXI.Sprite(tGrass3);
        }

        sprite.scale.y=Math.random()*0.7+0.3;
        tint=rgbToHex(200,120,120);
        sprite.ai = [[]];
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ogscale={x: 1, y: 1};
        sprite.ai[0].push(squeezef.bind(sprite, 0.005));
        sprite.ai[0].push(offborderf.bind(sprite));
    }



    /*if (type=='b_forestground'){
        layer='behindbackground';
        var sprite = new PIXI.TilingSprite(tForestground, 1920, 1080);
        phase=1;

        sprite.c1=0;

        sprite.ai = [[], [], [], [], []];
        sprite.ai[1].push(syncscrollf.bind(sprite, 20, 2837, -1, 'tilePosition.y', 0, 0));
        sprite.ai[1].push(scenephasechangef.bind(sprite, 17, 2));

        sprite.ai[2].push(syncscrollf.bind(sprite, 30, 2837, -2, 'tilePosition.y', -1701, 1));

        x=0;
        y=0;
    }*/

    if (type=='b_space'){
        layer='behindbackground';
        var sprite = new PIXI.TilingSprite(tSpace, 1920, 1080);
        light=0;
        tint=(0,0,0);
        sprite.ai = [[], [], [], [], []];
        sprite.ai[0].push(lightset.bind(sprite));
        sprite.ai[0].push(lightf.bind(sprite, 0.002));
        sprite.ai[0].push(simplescrollf.bind(sprite, 2));
        sprite.ai[0].push(function(){
            if (musictime>143.5 && musictime<157){
                this.tilePosition.y += 4;
            }
        }.bind(sprite, 2));
        x=0;
        y=0;
    }

    if (type=='b_tutorial'){
        layer='background';
        tint=rgbToHex(160,160,160);
        var sprite = new PIXI.TilingSprite(tDunkelwald, 1920, 1080);
        sprite.ai = [[]];
        sprite.ai[0].push(simplescrollf.bind(sprite, 1.5));
        x=0;
        y=0;
    }
    if (type=='fog1'){
        layer='background';
        tint=rgbToHex(30,30,30);
        var sprite = new PIXI.TilingSprite(tex.fog1, 1920, 1080);
        sprite.ai = [[], [], [], [], []];
        phase=1;
        sprite.anchor.x=0;
        sprite.anchor.y=0;
        sprite.alpha=0.3;
        sprite.ai[0].push(simplescrollf.bind(sprite, 5));
        sprite.ai[1].push(scenephasechangef.bind(sprite, 17, 2));
        sprite.ai[2].push(autofadeout.bind(sprite, 0.001));    
        x=0;
        y=0;
    }

    if (type=='b_river'){
        layer='behindbackground';
        var sprite = new PIXI.TilingSprite(tex.riverground, 1920, 1080);
        phase=1;
        sprite.temp=0;
        sprite.alpha=options.alpha || 0.3;
        sprite.ai = [[], [], [], [], [], []];
        sprite.ai[1].push(fadein.bind(sprite, 0.001, 0.85, true));
        sprite.ai[1].push(function(){
            if (musictime <= 60){
                this.light=1-beat[3];
            }
        }.bind(sprite));
        sprite.ai[2].push(function(){
            if (musictime <= 60){
                this.light=1-beat[3];
            }
        }.bind(sprite));
        sprite.ai[0].push(simplescrollf.bind(sprite, 5));
        sprite.ai[0].push(brightset.bind(sprite));
        sprite.ai[2].push(function(){
            if (scene==16 && this.temp++>380){
                this.x+=0.960;
                this.scale.x-=0.001;
                this.tileScale.y=this.scale.x;
                this.light-=0.0009;
                if (this.scale.x<0.4){
                    this.phase++;
                }
            }
        }.bind(sprite));
        sprite.ai[3].push(function(){
            if (temp.fadeout<0){
                this.alpha+=temp.fadeout;
                if (this.alpha<=0 || background.alpha<=0){
                    this.delete=true;
                }
            }
        }.bind(sprite));
        //
        x=0;
        y=0;
    }

    if (type=='b_city'){
        if (options.fog){
            layer='background';
            var sprite = new PIXI.TilingSprite(tex.fog3, 1920, 1080);
            sprite.ai = [[], [], [], [], [], []];
            sprite.alpha=options.alpha || 0;
            sprite.tileScale.x = options.zoom || 1.5;
            sprite.tileScale.y = options.zoom || 1.5;
            sprite.scroll=options.scroll || 2;
            sprite.ai[0].push(simplescrollf.bind(sprite, 0));
            tint=rgbToHex(170,170,170);
        }
        else{
            layer='behindbackground';
            var sprite = new PIXI.TilingSprite(tex.city, 1920, 1080);
            sprite.ai = [[], [], [], [], [], []];
            sprite.alpha=sprite.alpha=options.alpha || 1.0;
            sprite.tilePosition.y=3300;
            sprite.tileScale.x = options.zoom || 2;
            sprite.tileScale.y = options.zoom || 2;
            sprite.scroll=options.scroll || 0;
            sprite.ai[0].push(simplescrollf.bind(sprite, 0));
            tint=rgbToHex(200,200,200);
        }

        phase=1;
        sprite.temp=1;
        //sprite.ai[1].push(fadein.bind(sprite, 0.001, 0.85, false));
        
        //sprite.ai[0].push(brightset.bind(sprite));
        sprite.ai[1].push(function(){
            if (actcount==4 && this.temp<3){
                this.temp*=1.01;
                this.zoom=0;
            }
            else if(actcount>=4){
                if (options.fog){
                    this.alpha-=0.0002;
                }
            }
            else{
                if (options.fog){
                    this.tileScale.x*=0.99980;
                    if (this.alpha<1){
                        this.alpha+=0.0005;
                    }
                }
                else{
                    this.tileScale.x*=0.99985;
                    //this.alpha-=0.00003;
                }
                this.tileScale.y=this.tileScale.x;
                this.tilePosition.x=(1-this.tileScale.x)*960;
            }

            if (this.scroll<1){
                this.scroll+=0.001;
            }


                
                
        }.bind(sprite));
        //
        x=0;
        y=0;
    }

    if (type=='b_groundnear'){
        layer='backlayer';
        var sprite = new PIXI.Sprite(tGroundnear);
        phase=1;
        sprite.scale.x=0.1;
        sprite.scale.y=0.1;
        sprite.size=0.1;
        sprite.c1=0;

        sprite.ai = [[], [], [], []];
        sprite.ai[2].push(backgroundzoomf.bind(sprite, 0.005, 1));
        //sprite.ai[2].push(shiftf.bind(sprite, -0.25, 0.5));
        //sprite.ai[1].push(movef.bind(sprite));
        sprite.ai[1].push(timedmovef.bind(sprite));
        //sprite.ai[1].push(waitf.bind(sprite, 540));
        //sprite.ai[0].push(scrollf.bind(sprite, 1));
    }

    if (type=='f_mushroom'){
        offsetX= 300;
        offsetY= -50;
        layer='background';
        var sprite = new PIXI.Sprite(tMushroom);
        phase=1;
        sprite.scale.x=0.333;
        sprite.scale.y=0.333;
        sprite.size=0.333;
        sprite.c1=0;
        if (difficulty.bullets>=2){
            health=3300;
        }
        else{
            health=2300;
        }
        sprite.angle=[directionh(x, y)];
        squarex=500;
        squarey=50;
        sprite.score=100;
        sprite.createanime=1;
        sprite.beatbuffer=0;
        sprite.beatbuffer2=0;
        

        sprite.ai = [[], [], [], [], [], [], []];

        if (nobullets){
            sprite.passed=0;
            sprite.ai[0].push(ai.ziskadestroy.bind(sprite, 3500));
        }

        sprite.ai[0].push(function(){
            if (this.health>=0){
                scoretimer=120-musictime;
                if (scoretimer<0){scoretimer=0};
            }
        }.bind(sprite));

        sprite.ai[0].push(function(){
            this.tint=rgbToHex(background.scale.x*255/5+(510/5),background.scale.x*255/5+(510/5),background.scale.x*255/5+(510/5));
        }.bind(sprite));

        sprite.ai[2].push(timeoutdief.bind(sprite));

        sprite.ai[2].push(smoke.bind(sprite, 350, -100, 0.8*health, 0.8*health));
        sprite.ai[2].push(smoke.bind(sprite, 175, -120, 0.8*health, 0.7*health));
        sprite.ai[2].push(smoke.bind(sprite, -100, -100, 0.8*health, 0.6*health));
        sprite.ai[2].push(smoke.bind(sprite, 250, -120, 0.8*health, 0.45*health));
        sprite.ai[2].push(smoke.bind(sprite, -50, -180, 0.8*health, 0.3*health));
        sprite.ai[2].push(smoke.bind(sprite, 100, -160, 0.8*health, 0.2*health));
        sprite.ai[2].push(smoke.bind(sprite, -150, -140, 0.8*health, 0.1*health));

        sprite.ai[3].push(smoke.bind(sprite, 350, -100, 0.8*health, 0.8*health));
        sprite.ai[3].push(smoke.bind(sprite, 175, -120, 0.8*health, 0.7*health));
        sprite.ai[3].push(smoke.bind(sprite, -100, -100, 0.8*health, 0.6*health));
        sprite.ai[3].push(smoke.bind(sprite, 250, -120, 0.8*health, 0.45*health));
        sprite.ai[3].push(smoke.bind(sprite, -50, -180, 0.8*health, 0.3*health));
        sprite.ai[3].push(smoke.bind(sprite, 100, -160, 0.8*health, 0.2*health));
        sprite.ai[3].push(smoke.bind(sprite, -150, -140, 0.8*health, 0.1*health));

        //sprite.ai[1].push(timedmovef.bind(sprite));
        sprite.ai[1].push(syncscrollf.bind(sprite, 30, 2837, -2, 'position.y', -350));
        sprite.ai[1].push(scenechangef.bind(sprite, 20));
        sprite.ai[1].push(function(){
            this.health=health;//3500;
            if (this.createanime){
                set.animation({x: 537, y: 575, parent: this});
                this.createanime=0;
            }
            
        }.bind(sprite));


        //sprite.ai[2].push(backgroundzoomf.bind(sprite, 0.005, 1));
        //sprite.ai[2].push(shiftf.bind(sprite, -0.25, -0.5));

        //sprite.ai[1].push(waitf.bind(sprite, 540));

        counter[0]=[1, 50, 10, 0, 0, 0];
        counter[1]=[100, 50, 10, 0, 0, 0];
        sprite.ai[2].push(countf.bind(sprite));

       sprite.ai[2].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'whitecluster', beatlayer: 1}, [
        [2, [
                {fx: 'xyrandom', key: ['position'], gainx:400, gainy:100, offsetx:-200, offsety: -250},
                {fx: 'aim', key: ['angle']},
                {fx: 'xyrelative', key: ['speed'], speed: 5}
            ]
        ]
    ]));

        sprite.ai[2].push(phasechangef.bind(sprite, 1500, 'health'));
        sprite.ai[2].push(hitf.bind(sprite));

        sprite.ai[3].push(countf.bind(sprite));
        sprite.ai[3].push(hitf.bind(sprite));

        sprite.ai[3].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'whitecluster', beatlayer: 1}, [
            [3, [
                {fx: 'xyrandom', key: ['position'], gainx:500, gainy:100, offsetx:-200, offsety: -250},
                {fx: 'aim', key: ['angle']},
                {fx: 'xyrelative', key: ['speed'], speed: 10}
                ]
            ]
        ]));

        if (difficulty.bullets>=2){
            sprite.ai[2].push(function(){
                if (beat[1]>0 && this.beatbuffer==0){
                    for (let i=0; i<40; i++){
                        create(0, 'bullet', i*48, 0, {
                            parent: this, 
                            speedX: 0, 
                            speedY: difficulty.bullets, 
                            subtype: 'whitecluster', 
                            beatlayer: 2,
                        });
                    }
                }
                this.beatbuffer=beat[1];
            }.bind(sprite));

            sprite.ai[3].push(function(){
                if (beat[1]>0 && this.beatbuffer==0){
                    for (let i=0; i<40; i++){
                        create(0, 'bullet', i*48, 0, {
                            parent: this, 
                            speedX: 0, 
                            speedY: 2*difficulty.bullets, 
                            subtype: 'whitecluster', 
                            beatlayer: 2,
                        });
                    }
                }
                this.beatbuffer=beat[1];
            }.bind(sprite));
        }

        /*if (difficulty.bullets>=3){
            sprite.ai[2].push(function(){
                if (beat[1]>0 && this.beatbuffer2==0){
                    if (Math.random()>0.5){
                        for (let i=0; i<20; i++){
                            console.log(i);
                            create(0, 'bullet', 0, 5+i*54, {
                                parent: this, 
                                speedX: difficulty.bullets*0.7, 
                                speedY: 0, 
                                subtype: 'whitecluster', 
                                beatlayer: 2,
                            });
                        }
                    }
                    else{
                        for (let i=0; i<20; i++){
                            create(0, 'bullet', 1920, 5+i*54, {
                                parent: this, 
                                speedX: -difficulty.bullets*0.7, 
                                speedY: 0, 
                                subtype: 'whitecluster', 
                                beatlayer: 2,
                            });
                        }
                    }
                    
    
                }
                this.beatbuffer2=beat[1];
            }.bind(sprite));

            sprite.ai[3].push(function(){
                if (beat[1]>0 && this.beatbuffer2==0){
                    if (Math.random()>0.5){
                        for (let i=0; i<20; i++){
                            console.log(i);
                            create(0, 'bullet', 0, 5+i*54, {
                                parent: this, 
                                speedX: difficulty.bullets, 
                                speedY: 0, 
                                subtype: 'whitecluster', 
                                beatlayer: 2,
                            });
                        }
                    }
                    else{
                        for (let i=0; i<20; i++){
                            create(0, 'bullet', 1920, 5+i*54, {
                                parent: this, 
                                speedX: -difficulty.bullets, 
                                speedY: 0, 
                                subtype: 'whitecluster', 
                                beatlayer: 2,
                            });
                        }
                    }
                    
                }
                this.beatbuffer2=beat[1];
            }.bind(sprite));
        }*/

        sprite.ai[3].push(phasechangef.bind(sprite, 0, 'health', false));
        sprite.ex_cicles=0;
        sprite.ex_timer=0;
        sprite.ai[4].push(mushroom_ex.bind(sprite, 5));
        sprite.ai[6].push(dief.bind(sprite, 'mushroomexplosion'));
        sprite.ai[5].push(scenenextf.bind(sprite));
    }


    if (type=='label'){
        layer='front';
        var sprite = new PIXI.Sprite(subtype);
        phase=1;
        sprite.filters=[
            new PIXI.filters.GlowFilter({outerStrength: 1, distance: 30, color: options.glowcolor || 0xFFFFFF})
        ]

        sprite.alpha=0;

        sprite.ai = [[], [], [], [], [], []];

        sprite.ai[1].push(moveuntil.bind(sprite, 960, 0));
        sprite.ai[1].push(fadein.bind(sprite, 0.02));

        sprite.ai[2].push(waitf.bind(sprite, options.wait || 200, 0));

        sprite.ai[3].push(setspeedf.bind(sprite, -3.5, 0));

        sprite.ai[4].push(moveuntil.bind(sprite, -160, 0));
        sprite.ai[4].push(fadein.bind(sprite, -0.02, 1));

        sprite.ai[5].push(autodestroy.bind(sprite));


    }

    if (type=='shot')
    {
        var sprite = new PIXI.Sprite(tShot);

        squarex=10;
        squarey=40;

        sprite.ai = [[]];
        sprite.ai[0].push(movef.bind(sprite));
        //sprite.ai[0].push(accf.bind(sprite));
        sprite.ai[0].push(shothitf.bind(sprite));
        sprite.ai[0].push(offborderf.bind(sprite, 20));

        layer='sprite';
    }

    else if (type=='e_sunflower') {
        var sprite = new PIXI.Sprite(tSunflower);

        sprite.filters=[ 
            get.outline(),
            get.glowsingle({color: 0xDDAA33}),
            get.shadow(),
            
        ];
        sprite.filters[1].offset={x: -100, y:-100};
        sprite.filters[1].blur=5;

        squarex=160;
        squarey=160;

        light=0.7;
        red=0.7;
        blue=0.7;
        green=1;

        accY=-0.11;
        z=1;
        sprite.score=10;

        col=false;

        phase=1;
        sprite.ai = [[], [], [], [], []];

        sprite.ai[0].push(ai.glowbeat.bind(sprite, sprite.filters[1], 1, 1, 4));
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(zset.bind(sprite));
        sprite.ai[0].push(lightset.bind(sprite));
        sprite.ai[0].push(ai.shadow.bind(sprite, sprite.filters[2], 2));

        sprite.ai[1].push(waitf.bind(sprite, 60));

        sprite.ai[2].push(accf.bind(sprite));
        sprite.ai[2].push(waitf.bind(sprite, 160));


        sprite.ai[3].push(zoomf.bind(sprite, -0.01));
        sprite.ai[3].push(lightf.bind(sprite, 0.01, 1.5));

        sprite.ai[3].push(accchangef.bind(sprite, 0, 0.05));
        sprite.ai[3].push(accf.bind(sprite));

        sprite.ai[4].push(accchangef.bind(sprite, 0, 0.05));
        sprite.ai[4].push(accf.bind(sprite));

        sprite.ai[4].push(countf.bind(sprite));

        sprite.ai[4].push(patternfn.bind(sprite, {
            speed: 4, 
            beatlayer: 4, 
            type: 'grain', 
            aim: 2, 
            steps: 7,
            offsetchange: 2*pi
        })); //[50, 100, 100, 200, 3, false]
        sprite.ai[0].push(rotatef.bind(sprite, 0.01));
        
        sprite.angle=[directionh(x, y)];
        counter[0]=[300, 80, 10, 295, 0, 0];

        sprite.ai[4].push(function(){
            if (this.speedY>2){
                this.col='none';
                this.z+=0.003;
                this.red-=0.002;
                this.blue-=0.002;
            }
        }.bind(sprite));

        sprite.ai[4].push(offborderf.bind(sprite));
        sprite.ai[4].push(dief.bind(sprite, 5));
        sprite.ai[4].push(hitf.bind(sprite));

        health=5;

        collision='enemy';
    }

    else if (type=='e_hawkbit') {

        var sprite = new PIXI.spine.Spine(tex.hawkbit);
        sprite.state.addAnimation(0, 'animation', true, 0);

        sprite.filters=[
            get.outline(),
            get.glowsingle({color: 0xFFFF00}),
            get.shadow(),
        ];
        sprite.filters[1].offset={x: -100, y:-100};
        sprite.filters[1].blur=5;

        //tex.hawkbit
        squarex=80;
        squarey=80;

        light=0.7;
        red=0.7;
        blue=0.7;
        green=1;

        accY=-0.11;
        z=1;

        col=false;

        phase=1;
        sprite.ai = [[], [], [], [], []];

        //filter ai
        sprite.ai[0].push(ai.glowbeat.bind(sprite, sprite.filters[1], 2, 0.5, 2));
        sprite.ai[0].push(ai.shadow.bind(sprite, sprite.filters[2], 4));

        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(zset.bind(sprite));
        sprite.ai[0].push(lightset.bind(sprite));
        

        sprite.ai[1].push(waitf.bind(sprite, 60));

        sprite.ai[2].push(accf.bind(sprite));
        sprite.ai[2].push(waitf.bind(sprite, 160));


        sprite.ai[3].push(zoomf.bind(sprite, -0.01));
        sprite.ai[3].push(lightf.bind(sprite, 0.01, 1.5));

        sprite.ai[3].push(accchangef.bind(sprite, 0, 0.05));
        sprite.ai[3].push(accf.bind(sprite));

        sprite.angle=[directionh(x, y)];
        counter[0]=[300, 50, 50, 250, 0, 0];

        sprite.ai[4].push(accchangef.bind(sprite, 0, 0.05));
        sprite.ai[4].push(accf.bind(sprite));

        sprite.ai[4].push(countf.bind(sprite));
        sprite.ai[4].push(function(){
            if (this.speedY>2){
                this.col='none';
                this.z+=0.003;
                this.red-=0.002;
                this.blue-=0.002;
            }
        }.bind(sprite));
        //sprite.ai[4].push(patternfn.bind(sprite, {speed: 3, beatlayer: 2, type: 'grain', steps: 2, speedgain: 1, speedmulti: 6, offsetchange: 0.1, acc: [0, 0, 0, 0]})); //[50, 100, 100, 200, 3, false]

        sprite.ai[4].push(patternfn.bind(sprite, {
            speed: 3, 
            beatlayer: 2, 
            type: 'grain', 
            steps: 1, 
            speedgain: 0.5, 
            speedmulti: 5, 
            offsetchange: 0.03, 
            acc: false})); //[50, 100, 100, 200, 3, false]

        sprite.ai[4].push(offborderf.bind(sprite));
        sprite.ai[4].push(dief.bind(sprite, 7));
        sprite.ai[4].push(hitf.bind(sprite));
        sprite.floatcounter=0.6;
        sprite.ai[4].push(ai.float2.bind(sprite, 0.003, 50));
        sprite.score=5;
        health=12;

        collision='enemy';
    }

    else if (type=='e_ghostcircle') {

        if (options.white){
            var sprite = new PIXI.spine.Spine(tex.ghostw2);
            var beatlayer=1;
            var explosion='citycloud';
            var glowfilter=get.glowsingle({color: 0xAAAAFF});
        }
        else{
            var sprite = new PIXI.spine.Spine(tex.ghostb2);
            var beatlayer=2;
            var explosion='zeppelin';
            var glowfilter=get.glowsingle({color: 0xAA4444});
        }
        //var sprite = new PIXI.Sprite(tex.ghostb2);

        sprite.angle=[directionh(x, y)];
        sprite.state.addAnimation(0, 'animation', true, 0);

        sprite.filters=[
            glowfilter,
        ];
       

        sprite.ai = [[], [], [], [], []];
        sprite.alpha=0;
        phase=1;

        sprite.ai[0].push(ai.glowbeat.bind(sprite, sprite.filters[0], beatlayer, 1, 3));
        //sprite.ai[1].push(fadein.bind(sprite, 0.01, 1, true));
        sprite.ai[1].push(function () {
            this.scale.x/=1.01;
            this.scale.y/=1.01;
            this.alpha=(1.2/(this.scale.x))-0.25;
            if (this.scale.x<1.1){
                this.phase++;
            }
        }.bind(sprite));

        sprite.ai[2].push(waitf.bind(sprite, 120+60*difficulty.enemy));
        sprite.ai[3].push(fadein.bind(sprite, -0.01, 1, true));
        sprite.ai[4].push(function () {
            this.delete = true;
        }.bind(sprite));
        sprite.floatcounter=-1;
        sprite.ai[2].push(ai.float.bind(sprite, 0.05, 100));

        counter=[[60, 60, 60, 55, 0, 0]];
        sprite.ai[0].push(hitf.bind(sprite));
        sprite.ai[0].push(countf.bind(sprite));
        sprite.ai[0].push(dief.bind(sprite, explosion));

        sprite.ai[2].push(patternfn.bind(sprite, {
            counter: 0,
            speed: 5, 
            beatlayer: beatlayer, 
            type: 'whitecluster', 
            steps: 10, 
            speedgain: 0.2+difficulty.bullets*0.2, 
            speedmulti: 0, 
            offsetchange: 1, 
            acc: false}));

        sprite.score=5;
        health=12;
        collision='enemy';

        sprite.scale.x=5;
        sprite.scale.y=5;
    }

    else if (type=='e_dragonfly') {

        var sprite = new PIXI.spine.Spine(options.texture || tex.dragonfly);
        sprite.state.addAnimation(0, 'animation', true, 0);

        sprite.filters=[
            get.outline(),
            get.shadow(),
        ];
sprite.filters[1].blur=5;

        squarex=200;
        squarey=30;
        health=40;
        col=false;
        phase =1;
        light=0.5;
        z=1;

        accY=0.02;
        sprite.score=20;

        sprite.ai = [[], [], [], [], []];


        //sprite.ai[0].push(ai.glowbeat.bind(sprite, sprite.filters[2], 1, 0.5, 2));
        sprite.ai[0].push(ai.shadow.bind(sprite, sprite.filters[1]));
        
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(offborderf.bind(sprite));
        sprite.ai[0].push(zset.bind(sprite));
        

        sprite.floatcounter=0;
        sprite.ai[3].push(ai.float.bind(sprite, 0.02, 30));
        sprite.ai[4].push(ai.float.bind(sprite, 0.02, 30));

        sprite.ai[1].push(waitf.bind(sprite, 300));

        sprite.ai[2].push(lightf.bind(sprite, 0.004));
        sprite.ai[0].push(lightset.bind(sprite));
        sprite.ai[2].push(zoomf.bind(sprite, -0.008));

        sprite.ai[3].push(accchangef.bind(sprite, 0, 0.013));
        sprite.ai[3].push(accf.bind(sprite));
        sprite.ai[3].push(phasechangef.bind(sprite, 0, 'speedy', true, 'enemy'));
        sprite.ai[3].push(hitf.bind(sprite));
        counter[0]=[50, 10000, 8, 0, 0, 0];

        sprite.ai[4].push(speedchangef.bind(sprite, misc1, misc2));
        sprite.ai[4].push(countf.bind(sprite));

            sprite.ai[4].push(patternfn.bind(sprite, {
                positionx: [-0], 
                positiony: [100], 
                offset: 1.57, 
                speed: 8+2*difficulty.bullets, 
                beatlayer: options.beatlayer || 1, 
                type: 'stick', 
                aim: 2
            })); //[50, 100, 100, 200, 3, false]
        



        counter[1]=[50, 100, 10, 0, 0, 0];


        sprite.ai[4].push(offborderf.bind(sprite));
        if (options.texture){
            sprite.ai[4].push(dief.bind(sprite, 'zeppelin'));
        }
        else{
            sprite.ai[0].push(ai.outlinebeat.bind(sprite, sprite.filters[0], [{beat: 1, color: {x: 0, y: 255, z:255}}]));
            sprite.ai[4].push(dief.bind(sprite, 1));
        }
        sprite.ai[4].push(hitf.bind(sprite));

        

        //collision='none';
    }



    else if (type=='e_fly'){

        var sprite = new PIXI.spine.Spine(tex.hornet);

        squarex=40;
        squarey=40;

        accY=0.002;


        sprite.ai = [[]];
        if (nobullets){
            sprite.passed=0;
            sprite.ai[0].push(ai.ziskadestroy.bind(sprite, 300));
        }
        
        sprite.animation = sprite.state.addAnimation(0, 'animation', true, 0);
        sprite.animation.timeScale=0; //stop animation, sets speed to animation 0=0%, 1=100%, use to make animation synchron
                
        sprite.filters=[
            get.outline(),
            get.shadow(),
        ];
        sprite.ai[0].push(ai.shadow.bind(sprite, sprite.filters[1]));
        if (options.beatlayer==1){
            sprite.ai[0].push(ai.outlinebeat.bind(sprite, sprite.filters[0], [{beat: 1, color: {x: 255, y: 255, z:0}}]));
        }
        else{
            sprite.ai[0].push(ai.outlinebeat.bind(sprite, sprite.filters[0], [{beat: 2, color: {x: 255, y: 0, z:0}}]));
        }
        
        

        
        //sprite.ai[0].push(movef.bind(sprite));
        //sprite.ai[0].push(accf.bind(sprite));
        sprite.ai[0].push(moveanglef.bind(sprite, 3+difficulty.enemy));
        rotation=1.57;
        
        
        //sprite.ai[0].push(aim2hero.bind(sprite, 0.008));

        /*sprite2.animation = sprite2.state.addAnimation(0, 'turn', true, 0);
                sprite2.animation.timeScale=0; //stop animation, sets speed to animation 0=0%, 1=100%, use to make animation synchron
             */   

                sprite.angle=[directionh(x, y)];
                sprite.anglespeed=0.0;
                sprite.ai[0].push(function(){
                    var direction=directionh(this.x, this.y);
                    if (this.rotation>pi)
                    {
                        this.rotation-=2*pi;
                    }
                    else if (this.rotation<-pi)
                    {
                        this.rotation+=2*pi;
                    }
                
                    if (this.rotation>direction) {
                        if (this.rotation-direction>pi)
                        {
                            this.anglespeed+=0.0001+0.0002*difficulty.enemy;
                        }
                        else
                        {
                            this.anglespeed-=0.0001+0.0002*difficulty.enemy;
                        }
                    }
                    else
                    {
                        if (direction-this.rotation>pi)
                        {
                            this.anglespeed-=0.0001+0.0002*difficulty.enemy;
                        }
                        else
                        {
                            this.anglespeed+=0.0001+0.0002*difficulty.enemy;
                        }
                    }
                    if (this.anglespeed<-0.01){
                        this.anglespeed=-0.01;
                    }
                    else if (this.anglespeed>0.01){
                        this.anglespeed=+0.01;
                    }
                    this.rotation+=this.anglespeed;
                    this.state.tracks[0].trackTime=0.333-(this.anglespeed*33);
                }.bind(sprite));
                

    

                sprite.ai[0].push(function () {
                    
                    
                    create(0, 'picture', this.x-Math.sin(this.rotation+pi/2+Math.random()*0.4-0.2)*80, this.y+Math.cos(this.rotation+pi/2+Math.random()*0.4-0.2)*80, {
                    tint: rgbToHex(
                        Math.random()*100+100,
                        100,
                        100
                    ),
                    accY: 0.2, 
                    layer: 'backlayer', 
                    speedX: -Math.sin(this.rotation+pi/2+Math.random()*0.4-0.2)*7, 
                    speedY: Math.cos(this.rotation+pi/2+Math.random()*0.4-0.2)*7, 
                    subtype: tParticle02, 
                    alpha: 0.4,
                    misc1:2, misc2:2, misc3:8, misc4: 1, misc5: 1});
                     }.bind(sprite));

        sprite.ai[0].push(countf.bind(sprite));
        counter[0]=[10, 10, 10, 0, 0, 0];
        sprite.ai[0].push(patternfn.bind(sprite, {
            speed: 1, 
            offset: 0,
            beatlayer: options.beatlayer || 4,
            type: options.bullet || 'bullet', 
            aim: 1, 
        })); //[50, 100, 100, 200, 3, false]

        sprite.score=5;
        //sprite.ai[0].push(offborderf.bind(sprite));
        sprite.ai[0].push(dief.bind(sprite, 'fa18'));
        sprite.ai[0].push(hitf.bind(sprite));

        health=40+20*difficulty.enemy;

        collision='enemy';
        //layer='front';
    }

    else if (type=='e_fly2'){

        //var sprite = new PIXI.Sprite(tFly2);
        var sprite = new PIXI.spine.Spine(tex.fly);
        sprite.state.addAnimation(0, 'animation', true, 0);

        sprite.filters=[
            get.outline(),
            get.shadow(),
        ];
        sprite.filters[1].offset={x: -100, y:-100};
        sprite.filters[1].blur=5;

        phase=1;
        squarex=80;
        squarey=80;

        rotation=misc4;
        sprite.angle=[directionh(x, y)];

        sprite.ai = [[], [], [], []];
        sprite.score=5;

        //filter ai
        sprite.ai[0].push(ai.outlinebeat.bind(sprite, sprite.filters[0], [{beat: 2, color: {x: 255, y: 0, z:255}}]));
        sprite.ai[0].push(ai.shadow.bind(sprite, sprite.filters[1]));

        
        //sprite.ai[0].push(ai.glowbeat.bind(sprite, sprite.filters[1], 3, 0.5, 2));

        //misc1: duration of 1st phase
        //misc2: duration of rotation
        //misc3: speed of rotation
        sprite.ai[1].push(waitf.bind(sprite, misc1/(Math.sqrt(difficulty.enemy))));

        sprite.ai[2].push(rotationchangef.bind(sprite, misc3));
        sprite.ai[2].push(waitf.bind(sprite, misc2));

        sprite.ai[0].push(moveanglef.bind(sprite, 4+2*difficulty.enemy));
        sprite.floatcounter=0;
        //sprite.ai[0].push(ai.float2.bind(sprite, 0.01, 10));

        counter[0]=[300, 60, 6, 200, 0, 0];
        if (!options.nobullets){
            sprite.ai[0].push(countf.bind(sprite));
            sprite.ai[0].push(patternfn.bind(sprite, {
                speed: 1.5+1.5*difficulty.bullets, 
                beatlayer: 3, 
                type: 'bullet'
            })); //[50, 100, 100, 200, 3, false]
        }

        sprite.ai[0].push(offborderf.bind(sprite, 100));
        sprite.ai[0].push(dief.bind(sprite, 8));
        sprite.ai[0].push(hitf.bind(sprite));

        

        health=12;

        collision='enemy';
        layer='front';
    }

    else if (type=='balloon') {

        

        if (beatlayer==3)
        {
            var sprite = new PIXI.Sprite(tBalloon2);
        }
        else if (beatlayer==4)
        {
            var sprite = new PIXI.Sprite(tBalloon2);
        }
        else{
            var sprite = new PIXI.Sprite(tBalloon1);
        }

        sprite.filters=[
            get.outline(),
            get.shadow(),
        ];



        sprite.score=5;
        
        squarex=80;
        squarey=80;

        col=true;

        phase=1;
        sprite.ai = [[], [], [], [], []];

        if (beatlayer==3 || beatlayer == 4)
        {
            sprite.ai[0].push(ai.outlinebeat.bind(sprite, sprite.filters[0], [{beat: 4, color: {x: 255, y: 255, z:0}}, {beat: 3, color: {x: 255, y: 0, z:255}}]));
        }
        else
        {
            sprite.ai[0].push(ai.outlinebeat.bind(sprite, sprite.filters[0], [{beat: 2, color: {x: 0, y: 255, z:255}}]));
        }
        sprite.ai[0].push(ai.shadow.bind(sprite, sprite.filters[1]));
        sprite.ai[0].push(movef.bind(sprite));

        sprite.ai[0].push(countf.bind(sprite));
        sprite.floatcounter=0;
        sprite.ai[0].push(ai.float2.bind(sprite, 0.001, 50));

        sprite.ai[0].push(offborderf.bind(sprite));
        sprite.ai[0].push(dief.bind(sprite, 'balloon'));
        sprite.ai[0].push(hitf.bind(sprite));

        counter[0]=[0, 50, 10, 0, 0, 0];

        if (beatlayer==2){
            sprite.ai[0].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'bbullet', beatlayer: beatlayer}, [
                [1, [
                    {fx: 'xyset', key: ['speed'], x:6+2*difficulty.bullets, y:0},
                    {fx: 'xyset', key: ['position'], x:-8, y:100},
                    ]
                ],
            ]));
    
            sprite.ai[0].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'bbullet', beatlayer: beatlayer}, [
                [1, [
                    {fx: 'xyset', key: ['speed'], x:-6-2*difficulty.bullets, y:0},
                    {fx: 'xyset', key: ['position'], x:8, y:100},
                    ]
                ],
            ]));
        }
        else{
            sprite.ai[0].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'bbullet', beatlayer: 3}, [
                [1, [
                    {fx: 'xyset', key: ['speed'], x:6+2*difficulty.bullets, y:0},
                    {fx: 'xyset', key: ['position'], x:-8, y:100},
                    ]
                ],
            ]));
    
            sprite.ai[0].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'bbullet', beatlayer: 4}, [
                [1, [
                    {fx: 'xyset', key: ['speed'], x:-6-2*difficulty.bullets, y:0},
                    {fx: 'xyset', key: ['position'], x:8, y:100},
                    ]
                ],
            ]));
        }
        

        health=20;

        collision='enemy';
    }

    else if (type=='spacefighter') {

        var sprite = new PIXI.Sprite(tSpacefighter);

        sprite.score=20;
        squarex=80;
        squarey=80;

        col=true;

        phase=1;
        sprite.ai = [[], [], [], [], []];


        sprite.ai[0].push(movef.bind(sprite));

        sprite.ai[0].push(countf.bind(sprite));

        sprite.ai[0].push(offborderf.bind(sprite));
        sprite.ai[0].push(dief.bind(sprite, -3));
        sprite.ai[0].push(hitf.bind(sprite));
        sprite.ai[0].push(rotatef.bind(sprite, 0.005));

        counter[0]=[0, 50, 8, 0, 0, 0];
        sprite.ai[0].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'bbullet', beatlayer: beatlayer}, [
            [1, [
                {fx: 'rotationset', key: ['angle']},
                {fx: 'xyrelative', key: ['position'], speed: 150},
                {fx: 'xyrelative', key: ['speed'], speed: 5}
                ]
            ],
        ]));
        sprite.ai[0].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'bbullet', beatlayer: beatlayer}, [
            [1, [
                {fx: 'rotationset', key: ['angle']},
                {fx: 'xyrelative', key: ['position'], speed: -150},
                {fx: 'xyrelative', key: ['speed'], speed: -5}
                ]
            ],
        ]));

        health=100;

        collision='enemy';
    }

    else if (type=='rocket'){
        var sprite = new PIXI.Sprite(tex.meteor);

        sprite.heightmap =setsprite(
            new PIXI.Sprite(tex.meteor_h),
            {anchor: {x:0.5, y:0.5}, active: active, x: x, y: y});
        sprite.heightmap.speedX =options.speedX || 0;
        sprite.heightmap.speedY =options.speedY || 0;

        sprite.filters=[
            get.outline({color: 0xFFFFAA}),
            new PIXI.DisplacementFilter(sprite.heightmap),
            
        ];

        
        squarex=80;
        squarey=80;

        rotation=options.rotation || pi;
        sprite.heightmap.rotation=options.rotation || pi;
        col=true;
        health=150;

        sprite.ai = [[], [], [], [], []];
        sprite.ai[0].push(function () {
            this.filters[1].scale.x=Math.sin(this.rotation)*20;
            this.filters[1].scale.y=Math.cos(this.rotation)*20;
        }.bind(sprite));
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(rotatef.bind(sprite, 0.01));
        sprite.heightmap.ai[0].push(movef.bind(sprite.heightmap));
        sprite.heightmap.ai[0].push(rotatef.bind(sprite.heightmap, 0.01));

        counter[0]=[0, 50, 2, 0, 0, 0];
        sprite.ai[0].push(countf.bind(sprite));
        sprite.ai[0].push(offborderf.bind(sprite));
        sprite.heightmap.ai[0].push(offborderf.bind(sprite.heightmap));
        if (beatlayer>0){
            sprite.ai[0].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'bbullet', beatlayer: beatlayer}, [
                [1, [
                    {fx: 'xy2hero', key: ['speed'], speedx: 3, speedy:0}
                    ]
                ],
            ]));
        }
        collision='enemy';
    }

    else if (type=='plane'){
        var sprite = new PIXI.spine.Spine(tex.plane);
        //var shotspeedX = options.shotspeedX || 1;
        sprite.animation=sprite.state.addAnimation(0, 'animation', true, 0);
        //this.state.tracks[0].trackTime=0.333-(this.anglespeed*33);
        sprite.animation.timeScale=0; //stop animation, sets speed to animation 0=0%, 1=100%, use to make animation synchron
                
        squarex=80;
        squarey=80;

        rotation=pi;
        col=true;

        sprite.filters=[
            get.outline(),
            get.shadow(),
        ];

        sprite.ai = [[], [], [], [], []];
        sprite.ai[0].push(ai.shadow.bind(sprite, sprite.filters[1]));
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(function(){
            if (herox<this.x && this.speedX>-1-difficulty.enemy){
                this.speedX-=0.1
            }
            if (herox>this.x && this.speedX<1+difficulty.enemy){
                this.speedX+=0.1
            }
            this.state.tracks[0].trackTime=0.333-(this.speedX/((1+difficulty.enemy)*3.3));
        }.bind(sprite));
        health=150;
    
        collision='enemy';

    }

    else if (type=='satelite') {

        //var sprite = new PIXI.Sprite(tSatelite);
        var sprite = new PIXI.spine.Spine(tex.satelite);
        sprite.state.addAnimation(0, 'animation', true, 0);
        sprite.scale.x=1.2;
        sprite.scale.y=1.2;
        if (!options.noheart){
            sprite.score=20;
        }
        else{
            sprite.score=5;
        }

        squarex=220;
        squarey=50;

        col=true;

        phase=1;
        sprite.ai = [[], [], [], [], []];

        sprite.filters=[
            get.outline(),
            get.shadow(),
        ];
        if (beatlayer>2){
            sprite.ai[0].push(ai.outlinebeat.bind(sprite, sprite.filters[0], [{beat: 4, color: {x: 255, y: 255, z:0}}, {beat: 3, color: {x: 255, y: 0, z:255}}]));
        }
        else{
            sprite.ai[0].push(ai.outlinebeat.bind(sprite, sprite.filters[0], [{beat: 2, color: {x: 0, y: 255, z:255}}]));
        }

        sprite.ai[0].push(ai.shadow.bind(sprite, sprite.filters[1]));
        sprite.ai[0].push(movef.bind(sprite));
        sprite.floatcounter=0.5;
        sprite.ai[0].push(ai.float2.bind(sprite, 0.003, 60));

        sprite.ai[0].push(countf.bind(sprite));

        sprite.ai[0].push(offborderf.bind(sprite));
        sprite.ai[0].push(dief.bind(sprite, 'heavybass'));
        sprite.ai[0].push(hitf.bind(sprite));

        counter[0]=[0, 50, 10, 0, 0, 0];

        if (beatlayer>2){

            sprite.ai[0].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'stick', beatlayer: 3}, [
                [1, [
                    {fx: 'xyset', key: ['speed'], x:0, y:6+2*difficulty.bullets}
                    ,{fx: 'xyset', key: ['position'], x: -180, y:0}
                    ]
                ],
            ]));
    
            sprite.ai[0].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'stick', beatlayer: 4}, [
                [1, [
                    {fx: 'xyset', key: ['speed'], x:0, y:6+2*difficulty.bullets}
                    ,{fx: 'xyset', key: ['position'], x: 180, y:0}
                    ]
                ],
            ]));

        }
        
        else{
            sprite.ai[0].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'stick', beatlayer: beatlayer}, [
            [1, [
                {fx: 'xyset', key: ['speed'], x:0, y:6+2*difficulty.bullets}
                ,{fx: 'xyset', key: ['position'], x: -180, y:0}
                ]
            ],
        ]));

        sprite.ai[0].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'stick', beatlayer: beatlayer}, [
            [1, [
                {fx: 'xyset', key: ['speed'], x:0, y:6+2*difficulty.bullets}
                ,{fx: 'xyset', key: ['position'], x: 180, y:0}
                ]
            ],
        ]));

    }

        /*sprite.ai[0].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'bbullet', beatlayer: beatlayer}, [
            [1, [
                {fx: 'xyrelative', key: ['speed'], speed: -5}
                ]
            ],
        ]));*/

        health=50;

        collision='enemy';
    }

    
    else if (type=='bullet')
    {
        if (subtype=='grain'){
            if (beatlayer==1)
            {
                var sprite = new PIXI.Sprite(tGrain01);
                sprite.excolor={x: 255, y:150, z:0};
            }
            else if (beatlayer==2)
            {
                var sprite = new PIXI.Sprite(tGrain02);
                sprite.excolor={x: 255, y:255, z:0};
            }
            else if (beatlayer==3)
            {
                var sprite = new PIXI.Sprite(tGrain03);
                sprite.excolor={x: 200, y:150, z:0};
            }
            else if (beatlayer==4)
            {
                var sprite = new PIXI.Sprite(tGrain04);
                sprite.excolor={x: 255, y:150, z:80};
            }
            else
            {
                var sprite = new PIXI.Sprite(tGrainWhite);
                sprite.excolor={x: 0, y:255, z:255};
            }
        }
        else if (subtype=='stick')
        {
            if (beatlayer==1)
            {
                var sprite = new PIXI.Sprite(tStick01);
                sprite.excolor={x: 0, y:255, z:255};
                
            }
            else if (beatlayer==2)
            {
                var sprite = new PIXI.Sprite(tStick02);
                sprite.excolor={x: 0, y:255, z:255};
            }
            else if (beatlayer==3)
            {
                var sprite = new PIXI.Sprite(tStick03);
                sprite.excolor={x: 255, y:0, z:255};
            }
            else if (beatlayer==4)
            {
                if (stagecount!==3){
                    var sprite = new PIXI.Sprite(tStick04);
                    sprite.excolor={x: 255, y:255, z:0};
                }
                else{
                    var sprite = new PIXI.Sprite(tStick05);
                    sprite.excolor={x: 0, y:255, z:0};
                }
            }
            else
            {
                var sprite = new PIXI.Sprite(tStickWhite);
                sprite.excolor={x: 255, y:255, z:255};
            }
        }
        else if (subtype=='stripes'){
                var sprite = new PIXI.Sprite(tex.stripes);
                sprite.excolor={x: 255, y:0, z:0};
        }
        else if (subtype=='stars'){
            var sprite = new PIXI.Sprite(tex.stars);
            sprite.excolor={x: 255, y:255, z:255};
    }
        else if (subtype=='whitecluster') //misc
        {
            if (beatlayer==1)
            {
                var sprite = new PIXI.Sprite(tWhitecluster01);
                sprite.excolor={x: 150, y:150, z:255};
            }
            else if (beatlayer==2)
            {
                var sprite = new PIXI.Sprite(tWhitecluster02);
                sprite.excolor={x: 255, y:150, z:150};
            }
            else if (beatlayer==3)//
            {
                var sprite = new PIXI.Sprite(tex.stars);
                sprite.excolor={x: 255, y:255, z:255};
            }
            else if (beatlayer==4) 
            {
                var sprite = new PIXI.Sprite(tWhitecluster04);
                sprite.excolor={x: 255, y:255, z:255};
            }
            else
            {
                var sprite = new PIXI.Sprite(tWhiteclusterWhite);
                sprite.excolor={x: 255, y:255, z:255};
            }
        }
        else if (subtype=='bbullet')
        {
            if (beatlayer==1)
            {
                var sprite = new PIXI.Sprite(tBbullet01);
                sprite.excolor={x: 255, y: 0, z:0};
            }
            else if (beatlayer==2)
            {
                var sprite = new PIXI.Sprite(tBbullet02);
                sprite.excolor={x: 0, y: 255, z:255};
            }
            else if (beatlayer==3)
            {
                var sprite = new PIXI.Sprite(tBbullet03);
                sprite.excolor={x: 255, y: 0, z:255};
            }
            else if (beatlayer==4)
            {
                var sprite = new PIXI.Sprite(tBbullet04);
                sprite.excolor={x: 255, y: 150, z:0};
            }
            else
            {
                var sprite = new PIXI.Sprite(tBbulletWhite);
            }
        }
        else if (subtype=='cluster')
        {
            if (beatlayer==1)
            {
                var sprite = new PIXI.Sprite(tex.cluster1);
                sprite.excolor={x: 255, y: 0, z:0};
            }
            else if (beatlayer==2)
            {
                var sprite = new PIXI.Sprite(tex.cluster2);
                sprite.excolor={x: 255, y: 150, z:0};
            }
            else if (beatlayer==3)
            {
                var sprite = new PIXI.Sprite(tex.cluster3);
                sprite.excolor={x: 255, y: 255, z:0};
            }
            else if (beatlayer==4)
            {
                var sprite = new PIXI.Sprite(tex.cluster4);
                sprite.excolor={x: 0, y: 255, z:0};
            }
            else if (beatlayer==5)
            {
                var sprite = new PIXI.Sprite(tex.cluster5);
                sprite.excolor={x: 0, y: 255, z:255};
            }
            else if (beatlayer==6)
            {
                var sprite = new PIXI.Sprite(tex.cluster6);
                sprite.excolor={x: 0, y: 0, z:255};
            }
            else if (beatlayer==7)
            {
                var sprite = new PIXI.Sprite(tex.cluster7);
                sprite.excolor={x: 150, y: 0, z:255};
            }
            else if (beatlayer==8)
            {
                var sprite = new PIXI.Sprite(tex.cluster8);
                sprite.excolor={x: 255, y: 0, z:255};
            }
            else
            {
                var sprite = new PIXI.Sprite(tWhiteclusterWhite);
            }
        }
        else if (subtype=='rain')
        {
            var sprite = new PIXI.Sprite(tex.rain);
            sprite.excolor={x: 0, y: 188, z:255};
        }
        else if (subtype=='electro')
        {
            var sprite = new PIXI.Sprite(tex.electro);
            sprite.excolor={x: 0, y: 188, z:255};
        }
        else if (subtype=='cbullet')
        {
            if (beatlayer==1)
            {
                var sprite = new PIXI.Sprite(tCbullet01);
                sprite.excolor={x: 255, y: 150, z:0};
            }
            else if (beatlayer==2)
            {
                var sprite = new PIXI.Sprite(tCbullet02);
                sprite.excolor={x: 255, y: 0, z:0};
            }
            else if (beatlayer==3)
            {
                var sprite = new PIXI.Sprite(tCbullet03);
                sprite.excolor={x: 0, y: 255, z:0};
            }
            else if (beatlayer==4)
            {
                var sprite = new PIXI.Sprite(tCbullet04);
                sprite.excolor={x: 0, y: 50, z:255};
            }
            else
            {
                var sprite = new PIXI.Sprite(tCbulletWhite);
            }
        }
        else
        {
            if (beatlayer==1)
            {
                var sprite = new PIXI.Sprite(tBullet01);
                sprite.excolor={x: 255, y: 225, z:0};
            }
            else if (beatlayer==2)
            {
                var sprite = new PIXI.Sprite(tBullet02);
                sprite.excolor={x: 255, y: 0, z:0};
            }
            else if (beatlayer==3)
            {
                var sprite = new PIXI.Sprite(tBullet03);
                sprite.excolor={x: 255, y: 0, z:255};
            }
            else if (beatlayer==4)
            {
                var sprite = new PIXI.Sprite(tBullet04);
                sprite.excolor={x: 0, y:255, z:255};
            }
            else
            {
                var sprite = new PIXI.Sprite(tBulletWhite);
                sprite.excolor={x: 255, y:255, z:255};
            }
        }

        //particle effect in direction of speed

        set.bulletcast({x: x, y: y}, Math.atan2(speedY, speedX), {color: sprite.excolor});

        //sprite.buffer=[];
        //sprite.buffer['angle']=Math.atan2(speedX, speedY);
        //sprite.angle=Math.atan2(speedX, speedY);
        //effectf.call(sprite, x, y, 'bullet_cast', {speed: {x:speedX, y: speedY}, color: {x: sprite.excolor.x, y:  sprite.excolor.y, z: sprite.excolor.z}});
        //************** */

        sprite.ai = [[]];

        light=0;
        sprite.scale.x=0;
        sprite.scale.y=0;
        sprite.ai[0].push(function(){
            if (this.light<1){
                if (subtype=='stripes' /* || subtype=='stick' || subtype=='rain'*/){
                    this.light+=0.2;
                    this.scale.x+=0.2;
                    this.scale.y+=0.2;
                }
                else{
                    this.light+=0.1;
                    this.scale.x+=0.1;
                    this.scale.y+=0.1;
                }
            }
            else{
                this.light=1;
                this.scale.x=1;
                this.scale.y=1;
            }
        }.bind(sprite));
        sprite.ai[0].push(ai.pulse.bind(sprite, 0));
        sprite.ai[0].push(lightset.bind(sprite));
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(accf.bind(sprite));
        if (misc1>0){sprite.ai[0].push(maxspeedf.bind(sprite, misc1)); }
        if (subtype!=='stick' && subtype!=='rain' && subtype!=='stripes'){sprite.ai[0].push(rotatef.bind(sprite, 0.1));}
        sprite.ai[0].push(offborderf.bind(sprite));
        sprite.ai[0].push(hitf.bind(sprite));
        sprite.ai[0].push(flash.bind(sprite, beatlayer, subtype));
        sprite.ai[0].push(dief.bind(sprite, 3));
        if (nobullets){del=true;}
        circle=20;
        //ngp** pass option.parent to sprite */
        
        sprite.shotparent=options.parent || false;

        collision='bullet';
        layer='sprite';
        if (subtype=='stripes'){
            layer='behindbacklayer';
        }
    }



    else if (type=='shotflash')
    {
        if (options.deco){
            var sprite = new PIXI.Sprite(tStar);
            sprite.scale.x=2*beat[beatlayer];
            sprite.scale.y=2*beat[beatlayer];
        }
        else {
            var buffer= 1;
            tint=rgbToHex(255*(1-buffer)+options.color.x*buffer || 0, 255*(1-buffer)+options.color.y*buffer || 0, 255*(1-buffer)+options.color.z*buffer || 0);  
            if (subtype=='stick')
            {
                var sprite = new PIXI.Sprite(tStickWhite);
            }
            else if (subtype=='grain')
            {
                var sprite = new PIXI.Sprite(tGrainWhite);
            }
            else if (subtype=='whitecluster' || subtype=='cluster')
            {
                var sprite = new PIXI.Sprite(tWhiteclusterWhite);
            }
            else if (subtype=='bbullet')
            {
                var sprite = new PIXI.Sprite(tBulletWhite);
            }
            else
            {
                var sprite = new PIXI.Sprite(tBulletWhite);
            }
        
            sprite.scale.x=1.8*beat[beatlayer]+0.5;
            sprite.scale.y=1.8*beat[beatlayer]+0.5;
        }
        
        sprite.alpha=beat[beatlayer];
        if (nobullets){sprite.alpha=0;}
        rotation=speedX;

        sprite.ai = [[]];
        del=true;
        layer='particle'
    }

    else if (type=='preflash')
    {
        var buffer= 0.3;
        var buffer2= 100;
        
        
        //sprite.blendMode = options.blendmode || PIXI.BLEND_MODES.ADD;
        
        if (typeof options.kind !== 'undefined'){

            /*

            
            sprite.alpha=0.3;*/

            

            if (options.kind == 'outer'){
                if (subtype=='stick')
            {
                var sprite = new PIXI.Sprite(tex.stickline);
            }
            else if (subtype=='grain')
            {
                var sprite = new PIXI.Sprite(tex.grainline);
            }
            else if (subtype=='whitecluster' || subtype=='cluster')
            {
                var sprite = new PIXI.Sprite(tex.clusterline);
            }
            else if (subtype=='bbullet')
            {
                var sprite = new PIXI.Sprite(tex.bbulletline);
            }
            else if (subtype=='cbullet')
            {
                var sprite = new PIXI.Sprite(tex.cbulletline);
            }
            else
            {
                var sprite = new PIXI.Sprite(tex.bulletline);
            }

                sprite.alpha=Math.pow(prebeat[beatlayer], 1.8);
                sprite.scale.x=8-7.2*prebeat[beatlayer];
                sprite.scale.y=8-7.2*prebeat[beatlayer];
                tint=rgbToHex(options.color.x*buffer+buffer2 || 0, options.color.y*buffer+buffer2 || 0, options.color.z*buffer+buffer2 || 0);  
            }
            else if (options.kind == 'inner')
            {            
                if (subtype=='stick')
                {
                    var sprite = new PIXI.Sprite(tStickWhite);
                }
                else if (subtype=='grain')
                {
                    var sprite = new PIXI.Sprite(tGrainWhite);
                }
                else if (subtype=='whitecluster' || subtype=='cluster')
                {
                    var sprite = new PIXI.Sprite(tWhiteclusterWhite);
                }
                else if (subtype=='bbullet')
                {
                    var sprite = new PIXI.Sprite(tBulletWhite);
                }
                else
                {
                    var sprite = new PIXI.Sprite(tBulletWhite);
                }

                //tint=rgbToHex(options.color.x*buffer+buffer2 || 0, options.color.y*buffer+buffer2 || 0, options.color.z*buffer+buffer2 || 0);  
                tint=rgbToHex(0,0,0);  
                
                sprite.scale.x=prebeat[beatlayer]*1.1;
                sprite.scale.y=prebeat[beatlayer]*1.1;
                sprite.alpha=0.3*prebeat[beatlayer];
            }
            

            
            //tint=rgbToHex(30, 30, 30); 
            //tint=rgbToHex((255-options.color.x)*buffer+buffer2 || 0, (255-options.color.y)*buffer+buffer2 || 0, (255-options.color.z)*buffer+buffer2 || 0);  
            
            //sprite.alpha=prebeat[beatlayer];
            //tint=rgbToHex(options.color.x*buffer+buffer2 || 0, options.color.y*buffer+buffer2 || 0, options.color.z*buffer+buffer2 || 0);  
             

        }
        else{

            if (subtype=='stick')
            {
                var sprite = new PIXI.Sprite(tex.stickline);
            }
            else if (subtype=='grain')
            {
                var sprite = new PIXI.Sprite(tex.grainline);
            }
            else if (subtype=='whitecluster' || subtype=='cluster')
            {
                var sprite = new PIXI.Sprite(tex.clusterline);
            }
            else if (subtype=='bbullet')
            {
                var sprite = new PIXI.Sprite(tex.bbulletline);
            }
            else if (subtype=='cbullet')
            {
                var sprite = new PIXI.Sprite(tex.cbulletline);
            }
            else
            {
                var sprite = new PIXI.Sprite(tex.bulletline);
            }
            sprite.alpha=beat[beatlayer];
            sprite.scale.x=2.2*beat[beatlayer];
            sprite.scale.y=2.2*beat[beatlayer];
        }

        
        if (nobullets){sprite.alpha=0;}
        
        rotation=speedX;

        sprite.ai = [[]];
        del=true;
        layer='particle'
    }


    /*else if (type=='sword')
    {
        var sprite = new PIXI.Sprite();

        squarex=1;
        squarey=20;
        sprite.ai = [[]];
        sprite.ai[0].push(swordhitf.bind(sprite));
        del=true;

        collision='sword';
    }*/

    else{
        //sprite = window["sprite_"+type](x, y, options);
    }


    sprite.x = x;
    sprite.y = y;
    sprite.z = z;
    sprite.speedX = speedX;
    sprite.speedY =  speedY;
    sprite.accX = accX;
    sprite.accY =  accY;

    sprite.squarex=squarex;
    sprite.squarey=squarey;
    sprite.circle=circle;
    fn.sethealth.call(sprite, health);
    sprite.hit=hit;
    sprite.rotation=rotation;
    sprite.collision=collision;
    sprite.phase=phase;
    sprite.beatlayer=beatlayer;
    sprite.counter=counter;
    sprite.subtype=subtype;

    sprite.c1=c1;
    sprite.c2=c2;
    sprite.c3=c3;
    sprite.counter=counter;
    sprite.tint=tint;
    sprite.light=light;
    sprite.red=red;
    sprite.green=green;
    sprite.blue=blue;
    sprite.col=col;
    sprite.active=active;
    sprite.offsetX=offsetX;
    sprite.offsetY=offsetY;
    sprite.excolor=sprite.excolor || excolor;
    sprite.shotangle=[];
    sprite.buffer=[];
    if (active>0){sprite.visible=false;}

    if (layer!='background' && layer!='behindbackground' && layer!='backfront'){
        sprite.anchor={x:0.5, y: 0.5};
    }

    sprite.delete=del;
    
    sprites.push(sprite);
    if (!(del && type=='bullet')){
        if (layer=='background'){
            background.addChild(sprite);
        }
        else if (layer=='behindbackground')
        {
            background.addChildAt(sprite, 0);
        }
        else if (layer=='backlayer')
        {
            backlayer.addChild(sprite);
        }
        else if (layer=='particle')
        {
            particlelayer.addChild(sprite);
        }
        else if (layer=='sprite')
        {
            container.addChild(sprite);
        }
        else if (layer=='front')
        {
            frontlayer.addChild(sprite);
        }
        else if (layer=='backfront')
        {
        frontlayer.addChildAt(sprite, 0);
        }
        else
        {
            container.addChildAt(sprite, 0);
        }
    }
}


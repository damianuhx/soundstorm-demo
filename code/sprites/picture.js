
//title screen
function cpicturetitle(subtype)
{
    var sprite=setsprite(
        new PIXI.Sprite(subtype),
    {anchor: false, active: 0, x: 0, y: -0, speedX:0, speedY:0, accX:0, accY:0.1});

    sprite.alpha=0;

    sprite.ai = [[]];

    
    sprite.ai[0].push(function () {
        if (this.accY>=0 && this.position.y > -50){
            this.accY=-0.01;
        }
        if (this.accY<=0 && this.position.y < -1500){
            this.accY=0.01;
        }
    }.bind(sprite));

    sprite.ai[0].push(movef.bind(sprite));
    sprite.ai[0].push(accf.bind(sprite, 1));
    sprite.ai[0].push(fadein.bind(sprite, 0.01));

    backlayer.addChild(sprite);
}

set.menupic=function(texture, x, y, thisscene, options={}){
    if (typeof texture === 'string' || texture instanceof String){
        var sprite=setsprite(

            new PIXI.BitmapText(texture, { 
                    fontName: options.font || 'solid',
                    anchor: (0.5,0.5),
                    textAlign: 'center',
                    fontSize: options.fontsize || 80,
                    //letterSpacing: 25
                }),
            {anchor: true, active: 0, x: x, y: y});
    }
    else{
        var sprite=setsprite(
            new PIXI.Sprite(texture),
        {anchor: false, active: 0, x: x, y: y});

        sprite.scale.x=options.scale || 0.5;
        sprite.scale.y=options.scale || 0.5;
    }

    if (options.glow){
        sprite.filters=[
            new PIXI.filters.GlowFilter({outerStrength: 1, color: 0xFFFFAA, distance: 50, quality: 0.01})
        ];
    }
    sprite.max= false || options.max;
    sprite.phase=1;
    sprite.alpha=0;
    sprite.scene=thisscene;
    sprite.ai = [[],[],[],[],[]];

    sprite.ai[1].push(fadein.bind(sprite, 0.01, 0.9, true));
    
    sprite.ai[2].push(function(){
         if (this.scene!==scene && (!this.max || scene>=this.scene)){
             this.phase++;  
         }
    }.bind(sprite));
    sprite.ai[3].push(ai.zoom.bind(sprite, 0.99, 0));
    frontlayer.addChild(sprite);
}

function cmenu(text, position, x, y, options){
        var sprite=setsprite(

        new PIXI.BitmapText(text, { 
                fontName: "solid",
                anchor: (0.5,0.5),
                textAlign: 'center',
                fontSize: options.fontsize || 80,
                //letterSpacing: 25
            }),
        {anchor: true, active: 0, x: x, y: y});
        //Reset to default
        startstage=1;
        cantdie=0;
        nobullets=0;
        trystock=3;
        
        sprite.scene = options.scene || 0;
        sprite.menuposition=position;
        sprite.key=options.key || 0;
        sprite.settings=options.settings || [];
        sprite.setvalue=options.setvalue || false;
        sprite.phase=1;
        sprite.alpha=0;
        sprite.i=0;
        sprite.floatcounter=-1;
        sprite.ai = [[], [], [], [], []];

        if (options.version=='demo'){
            sprite.ai[1].push(fadein.bind(sprite, 0.01, 0.3, true));
        }
        else{
            sprite.ai[1].push(fadein.bind(sprite, 0.01, 0.9, true));
        }
        
        sprite.ai[2].push(ai.float.bind(sprite, 0.05, 20));
        sprite.ai[2].push(function(){
            if (this.menuposition!==menuposition[this.key]){
                this.scale.x=1;
                this.scale.y=1;
            }
            if (this.settings.length){
                if (menuselected[this.key]==this.menuposition){
                    this.i++;
                    if (this.i>=this.settings.length){this.i=0;}
                    this.text=this.settings[this.i];
                    menuselected[this.key]=0;

                    if (this.setvalue=='startstage'){
                        startstage=this.i+1;
                    }
                    else if (this.setvalue=='cantdie'){
                        cantdie=this.i;
                    }
                    else if (this.setvalue=='stage'){
                        startstage=this.i;
                    }
                    else if (this.setvalue=='nobullets'){
                        nobullets=this.i;
                    }
                    else if (this.setvalue=='trystock'){
                        if (this.i){
                            trystock= 42;
                        }
                        else {
                            trystock= 3;
                        }
                    }
                    else if (this.setvalue=='difficulty'){
                        difficulty.set(this.i+1);
                    }
                }
                if (this.scene>=scene)
                {
                    this.phase=4;
                }
            }
            else{

                if (menuselected[this.key]==this.menuposition){
                    this.phase++;
                }
                if ((menuselected[this.key]!==this.menuposition && menuselected[this.key])) //if another menu was selected
                {
                    this.phase=4;
                }

            }
        }.bind(sprite));
        sprite.ai[3].push(ai.zoom.bind(sprite, 1.04, 4));
        sprite.ai[4].push(ai.zoom.bind(sprite, 0.99, 0));
        frontlayer.addChild(sprite);
}

//multipurpose-function for displaying a picture
function cpicture(texture, options){

    var sprite=setsprite(
        new PIXI.Sprite(texture),
    {anchor: true, active: 0 || options.active, layer: options.layer || 'background',
        x: options.x || 0, y: options.y || 0, z: options.z || 0,
        speedX: options.speedX || 0, speedY: options.speedY || 0, 
        accX: options.accX || 0, accY: options.accY || 0});

        if (options.blendadd){sprite.blendMode=PIXI.BLEND_MODES.ADD;}
        //sprite.fadeout=options.fadeout  || 0.05;

        sprite.light=  options.light || 1;
        sprite.alpha=  options.alpha || 1;
        sprite.scale.x=options.size || 1;
        sprite.scale.y=options.size || 1;
        
        if (options.tint){
            sprite.tint=options.tint;
        }
        else{
            sprite.ai[0].push(brightset.bind(sprite));
        }
        if (options.lightin>0){
            sprite.ai[0].push(lightf.bind(sprite, options.lightin));
        }
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(accf.bind(sprite));
        if (options.zoom>0){
            sprite.ai[0].push(ai.zoom.bind(sprite, options.zoom, options.zoommax || 3, options.fadeout  || 0.05));
        }
        if (options.fadein>0){
            sprite.ai[0].push(fadein.bind(sprite, 0.01, options.alpha));
            sprite.alpha=0.001;
        }
        if (options.rotspeed>0){
            sprite.ai[0].push(rotatef.bind(sprite, options.rotspeed || 0.01));
        }


        //fadein
        //fadeout
        //wait
        //lightin
        //lightout
        sprite.ai[0].push(offborderf.bind(sprite, 1000));
}

set.animation= function (options){
    var sprite=setsprite(
        new PIXI.AnimatedSprite(tex.mushanime),
    {anchor: true, active: 0 || options.active, layer: 'background',
        x: options.x || 500, y: options.y || 500});

        sprite.atimer=0;
        sprite.parent=options.parent || null;
        sprite.ai = [[]];
        sprite.ai[0].push(ai.mushanime.bind(sprite));
    }

    //only used for mushroom
    set.simple=function(texture, options){
        var sprite=setsprite(
            new PIXI.Sprite(texture),
        {alpha: 0.5, anchor: true, active: 0 || options.active, layer: options.layer || 'backlayer',
            x: options.x || 500, y: options.y || 500});
            backlayer.addChild(sprite);
        
            sprite.ai=[[]];
            sprite.ai[0].push(function(){
                cpicture(tParticle02, {size: 1, zoom: 1.02, zoommax: 1.8, x: Math.random()*390+820, y: 440, speedX: 0, speedY:-2, accY: -0.1, alpha: 0.5, light: 0.5, layer:'frontlayer'})
                cpicture(tParticle02, {size: 1, zoom: 1.02, zoommax: 1.8, x: Math.random()*390+820, y: 440, speedX: 0, speedY:-3, accY: -0.1, alpha: 0.5, light: 0.5, layer:'frontlayer'})
            }.bind(sprite));
    }

    set.test=function(options){
        var sprite=setsprite(
         new PIXI.projection.Sprite2d(tex.mushdefeated),
        {anchor: true, active: 0 || options.active, layer: options.layer || 'frontlayer',
            x: options.x || 0, y: options.y || 0});
            
            sprite.anchor.set(0.5, 0.5);

sprite.proj.affine = PIXI.projection.AFFINE.AXIS_X; // return to affine after rotating
sprite.position.set(0, 0);

            sprite.ai=[[]];
            sprite.buffer=0;
            sprite.ai[0].push(function(){
                //this.buffer+=0.01;
                //this.proj.setAxisX({x:this.buffer, y:0});
                //this.proj.world.mat3[1]+=0.1;
                //this.rotation+=0.01;   
                
            }.bind(sprite));
            
    }
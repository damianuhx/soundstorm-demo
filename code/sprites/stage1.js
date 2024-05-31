//Test


set.forestground = function ()
{
    var heightsprite=setsprite(
        new PIXI.Sprite(tex.forestground_h),
        //new PIXI.TilingSprite(tex.waldtitel_h, 1920, 1080),
        {layer: 'behindbackground', anchor: false, active: 0, x: 0, y: 0});
//heightsprite must be set to the scene and have same position as sprite the filter is applied to

    var sprite=setsprite(
        //new PIXI.Sprite(tWaldtitel),
        new PIXI.TilingSprite(null, 1920, 1080),
        {layer: 'behindbackground', anchor: false, active: 0, x: 0, y: 0});

        sprite.ai = [[], [], [], [], []];
        sprite.index=0;
        sprite.phase=1;

        
        sprite.ai[1].push(ai.syncscroll.bind(sprite, 20, 2837, -1, 'tilePosition.y', 0, 0));
        sprite.ai[1].push(scenephasechangef.bind(sprite, 17, 2));
        sprite.ai[2].push(ai.syncscroll.bind(sprite, 30, 2837, -2, 'tilePosition.y', -1701, 1));

        sprite.displacementfilter = get.heightfiler(tex.forestground, heightsprite, tex.forestground_n, {});
        sprite.displacementfilter.offset.y=120;
        sprite.ai[0].push(ai.beatadjust.bind(sprite, globalfilters.adjust));
        sprite.ai[0].push(ai.stagelight.bind(sprite, sprite.displacementfilter));

            sprite.ai[0].push(function(){

            }.bind(sprite));

    
    sprite.filters = [sprite.displacementfilter];
    
};


        //TEst END
set.sound=function(options={})
{
    var sprite=setsprite(
        new PIXI.Sprite(tex.recharge),
    {anchor: true, active: options.active || 0, x: 700, y: 800, layer:'front'});
    sprite.scale.x=0.1;
    sprite.scale.y=0.1;
    sprite.buffer=0;
    sprite.ai = [[]];
    sprite.ai[0].push(function(){
        this.x=herox;
        this.y=heroy;
        if (this.buffer==0 && !options.nosfx==true){
            sfx.play('firstnoise');
            this.buffer++;
        }
        this.scale.x+=0.02;
        this.scale.y+=0.02;
        if (this.scale.x>1.5){
            this.alpha-=0.02;
        }
        if (this.scale.x>2.5){
            this.delete=true;
        }
    }.bind(sprite));
};

set.ghost = function(active, type, x=1000, y=1000, options={})  
{
    var texture;
    var beatlayer;

    if (type==0){
        texture = tex.tut1;
        beatlayer=2;
    }
    else if (type==1){
        texture = tex.tut2;
        beatlayer=3;
    }
    else if (type==2){
        texture = tex.tut3;
        beatlayer=2;
    }
    else if (type==3){
        texture = tex.tut4;
        beatlayer=3;
    }
    else if (type==4){
        texture = tTutbig;
        beatlayer=2;
    }
    new PIXI.spine.Spine(tex.tut1);
    if (type<4){
        
        var sprite=setsprite(
            new PIXI.spine.Spine(texture),
            {anchor: true, active: active, x: x, y: y});
            let buffer = rgbToHex(255,255,255);
            if (beatlayer==2){
                 buffer = rgbToHex(100,255,255);
            }
            else {
                 buffer = rgbToHex(255,100,255);
            }
            //play animation
            sprite.state.addAnimation(0, 'animation', true, 0);
            sprite.filters=[
                new PIXI.filters.GlowFilter({outerStrength: 0.5, color: buffer, distance: 50})
            ]
            //sprite.ai[0].push(ai.glowbeat.bind(sprite, sprite.filters[0], beatlayer, 0.5, 2));
    }
    else{
        var sprite=setsprite(
            new PIXI.Sprite(texture),
        {anchor: true, active: active, x: x, y: y, layer:'front'});       
    }

    
        sprite.alpha=0.1;
        sprite.phase=1;

        if (options.speedX>0 || options.speedX<0){
            sprite.speedX=options.speedX;
        }
        else{
            sprite.speedX=0;
        }

        sprite.ai = [[], [], [], []];
        sprite.floatcounter=-1;
        sprite.ai[0].push(ai.float.bind(sprite, 0.02, 100));
        sprite.ai[1].push(fadein.bind(sprite, 0.01, 1, true));
        sprite.ai[2].push(movef.bind(sprite));
        sprite.ai[2].push(countf.bind(sprite));
        sprite.floatcounter=0;
        sprite.ai[2].push(ai.float.bind(sprite, 0.02, 60));
        sprite.ai[0].push(ai.glowbeat.bind(sprite, sprite.filters[0], beatlayer, 0.5, 2));

        if (type==0 || type==1)
        {
            if (options.full){
                sprite.counter[0]=[0, 80, 16, 0, 0, 0];
            }
            else{
                sprite.counter[0]=[80, 80, 16, 0, 0, 0];
            }
            
            sprite.ai[2].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'bbullet', beatlayer: beatlayer}, [
                [1, [
                    {fx: 'xyset', key: ['position'], x: 0, y: 60},
                    {fx: 'xyset', key: ['speed'], x: 0, y: 3},
                    ]
                ],
            ]));
        }
        if (type==2)
        {
            sprite.counter[0]=[0, 80, 16, 0, 0, 0];
            sprite.ai[2].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'bbullet', beatlayer: beatlayer}, [
                [1, [
                    {fx: 'xyset', key: ['position'], x: 0, y: 60},
                    {fx: 'xyset', key: ['speed'], x: 5, y: 2},
                    ]
                ],
            ]));
        }
        if (type==3)
        {
            sprite.counter[0]=[0, 80, 16, 0, 0, 0];
            sprite.ai[2].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'bbullet', beatlayer: beatlayer}, [
                [1, [
                    {fx: 'xyset', key: ['position'], x: 0, y: 60},
                    {fx: 'xyset', key: ['speed'], x: -5, y: 2},
                    ]
                ],
            ]));
        }

        if (type==4)
        {
            sprite.counter[0]=[0, 80, 16, 0, 0, 0];
            sprite.ai[2].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'bbullet', beatlayer: 2}, [
                [1, [
                    {fx: 'xyset', key: ['position'], x: 0, y: 60},
                    {fx: 'xyset', key: ['speed'], x: 1, y: 3},
                    ]
                ],
            ]));
            sprite.ai[2].push(shootf.bind(sprite, 0, {type: 'bullet', subtype: 'bbullet', beatlayer: 3}, [
                [1, [
                    {fx: 'xyset', key: ['position'], x: 0, y: 60},
                    {fx: 'xyset', key: ['speed'], x: -1, y: 3},
                    ]
                ],
            ]));
        }

        sprite.ai[2].push(dief.bind(sprite, 4));
        sprite.ai[2].push(hitf.bind(sprite));

        sprite.score=5;
        sprite.health=12;
        if (type==4)
        {
            sprite.score=20;
            sprite.health=200;
        }

        collision='enemy';
};



set.tutorialnumber=function(options={})
{
    var sprite=setsprite(
        new PIXI.BitmapText('1', { 
            fontName: "monospace",
            anchor: (0.5,0.5),
            textAlign: 'right',
            fontSize: 160,
        }),
    {anchor: true, active: options.active || 0, x: 1150, y: 940, layer:'background'});
    sprite.highlight = options.highlight || [2,3];
    sprite.alpha=0.3;
    sprite.ai = [[]];
    sprite.ai[0].push(function(){

       if (beat[3]>0){
        this.text='3'
       }
       if (beat[4]>0){
        this.text='4'
       }
       if (beat[2]>0){
        this.text='1'
       }
       if (beat[5]>0){
        this.text='2'
       }
       if (beat[2]+beat[3]+beat[4]+beat[5]>0){
        this.text = this.text + ' ' + this.text + ' ' + this.text + ' ' + this.text + ' ' + this.text + ' ' + this.text + ' ' + this.text + ' ' + this.text + ' ' + this.text + ' ' + this.text + ' ' + this.text + ' ' + this.text + '  \n ';
        this.text= this.text+this.text+this.text+this.text+this.text+this.text+this.text+this.text+this.text+this.text+this.text+this.text; 
       }
       let buffer = 1;
       this.tint= rgbToHex(255, 255, 255);

       this.highlight.forEach((element)=>{
        buffer+=beat[element];
        if (element==2 && beat[element]){
            this.tint= rgbToHex(0.5*(255-255*beat[element]), 255, 255);
            //this.tint= rgbToHex(255, 255-255*beat[element], 255-255*beat[element]);
        }
        if (element==3 && beat[element]){
            this.tint= rgbToHex(255, 0.5*(255-255*beat[element]), 255);
            //this.tint= rgbToHex(255-255*beat[element], 255, 255-255*beat[element]);
        }
       })
       //this.fontSize=buffer*200;
       this.scale.x=1+0.1*buffer;
       this.scale.y=1+0.1*buffer;
       this.alpha=0.3*buffer-0.2;
    }.bind(sprite));

    return sprite;
};


set.foresttitle = function ()
{
    var heightsprite=setsprite(
        new PIXI.Sprite(tex.foresttitle_h),
        //new PIXI.TilingSprite(tex.waldtitel_h, 1920, 1080),
        {layer: 'behindbackground', anchor: false, active: 0, x: 0, y: 0});
//heightsprite must be set to the scene and have same position as sprite the filter is applied to

    var sprite=setsprite(
        //new PIXI.Sprite(tWaldtitel),
        new PIXI.TilingSprite(null, 1920, 1080),
        {layer: 'behindbackground', anchor: false, active: 0, x: 0, y: 0});

        sprite.ai = [[]];

        sprite.displacementfilter = get.heightfiler(tex.foresttitle, heightsprite, tex.foresttitle_n);
        //sprite.displacementfilter = new HeightmapFilter(heightsprite, 20);
        sprite.displacementfilter.scale.x=0;
        sprite.displacementfilter.scale.y=120;
        sprite.displacementfilter.invert=-1.0;
        sprite.displacementfilter.repeat=1.0;
        sprite.displacementfilter.light=0.0;
        sprite.displacementfilter.normal={x: 0.0, y: 0.0};
        sprite.displacementfilter.factor={x: 1.0, y: 1.0};

        sprite.displacementfilter.offset = {x: 0.0, y: 0.08};
        sprite.ai[0].push(ai.shaderfade.bind(sprite, sprite.displacementfilter, 0.005, 1.0));
        sprite.ai[0].push(ai.beatadjust.bind(sprite, globalfilters.adjust));
        sprite.ai[0].push(ai.stagelight.bind(sprite, sprite.displacementfilter));
        sprite.scrollspeed = 1;

            sprite.ai[0].push(function(){
                
                this.displacementfilter.offset.y+=this.scrollspeed * 0.0005;
                if (this.displacementfilter.offset.y>0.52 && this.scrollspeed>-1){
                    this.scrollspeed-=0.005;
                }
                if (this.displacementfilter.offset.y<0.08 && this.scrollspeed<1){
                    this.scrollspeed+=0.005;
                }
            }.bind(sprite));

    
    sprite.filters = [sprite.displacementfilter];
    
};
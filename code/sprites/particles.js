set.bulletcast = function (position, angle, options)
{
        
        for (let i = 0; i<10; i++)
        {
            let sprite=setsprite(
                new PIXI.Sprite(tex.p1),
                {
                    layer: 'particle', 
                    anchor: true, 
                    active: 0, 
                    x: position.x, y: position.y,
                    speedX: Math.cos(angle+i/5-1)*(2+Math.random()*1.5), speedY:Math.sin(angle+i/5-1)*(2+Math.random()*1.5),
                    
                }
            );
    
        sprite.tint = rgbToHex(options.color.x, options.color.y, options.color.z);
        sprite.alpha=0.6;
        sprite.ai=[[],[],[],[],[]];
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(function () {
            this.alpha-=0.02;
            if (this.alpha<=0){
                this.delete=true;
            }
        }.bind(sprite));
        }

       

}

set.toscore = function (x, y, options){
    var speed=options.speed || 15;
    var sprite=setsprite(
        new PIXI.BitmapText('+'+(options.score || 1), { 
        fontName: "small",
        anchor: (0.5,0.5),
        textAlign: 'right',
        fontSize: 20+(20*Math.sqrt(options.score || 1)),
        letterSpacing: 0,
    }),
        {anchor: true, active: 0, x: x, y: y}
    );
    sprite.ai=[[],[],[],[],[]];
    sprite.scoreadd = options.score || 1;
    sprite.alpha=0.6;
    sprite.phase=1;
    if (remember.combovalue>0){remember.combovalue+=(options.score || 1);}
    sprite.speedX=-speed*Math.cos(direction(x, y, 1850, 50));
    sprite.speedY=-speed*Math.sin(direction(x, y, 1850, 50));
    sprite.ai[0].push(movef.bind(sprite));
    sprite.ai[1].push(function(){
        if (this.x>1700 && this.y<150){
        this.alpha-=speed/200;
        this.speedX/=1+speed/200;
        this.speedY/=1+speed/200;
        if (!this.delete && this.alpha<=0.01){  
            score+=this.scoreadd;
            this.delete=true;
        }}
    }.bind(sprite));

    frontlayer.addChild(sprite);   
}


set.toenemy = function (active, x, y, options){
    var sprite=setsprite(
        new PIXI.Sprite(tex.p5),
        {layer: 'sprite', anchor: true, active: active, x: x, y: y});

    sprite.ai=[[],[],[],[],[]];
    
    //color
    //
    sprite.speedX=options.speedX || 0;
    sprite.speedY=options.speedY || 0;
    sprite.speedX2=options.speedX || 0;
    sprite.speedY2=options.speedY || 0;


    sprite.tint=rgbToHex(options.color.x, options.color.y, options.color.z);
    sprite.color=options.color || {x: 255, y: 255, z: 255};
    sprite.color.x*=Math.random()*0.05+0.95;
    sprite.color.y*=Math.random()*0.05+0.95;
    sprite.color.z*=Math.random()*0.05+0.95;

    sprite.phase=1;
    sprite.alpha=0.8;
    sprite.speedbuffer=0;
    sprite.target = options.target;
    //set target if parent exists
    //fly towards target, else fade out

    sprite.ai[0].push(function(){
        this.rotation+=0.1;
        if (typeof this.target !== 'undefined' && 'target' in this && 'x' in this.target && !this.target.delete)
        { 
            this.speedX= 0;
            this.speedY= 0;
            buffer = Math.atan2(this.target.x-this.x+this.target.offsetX, this.target.y-this.y+this.target.offsetY);
            this.x+=Math.sin(buffer)*20*this.speedbuffer;
            this.y+=Math.cos(buffer)*20*this.speedbuffer;
            if (this.speedbuffer<1){
                this.speedbuffer+=0.02;
                this.speedX+=this.speedX2*(1-this.speedbuffer);
                this.speedY+=this.speedY2*(1-this.speedbuffer);
            }
            this.speedX+=Math.sin(buffer)*20*this.speedbuffer;
            this.speedY+=Math.cos(buffer)*20*this.speedbuffer;
            
            if ((Math.abs(this.x-this.target.x-this.target.offsetX) < (this.target.squarex||50) && Math.abs(this.y-this.target.y-this.target.offsetY)< (this.target.squarey||50) )){
                this.delete=true;
                effectf.call(this, this.x, this.y, 'toenemyhit');
                this.target.ohealth-=1/settings.ntoenemy;
            }
        }
        else{
            this.alpha*=0.98-0.08*this.speedbuffer;
            if (this.alpha<=0.001){
                this.delete=true;
            }
        }
    }.bind(sprite));
    sprite.ai[0].push(movef.bind(sprite));
}

function effectf(x,y,type, options){

    this.buffer['position']={x: 0, y: 0};
    this.buffer['speed']={x: 0, y: 0};
    this.buffer['acc']={x: 0, y: 0};
    this.buffer['zoom']={x: 1, y: 1};
    this.buffer['delay']=0;
    this.buffer['blendmode']=PIXI.BLEND_MODES.ADD;

    if (type==0)
    {
        sfx.play('heavybass');
        patternf.call (this,
            {type: 'particle', subtype: tParticle01},
            [
                [100, [
                    {fx: 'xyrandom', key: ['position'], gainx:300, gainy:300, offsetx: -150, offsety: -150},
                    {fx: 'linear', key: ['delay'], gain:100, offset: 0}
                ]],
                [80, [
                    {fx: 'xyrandom', key: ['speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    {fx: 'xyzset', key: ['color'], x:255, y:255, z:255}
                ]]
            ]
        )
    } 
    if (type=='bullet_cast')
    {
        //speed by angle with offset
        patternf.call (this,
            {type: 'particle', subtype: tParticle03},
            [
                [6, [
                    {fx: 'xyset', key: ['position'], x:x, y:y},
                    {fx: 'xyrelative', key: ['speed'], speed: 10},
                    //{fx: 'xyrandom', key: ['speed'], gainx: options.speed.x, gainy: options.speed.y, offsetx: options.speed.x*4, offsety: options.speed.y*4},
                    //{fx: 'xyrandom', key: ['speed'], gainx:50, gainy:50, offsetx: -25, offsety: -25},
                    //{fx: 'xyset', key: ['acc'], x:-options.speed.x/1000, x:-options.speed.x/1000},
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    {fx: 'xyzset', key: ['color'], x:options.color.x, y:options.color.y, z:options.color.z}
                ]]
            ]
        )
    } 
    if (type=='herohit_yellow')
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle03},
            [
                [80, [
                    {fx: 'xyrandom', key: ['speed'], gainx:50, gainy:50, offsetx: -25, offsety: -25},
                    {fx: 'xyset', key: ['acc'], x:1.3, y:1.3},
                    {fx: 'xyzset', key: ['color'], x:255, y:255, z:0}
                ]]
            ]
        )
    } 
    if (type=='herohit_orange')
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle03},
            [
                [80, [
                    {fx: 'xyrandom', key: ['speed'], gainx:50, gainy:50, offsetx: -25, offsety: -25},
                    {fx: 'xyset', key: ['acc'], x:1.3, y:1.3},
                    {fx: 'xyzset', key: ['color'], x:255, y:100, z:0}
                ]]
            ]
        )
    } 
    if (type=='herohit_red')
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle03},
            [
                [80, [
                    {fx: 'xyrandom', key: ['speed'], gainx:50, gainy:50, offsetx: -25, offsety: -25},
                    {fx: 'xyset', key: ['acc'], x:1.3, y:1.3},
                    {fx: 'xyzset', key: ['color'], x:255, y:0, z:0}
                ]]
            ]
        )
    } 
    if (type=='eagle')
    {
        sfxonce='kraechz';
        //sfx.play('kraechz');
        patternf.call (this,
            {type: 'solidparticle', subtype: tex.feather},
            [
                [80, [
                    {fx: 'xyrandom', key: ['speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    {fx: 'set', key: ['rotspeed'], set: 0.3},
                ]]
            ]
        )
    } 
    if (type=='balloon')
    {
        sfxonce='grunt';
        //sfx.play('grunt');
        patternf.call (this,
            {type: 'solidparticle', subtype: tex.air},
            [
                [80, [
                    {fx: 'xyrandom', key: ['speed'], gainx:40, gainy:40, offsetx: -20, offsety: -20},
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    {fx: 'set', key: ['rotspeed'], set: 0.3},
                ]]
            ]
        )
    } 
    if (type=='parrot')
    {
        sfxonce='twitter';
        patternf.call (this,
            {type: 'solidparticle', subtype: tex.featherparrot},
            [
                [80, [
                    {fx: 'xyrandom', key: ['speed'], gainx:50, gainy:20, offsetx: -25, offsety: -10},
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    {fx: 'set', key: ['rotspeed'], set: 0.5},
                ]]
            ]
        )
    } 
    else if (type=='alienexploding')
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle01},
            [
                [15, [
                    {fx: 'xyrandom', key: ['position'], gainx:300, gainy:500, offsetx: -150, offsety: -250},
                    {fx: 'linear', key: ['delay'], gain:30, offset: 0}
                ]],
                [80, [
                    {fx: 'xyrandom', key: ['speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1}
                ]]
            ]
        )
    } 
    else if (type=='alienexplosion')
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [3000, [
                    
                    {fx: 'xyrandomcircle', key: ['position', 'speed'], gainx:50, gainy:50, offsetx: -25, offsety: -25},
                    {fx: 'xymultiply', key: ['position'], factorx: 3, factory: 3},
                    {fx: 'xyset', key: ['acc'], x:1.02, y:1.02}
               
                ]],
            ]
        )
        sfx.play('hugeexplosion3');
        
    } 
    else if (type=='mushroomexploding')
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle01},
            [
                [30, [
                    {fx: 'xyrandom', key: ['position'], gainx:1200, gainy:400, offsetx: -400, offsety: -250},
                    {fx: 'linear', key: ['delay'], gain:30, offset: 0}
                ]],
                [60, [
                    {fx: 'xyrandom', key: ['speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1}
                ]]
            ]
        )
    } 
    else if (type=='cloudexploding')
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle01},
            [
                [30, [
                    {fx: 'xyrandom', key: ['position'], gainx:1200, gainy:400, offsetx: -600, offsety: -200},
                    {fx: 'linear', key: ['delay'], gain:30, offset: 0}
                ]],
                [60, [
                    {fx: 'xyrandom', key: ['speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1}
                ]]
            ]
        )
    } 
    else if (type=='mushroomexplosion')
    {
        set.simple(tex.mushdefeated, {active: 0, x:1017, y:515, layer: 'backlayer'});
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [3000, [
                    
                    {fx: 'xyrandomcircle', key: ['position', 'speed'], gainx:50, gainy:50, offsetx: -25, offsety: -25},
                    {fx: 'xymultiply', key: ['position'], factorx: 3, factory: 3},
                    {fx: 'xyset', key: ['acc'], x:1.02, y:1.02},
                    {fx: 'xyshift', key: ['position'], x:400, y:0}
               
                ]],
            ]
        )

        sfx.play('hugeexplosion3');
    } 
    else if (type=='cloudexplosion')
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [3000, [
                    
                    {fx: 'xyrandomcircle', key: ['position', 'speed'], gainx:50, gainy:50, offsetx: -25, offsety: -25},
                    {fx: 'xymultiply', key: ['position'], factorx: 3, factory: 3},
                    {fx: 'xyset', key: ['acc'], x:1.02, y:1.02},
                    {fx: 'xyshift', key: ['position'], x:0, y:0}
               
                ]],
            ]
        )

        sfx.play('hugeexplosion3');
    } 
    else if (type==1)
    {
        //sfx.play('heavybass');
        sfxonce='heavybass';
        //particles('particle', tParticleHawkbit,  'break', -60, 60, x, y, 1.1,1.1, 5,5, 0,0);
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [3000, [
                    {fx: 'xyrandomcircle', key: ['position', 'speed'], gainx:500, gainy:400, offsetx: -250, offsety: -200},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1}
               
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1}
                ]]
            ]
        );
    }
    else if (type=='heavybass')
    {
        sfxonce='heavybass';
        //sfx.play('heavybass');
        //particles('particle', tParticleHawkbit,  'break', -60, 60, x, y, 1.1,1.1, 5,5, 0,0);
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [1000, [
                    {fx: 'xyrandomcircle', key: ['position', 'speed'], gainx:300, gainy:200, offsetx: -150, offsety: -100},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1}
                ]]
            ]
        )
    }
    else if (type=='ufo')
    {
        sfxonce='dragonfly';
        //sfx.play('dragonfly');

        
        create(0, 'solidparticle', x+33, y+33, {speedX: 10, speedY: 5, subtype: tUfo, beatlayer: 1, accX: 1.1, accY: 1.1, misc1: 1, misc2: 0, misc3: -0.02});
        create(0, 'solidparticle', x-33, y-33, {speedX: -10, speedY: -5, subtype: tUfo, beatlayer: 1, accX: 1.1, accY: 1.1, misc1: 1, misc2: 0, misc3: -0.02});
        create(0, 'solidparticle', x-33, y+33, {speedX: -10, speedY: 5, subtype: tUfo, beatlayer: 1, accX: 1.1, accY: 1.1, misc1: 1, misc2: 0, misc3: -0.02});
        create(0, 'solidparticle', x+33, y-33, {speedX: 10, speedY: -5, subtype: tUfo, beatlayer: 1, accX: 1.1, accY: 1.1, misc1: 1, misc2: 0.0, misc3: -0.02});
   
    }
    else if (type=='zeppelin')
    {
        sfxonce='zeppelin';
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [500, [
                    {fx: 'xyrandom', key: ['speed'], gainx:40, gainy:40, offsetx: -20, offsety: -5},
                    {fx: 'xyzrandom', key: ['color'], gainx:100, gainy:50, gainz: 50, offsetx: 155, offsety: 50, offsetz: 50},
                    {fx: 'xyset', key: ['acc'], x:0.98, y:0.98},
                    {fx: 'set', key: ['rotspeed'], set: 0.3},
                ]]
            ]
        )
    }
    else if (type=='fa18')
    {
        sfxonce='heli';
        patternf.call (this,
            {type: 'particle', subtype: tParticle01},
            [
                [1000, [
                    {fx: 'xyrandomcircle', key: ['speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyzrandom', key: ['color'], gainx:100, gainy:50, gainz: 50, offsetx: 155, offsety: 50, offsetz: 50},
                    {fx: 'xyset', key: ['acc'], x:1.03, y:1.03},
                    {fx: 'set', key: ['rotspeed'], set: 0.3},
                ]]
            ]
        )
    }
    else if (type=='whiteghost')
    {
        sfxonce='heli';
        patternf.call (this,
            {type: 'particle', subtype: tParticle01},
            [
                [1000, [
                    {fx: 'xyrandomcircle', key: ['speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyzrandom', key: ['color'], gainx:50, gainy:50, gainz: 100, offsetx: 50, offsety: 50, offsetz: 155},
                    {fx: 'xyset', key: ['acc'], x:1.03, y:1.03},
                    {fx: 'set', key: ['rotspeed'], set: 0.3},
                ]]
            ]
        )
    }
    else if (type=='citycloud')
    {
        sfxonce='cloud';
        patternf.call (this,
            {type: 'particle', subtype: tex.air},
            [
                [500, [
                    {fx: 'xyrandomcircle', key: ['position', 'speed'], gainx:40, gainy:20, offsetx: -20, offsety: -10},
                    //{fx: 'xyrandom', key: ['speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyzrandom', key: ['color'], gainx:50, gainy:50, gainz: 100, offsetx: 50, offsety: 50, offsetz: 155},
                    {fx: 'xyset', key: ['acc'], x:1.03, y:1.03},
                    {fx: 'set', key: ['rotspeed'], set: 0.3},
                ]]
            ]
        )
    }
    else if (type=='heli')
    {
        sfxonce='groundex';
        patternf.call (this,
            {type: 'particle', subtype: tParticle03},
            [
                [1000, [
                    {fx: 'xyrandomcircle', key: ['position', 'speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    {fx: 'xyzrandom', key: ['color'], gainx:100, gainy:50, gainz: 50, offsetx: 155, offsety: 50, offsetz: 50},
                    {fx: 'xyset', key: ['acc'], x:1.03, y:1.03},
                ]]
            ]
        )
    }
    else if (type=='particlehit') //laserget
    {
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [5, [
                    {fx: 'xyrandom', key: ['position', 'speed'], gainx:80, gainy:80, offsetx: -40, offsety: -40},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    {fx: 'xyzset', key: ['color'], x:255, y:255, z: 255}
                ]]
            ]
        )
    }
    else if (type=='toenemyhit') //laserget
    {
        if (++remember.shothit<=2){
            sfx.play('shothit');
        }
        else{
            
        }
        patternf.call (this,
            {type: 'particle', subtype: tex.p8},
            [
                [1, [
                    {fx: 'xyrandom', key: ['position', 'speed'], gainx:10, gainy:10, offsetx: -5+this.speedX, offsety: -5+this.speedY},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.3, factory: 0.3},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.03, y:1.03},
                    {fx: 'xyset', key: ['zoom'], x:1.08, y:1.08},
                    {fx: 'xyzset', key: ['color'], x: this.color.x, y:this.color.y, z: this.color.z}
                ]]
            ]
        )
    }
    else if (type=='laserget') //laserget
    {
        //particles('particle', tParticleHawkbit,  'break', -60, 60, x, y, 1.1,1.1, 5,5, 0,0);
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [40, [
                    {fx: 'xyrandom', key: ['position', 'speed'], gainx:80, gainy:80, offsetx: -40, offsety: -40},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    {fx: 'xyzset', key: ['color'], x:0, y:0, z: 255},
                    {fx: 'set', key: ['alpha'], set: 0.3},
                ]]
            ]
        )
    }

    else if (type=='bigstar') //laserget
    {
        sfx.play('blingbling'+(1+Math.floor(2*Math.random())) );
        set.toscore(this.x, this.y, {score: scores.idlebullet});

        patternf.call (this,
            {type: 'particle', subtype: tex.p7},
            [
                [20, [
                    {fx: 'xyrandom', key: ['position', 'speed'], gainx:50, gainy:50, offsetx: -25, offsety: -25},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.05, y:1.05},
                    {fx: 'xyzset', key: ['color'], x:255, y:200, z: 0},
                    {fx: 'set', key: ['alpha'], set: 0.4},
                ]]
            ]
        )
    }

    else if (type=='smallstar') //laserget
    {

        sfx.play('bling'+(1+Math.floor(2*Math.random())));
        set.toscore(this.x, this.y, {score: difficulty.flashbullet});
        //particles('particle', tParticleHawkbit,  'break', -60, 60, x, y, 1.1,1.1, 5,5, 0,0);
        patternf.call (this,
            {type: 'particle', subtype: tex.p6},
            [
                [10, [
                    {fx: 'xyrandom', key: ['position', 'speed'], gainx:40, gainy:40, offsetx: -20, offsety: -20},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.05, y:1.05},
                    {fx: 'xyzset', key: ['color'], x:255, y:255, z: 0},
                    {fx: 'set', key: ['alpha'], set: 0.3},
                ]]
            ]
        )
    }

    else if (type=='lifeget')
    {
        if (lifestock>=3) {
            var lifecolor = {fx: 'xyzset', key: ['color'], x:255, y:255, z: 255}
        }
        else if (lifestock>=2){
            var lifecolor = {fx: 'xyzset', key: ['color'], x:255, y:255, z: 80}
        }
        else if (lifestock>=1){
            var lifecolor = {fx: 'xyzset', key: ['color'], x:255, y:180, z: 40}
        }
        else {
            var lifecolor = {fx: 'xyzset', key: ['color'], x:255, y: 0, z: 0}
        }
        //sfxonce='relief';
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [50, [
                    {fx: 'xyrandom', key: ['position', 'speed'], gainx:100, gainy:100, offsetx: -50, offsety: -50},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    lifecolor
                ]]
            ]
        )
    }
    else if (type=='dragon'){
        sfxonce='roar';
        //sfx.play('roar');
        particles('solidparticle', tParticle01,  'break', -200, 200, x, y, 1.05,1.05, 2,6, 0, 0, 0);
        create(0, 'solidparticle', x+100, y, {speedX: 5, speedY: 0, subtype: tex.dragonwing, beatlayer: 1, accX: 1, accY: 1, misc1: 1, misc2: 0, misc3: -0.02});
        create(0, 'solidparticle', x-100, y, {speedX: -5, speedY: 0, subtype: tex.dragonwing, beatlayer: 1, accX: 1, accY: 1, misc1: 1, misc2: 0, misc3: -0.02});
    }
    else if (type=='bulletexplode') 
    {
        //make particles fly to enemy on beat
        options.amount= options.amount || 40;
        options.color=options.color || {x: 255, y: 255, z:255};

        /*patternf.call (this,
            {type: 'particle', subtype: tParticle01},
            [
                [16, [
                    //{fx: 'xycircle', key: ['position'], gain:2*pi, offset: -0, speed:80},
                    {fx: 'xyrandomcircle', key: ['position', 'speed'], gainx:20, gainy:20, offsetx: -10, offsety: -10},
                    //{fx: 'xyrandom', key: ['speed'], gainx:10, gainy:10, offsetx: -5, offsety: -5},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                ]]
            ]
        );

        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [options.amount, [
                    {fx: 'xyrandom', key: ['position', 'speed'], gainx:100, gainy:100, offsetx: -50, offsety: -50},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.1, y:1.1},
                    {fx: 'xyzset', key: ['color'], x:options.color.x, y:options.color.y, z: options.color.z}
                ]]
            ]
        );*/
        patternf.call (this,
            {type: 'particle', subtype: tex.p2},
            [
                [12, [
                    {fx: 'xycircle', key: ['position', 'speed'], gain:2*pi, offset: -0, speed:10},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.03, y:1.03},
                    {fx: 'xyzset', key: ['color'], x:200, y:200, z: 200},
                    {fx: 'set', key: ['rotspeed'], set: 0.3},
                ]]
            ]
        );

    }
    else if (type=='idlebulletexplode') //lifeget
    {
        options.color=options.color || {x: 255, y: 255, z:255};
        patternf.call (this,
            {type: 'particle', subtype: tStar},
            [
                [16, [
                    {fx: 'xycircle', key: ['position', 'speed'], gain:2*pi, offset: -0, speed: 40},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.2, y:1.2},
                    {fx: 'xyzset', key: ['color'], x:options.color.x, y:options.color.y, z: options.color.z}
                ]]
            ]
        );
        patternf.call (this,
            {type: 'particle', subtype: tParticle02},
            [
                [16, [
                    {fx: 'xyrandom', key: ['position', 'speed'], gainx:30, gainy:30, offsetx: -15, offsety: -15},
                    {fx: 'xymultiply', key: ['speed'], factorx: 0.6, factory: 0.6},
                ]],
                [1, [
                    {fx: 'xyset', key: ['acc'], x:1.2, y:1.2},
                    {fx: 'xyzset', key: ['color'], x:255, y:255, z: 255}
                ]]
            ]
        );
    }

}

function particle(x,y,type)
{
    if (type==7)
    {
        sfxonce='cord_high';
        particles('particle', tParticleHawkbit,  'break', -60, 60, x, y, 1.1,1.1, 5,5, 0,0);
    }
    else if (type==1){
        sfx.play('dragonfly');
        particles('solidparticle', tParticle01,  'break', -200, 200, x, y, 1.05,1.05, 2,6, 0, 0, 0);
        create(0, 'solidparticle', x+100, y+50, {speedX: 2, speedY: 2, subtype: tWingparticle, beatlayer: 1, accX: 1, accY: 1, misc1: 1, misc2: 0.1, misc3: -0.02});
        create(0, 'solidparticle', x-100, y-50, {speedX: -2, speedY: -2, subtype: tWingparticle, beatlayer: 1, accX: 1, accY: 1, misc1: 1, misc2: -0.1, misc3: -0.02});
        create(0, 'solidparticle', x-100, y+50, {speedX: -2, speedY: 2, subtype: tWingparticle, beatlayer: 1, accX: 1, accY: 1, misc1: 1, misc2: -0.1, misc3: -0.02});
        create(0, 'solidparticle', x+100, y-50, {speedX: 2, speedY: -2, subtype: tWingparticle, beatlayer: 1, accX: 1, accY: 1, misc1: 1, misc2: 0.1, misc3: -0.02});
    }
    else if (type==2){
        //sfx.play('fly2');
        sfxonce='fly2';
        particles('particle', tParticle01,  'break', -30, 30, x, y, 1.1,1.1, 3,3, 0, 0);
    }
    else if (type==3){
        //sfx.play('laserget');
        sfxonce='cancel';
        particles('particle', tParticle01,  'back', -20, 20, x, y, 1.2,1.2, 1,1, 40, 40);
    }
    else if (type==4){
        sfxonce='hawkbit';
        //sfx.play('bulletexplodeblack');
        particles('solidparticle', tParticle01,  'break', -20, 20, x, y, 1.1,1.1, 3,3, 0, 0);
    }
    else if (type==5){
        //sfx.play('cord_mid');
        sfxonce='cord_mid';
        particles('particle', tParticleSunflower,  'break', -60, 60, x, y, 1.1,1.1, 6,6, 0, 0, {rotspeed:-0.2});
    }
    else if (type==6){
        //sfx.play('shothit2');
        sfxonce='shothit2';
        particles('particle', tParticle01,  'fire', -3, 3, x, y, 1.1,1.1, 6,6, 0, 0, {rotspeed:-0.2});
    }
    else if (type==8){
        //sfx.play('fly');
        sfxonce='fly';
        particles('particle', tParticle01,  'break', -50, 50, x, y, 1.1,1.1, 5,5, 0, 0);
    }
}

function particles(sprite, texture, effect, min, max, x, y, x2, y2, x3, y3, x4, y4, options)
{
    if (typeof(options)==='undefined') options = {};
    var rotspeed = options.rotspeed || 0;

    if (effect=='linear')
    {
        for (i=min; i<max; i++)
        {
            create(0, sprite, x, y, {speedX: (Math.random()+1)*4*Math.sin(i)*x3, speedY: (Math.random()+1)*4*Math.cos(i)*y3, subtype: texture, accX: x2, accY:y2});
        }
    }
    if (effect=='break')
    {
        for (i=min; i<max; i++)
        {
            create(0, sprite, x, y, {speedX: (Math.random())*4*Math.sin(i)*x3, speedY: (Math.random())*4*Math.cos(i)*y3, subtype: texture, accX: x2, accY:y2, rotspeed:rotspeed});
        }
    }
    if (effect=='fire')
    {
        for (i=min; i<max; i++)
        {
            create(0, sprite, x, y, {speedX: (Math.random())*5-2.5, speedY: -(Math.random())*5-5,  accX: x2, accY:y2, subtype: texture});
        }
    }
    if (effect=='back')
    {
        for (i=min; i<max; i++)
        {
            var randx=Math.random();
            var randy=Math.random();
            create(0, sprite, x-x4*Math.sin(i), y-y4*Math.cos(i), {speedX: (randx+1)*4*Math.sin(i)*x3, speedY: (randy+1)*4*Math.cos(i)*y3, subtype: texture, accX: x2, accY: y2});
        }
    }
}

set.spritezoom= function(x, y, texture, speed, min, max){
    var sprite=setsprite(
    new PIXI.Sprite(texture),
    {anchor: true, active: 0, x: x, y: y});
    
    sprite.scale.x=min;
    sprite.scale.y=min;

    sprite.ai = [[]];

    sprite.ai[0].push(ai.zoom.bind(sprite, speed, max));

}

set.preflash = function (x, y, beatlayer, options)
{
    //get from beat.js
    const graphics = new PIXI.Graphics();

    var sprite=setsprite(
    graphics,
    {anchor: true, active: 0, x: x, y: y});

    // Set fill color (e.g., blue)

    // Draw rectangle: x, y, width, height
    sprite.alpha= 1.0; //2*prebeat[beatlayer];
    
    //sprite.radius=-400*(prebeat[beatlayer])+425;
    sprite.ai[0].push(function(){
        sprite.geometry.clear();
        for (let index=0; index<prebeat2[beatlayer].length; index++)
            {
                let linethick=1;
                let radius=(1-prebeat2[beatlayer][index])*settings.preflashradius;
                if (options.color.z-options.color.x-options.color.y>0){
                     linethick=2;
                }
                
                this.lineStyle(10*Math.max(linethick, linethick*(15*prebeat2[beatlayer][index]-12)), rgbToHex(options.color.x/1.2 || 0, options.color.y/1.2 || 0, options.color.z/1.2 || 0), 0.15*Math.min(1, 4*prebeat2[beatlayer][index]));
                if (options.subtype == 'stick'){
                    this.drawRoundedRect(-1*(radius/2+24), -1*(1.5*radius+92), radius+24, 3*radius+92, radius/2);
                }
                else if (options.subtype == 'grain'){
                    this.drawEllipse (0, 0, radius, radius*1.25);
                    this.rotation=options.rotation || 0;
                }
                else if (options.subtype=='whitecluster' || options.subtype=='cluster'){
                    this.drawStar (0,0, 30, radius, radius*1.05, this.rotation)
                    this.rotation=options.rotation || 0;
                }
                else{
                    this.drawCircle(0, 0, radius+25);
                }
                
        }

    }.bind(sprite));
    EntityManager.markStepVisual(sprite);
}

function extra (x, y, type)
{
    var texture;
    if (type=='life'){
        texture=tLife;

        var sprite=setsprite(
            new PIXI.Sprite(texture),
        {anchor: true, active: 0, x: x, y: y});

        var glowFilter = GameEffects
            .stack(sprite)
            .add("glow", get.glowsingle({color: 0xFF4444}));

        sprite.speedX=0;
        sprite.speedY=5;
    
        sprite.ai[0].push(ai.glowbeat.bind(sprite, glowFilter, 0, 1, 3));
        sprite.ai[0].push(movef.bind(sprite));
        sprite.ai[0].push(extrahitf.bind(sprite, 'life'));
        sprite.ai[0].push(offborderf.bind(sprite, 50));

        sprite.floatcounter=0.5;
        sprite.ai[0].push(ai.float2.bind(sprite, 0.01, 30));

        frontlayer.addChild(sprite);
        
    }
    else if (type=='smallstar'){
        texture=tex.smallstar;
        
        var sprite=setsprite(
            new PIXI.Sprite(texture),
        {anchor: true, active: 0, x: x, y: y});
    
        sprite.speedX=10;
        sprite.speedY=0;
        sprite.alpha=0.4;
    
        sprite.ai[0].push(function(){
            if (Math.abs(this.x-herox)<difficulty.collectrange && Math.abs(this.y-heroy)<difficulty.collectrange){
                var buffer = directionh(this.x, this.y);
                this.speedX+=0.05;
                this.y+=Math.sin(buffer)*this.speedX;
                this.x+=Math.cos(buffer)*this.speedX;
            }
            else{
                if (this.speedY<4){
                    this.speedY+=0.05;
                }
                this.y += this.speedY;
            }
        }.bind(sprite));
        sprite.ai[0].push(offborderf.bind(sprite, 50));
        sprite.ai[0].push(extrahitf.bind(sprite, 'smallstar'));
        sprite.ai[0].push(rotatef.bind(sprite, 0.05));

        frontlayer.addChild(sprite);
    }
    else if (type=='bigstar'){
        texture=tex.bigstar;
        var sprite=setsprite(
            new PIXI.Sprite(texture),
        {anchor: true, active: 0, x: x, y: y});
    
        sprite.speedX=10;
        sprite.speedY=0;
        sprite.alpha=0.4;

        sprite.ai[0].push(rotatef.bind(sprite, 0.05));
        sprite.ai[0].push(offborderf.bind(sprite, 50));
        sprite.ai[0].push(function(){
            if (Math.abs(this.x-herox)<difficulty.collectrange && Math.abs(this.y-heroy)<difficulty.collectrange){
                var buffer = directionh(this.x, this.y);
                this.speedX+=0.05;
                this.y+=Math.sin(buffer)*this.speedX;
                this.x+=Math.cos(buffer)*this.speedX;
            }
            else{
                if (this.speedY<4){
                    this.speedY+=0.05;
                }
                this.y += this.speedY;
            }
        }.bind(sprite));
        sprite.ai[0].push(extrahitf.bind(sprite, 'bigstar'));

        frontlayer.addChild(sprite);
    }

    
}

function ctext (x, y, text, options)
{

    var sprite=setsprite(
        new PIXI.BitmapText(text, { 
        fontName: "small",
        anchor: (0.5,0.5),
        textAlign: 'right',
        fontSize: options.fontsize || 44,
        letterSpacing: 0
    }),
        {anchor: true, active: 0, x: x, y: y}
    );
    options.color = options.color || {x:255, y:255, z:255}
    sprite.tint=rgbToHex(options.color.x, options.color.y, options.color.z);
    sprite.alpha=2;
    sprite.ai[0].push(autofadeout.bind(sprite, options.fadeout || 0.02));  
    sprite.ai[0].push(movef.bind(sprite)); 
    sprite.speedX =  options.speedX || 0; 
    sprite.speedY =  options.speedY || 0; 
    frontlayer.addChild(sprite);                   
}

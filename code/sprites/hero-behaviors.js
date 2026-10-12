// Hero-only behavior lives with the hero sprites rather than shared enemy AI.

function pushborder(distance)
{
    if (this.x<distance)
    {
        this.x+=shipspeed*2;
    }
    else if (this.x>maxX-distance)
    {
        this.x-=shipspeed*2;
    }

    if (this.y<distance)
    {
        this.y+=shipspeed*2;
    }
    else if (this.y>maxY-distance)
    {
        this.y-=shipspeed*2;
    }
}

function heromovef(control){
    globalfilters.shockwave.center={x: herox, y: heroy};
    if (heroshift.y>0){
        this.y+=heroshift.y;
        heroshift.y=0;
    }

    this.scale.x=1+0.1*beat[0];
    this.scale.y=1+0.1*beat[0];
    if (!remember.control)
    {
        if (this.controlcounter++>=control)
        {
            remember.control=1;
        }
        }
        if (remember.control){
        //hero move
        var offset=0;
    
        if (inputcontrol == 'touch'){

            var pointerData=typeof ReplaySystem !== "undefined"
                ? ReplaySystem.currentPointerData()
                : renderer.plugins.interaction.eventData.data;
            var touchPoint=pointerData.global;
            if (pointerData.isPrimary)
            {
                if (touchPoint.x>0 && touchPoint.x<1920 && touchPoint.y>0 && touchPoint.y<1080)
                {
                    if (Math.abs(touchPoint.x-this.x)>6 || Math.abs(touchPoint.y-this.y+10)>6)
                    {
                        this.x+=6*(touchPoint.x-this.x)/Math.sqrt((touchPoint.x-this.x)*(touchPoint.x-this.x)+(touchPoint.y-this.y+10)*(touchPoint.y-this.y+10));
                        this.y+=6*(touchPoint.y-this.y+10)/Math.sqrt((touchPoint.x-this.x)*(touchPoint.x-this.x)+(touchPoint.y-this.y+10)*(touchPoint.y-this.y+10));
                    } 
                }
            }
        }
        else if (inputcontrol == 'key' || inputcontrol == 'gamepad') {
            var temp=0;
            if (left && (up || down))   {this.x-=6; offset=-6; temp++; this.persp.x-=0.06666;}
            if (up && (left || right))   {this.y-=6;temp++;this.persp.y-=0.06666;}
            if (down && (left || right))   {this.y+=6;temp++;this.persp.y+=0.06666;}
            if (right && (up || down))   {this.x+=6;offset=6;temp++;this.persp.x+=0.06666;}
            if (!temp) {
        
            if (left)   {this.x-=9; offset=-6;this.persp.x-=0.1;}
            if (right)  {this.x+=9;offset=6;this.persp.x+=0.1;}
            if (up)     {this.y-=9;this.persp.y-=0.1;}
            if (down)   {this.y+=9;this.persp.y+=0.1;}
            if (!left && !right && !up && !down){
                if (this.persp.y>=0.1){
                    this.persp.y-=0.1;
                }
                else if (this.persp.y<0.1 && this.persp.y>-0.1){
                    this.persp.y=0;
                }
                else{
                    this.persp.y+=0.1;
                }
                if (this.persp.x>=0.1){
                    this.persp.x-=0.1;
                }
                else if (this.persp.x<0.1 && this.persp.x>-0.1){
                    this.persp.x=0;
                }
                else{
                    this.persp.x+=0.1;
                }
            }
        }
        
        //this.pivot3d.set(11);
            
            this.proj.setAxisX({x: 1000, y:0}, this.persp.x/1.2);
            this.proj.setAxisY({x: 0, y:1000}, this.persp.y/1.8);
            this.pbuffer=Math.sqrt((this.persp.x*this.persp.x)+(this.persp.y*this.persp.y));
            if (this.pbuffer>1){
                this.persp.y/=this.pbuffer;
                this.persp.x/=this.pbuffer;
            }
            
            //blend mode doesnt work: idee: explosion, alpha=0
            //dann: alpha+=0.002, move falls alpha>0.5

            //perspektive ev anderer modus, der nicht verzerrt

            //perspektive dunkler wenn pbuffer>0, also wenn sprite geneigt

            //perspektive auch für touch control

        }


        if (shoot && remember.control)  
        {
            if (this.c2 <=0)
            {
                if (laserstock>=1)
                {
                    var buffer;
                    if (heromovef.shieldSoundEnabled) {
                        sfx.play('hawkbit');
                    }
                    create(0, 'laser', this.x, this.y, {subtype: 'hero'});
                    remember.laser=0;
                    laserstock--;
                    this.c2 = 10;

                     if (lifestock>=3){
                    buffer = {x: 255, y: 255, z: 255};
                    }
                    else if (lifestock>=2){
                        buffer = {x: 255, y: 255, z:80};
                    }
                    else if (lifestock>=1){
                        buffer = {x: 255, y: 180, z: 80};
                    }
                    else if (lifestock>=0){
                        buffer = {x: 255, y: 30, z: 80};
                    }

                    //old particle effect for shield
                    /*patternf.call (this,
                        {type: 'particle', subtype: tParticle01},
                        [
                            [100, [
                                {fx: 'xycircle', key: ['position', 'speed'], gain:360, offset:50, speed: 250},
                                {fx: 'xymultiply', key: ['speed'], factorx: 0.1, factory: 0.1}
                           
                            ]],
                            [1, [
                                {fx: 'xyset', key: ['acc'], x:1.2, y:1.2},
                                {fx: 'set', key: ['alpha'], set: 0.3},
                                {fx: 'xyzset', key: ['color'], x:buffer.x, y:buffer.y, z: buffer.z}
                            ]]
                        ]
                    );*/
                }
            }
        }
    }
    herox=this.x;
    heroy=this.y;

    this.c2--;
}

// Temporary mix switch: keep shield timing/judgement sounds, but mute the
// long activation sample until its final replacement is chosen.
heromovef.shieldSoundEnabled=false;

function herodief()
{
    
    
    this.hit=invincible; 
    if (invincible>0){
        hero.blendMode=PIXI.BLEND_MODES.ADD;
        if (lifestock<1){
            hero.tint= rgbToHex(255,(difficulty.immortaltime-invincible)/difficulty.immortaltime*255,(difficulty.immortaltime-invincible)/difficulty.immortaltime*255);
        }
        else{
            hero.tint= rgbToHex(255,255,(difficulty.immortaltime-invincible)/difficulty.immortaltime*255);
        }
    }
    else{
        hero.tint= rgbToHex(255,255,255);
        hero.blendMode=PIXI.BLEND_MODES.NORMAL;
    }
    if (lifestock<0 && dead==0)
    {
        //this.destroy(false);
        //create(0,'text', sprites[f].x, sprites[f].y, {text: '+'+scorecombo}); 
        this.phase++;          
        dead=1;
        trystock--;
        if (typeof ReplaySystem!=="undefined"){
            ReplaySystem.markUploadEvent("life-lost");
        }
        if (!trystock){
            create(ticks+50, 'text', 960, 540, {text: 'TRIP OVER', size: 90, alpha: 1.5});
            saveStage({
                stagecount: 1,
                actcount: 1,
                trystock: 3,
                scoretotal: 0
            });
        }
        else{
            /*saveStage({
                stagecount: stagecount,
                actcount: actcount,
                trystock: trystock,
                scoretotal: scoretotal
            });*/
        }
        
        this.renderable=false;
        this.collision=0;
        effectf.call(this, this.x, this.y, 0);
        music[playing].fade(1, 0, 2000);
        

    }
}


function hideondief(){
    if (dead>0){
        this.renderable=0;
    }
    else{
        this.renderable=1;
    }
}

//COLLISION
ai.collisionswitch = function () {
    if (Math.abs(this.scale.x)>0.9)
    {
        this.collision='enemy';
    }
    else{
        this.collision='none';
    }
    
}
//detects if hero is hit
function herohitf(){
    for (var f =0; f<sprites.length; f++)
    {
        if (sprites[f].col==true && sprites[f].visible==true)
        {
            if ((sprites[f].collision == 'enemy' || sprites[f].collision == 'stick'))
            {
                if (sprites[f].squarex > 0 && sprites[f].squarey > 0)
                {
                    if (Math.abs((sprites[f].x+sprites[f].offsetX) - (this.x)) < sprites[f].squarex + this.circle)
                    {
                        if (Math.abs((sprites[f].y+sprites[f].offsetY) - (this.y)) < sprites[f].squarey + this.circle)
                        {
                            
                            if (invincible<=0)
                            {
                                sprites[f].hit = 1;
                                if (!cantdie)
                                {
                                    remember.combocount=0;
                                    remember.combovalue=0;
                                    lifestock--;
                                    //laserstock+=difficulty.laserrestock;
                                
                                    if (!nobullets){
                                        sfx.play('herohit');
                                        if (lifestock>2){
                                            effectf.call(this, this.x, this.y, 'herohit_yellow');
                                        }
                                        else if (lifestock>1){
                                            effectf.call(this, this.x, this.y, 'herohit_orange');
                                        }
                                        else if (lifestock>=0){
                                            effectf.call(this, this.x, this.y, 'herohit_red');
                                        }
                                    }
                                }
                                invincible=difficulty.immortaltime;
                                combocount=0;
                            }
                        }
                    }
                }
            }

            if (sprites[f].collision == 'bullet')
                {
                if (sprites[f].circle > 0 && Math.sqrt(Math.pow(this.x - sprites[f].x, 2) + Math.pow(this.y - sprites[f].y, 2)) < this.circle + sprites[f].circle)
                {
                    
                    if (invincible<=0)
                            {

                                sprites[f].hit = 1;
                                if (!cantdie){
                                remember.combocount=0;
                                remember.combovalue=0;
                                lifestock--;
                                }
                                if (!nobullets){
                                    cancel_all_bullets();
                                    sfx.play('herohit');
                                    if (lifestock>=2){
                                        effectf.call(this, this.x, this.y, 'herohit_yellow');
                                    }
                                    else if (lifestock>=1){
                                        effectf.call(this, this.x, this.y, 'herohit_orange');
                                    }
                                    else if (lifestock>=0){
                                        effectf.call(this, this.x, this.y, 'herohit_red');
                                    }
                                }
                                invincible=difficulty.immortaltime;
                            }
                            else{
                                //sfx.play('gethitafter');
                            }
                }
                
            }
        }

    }
}

//detects if laser or lasered shots hit other shots
function laserhitf(){
    for (var f =0; f<sprites.length; f++)
    { 
        
        //tests collision if this is laser and other sprite is bullet
        if (sprites[f].collision=='bullet' && sprites[f].delete==false && this.collision=='laser')
        {
            //calc differences in x and y coordinates
            var diffx=sprites[f].x-this.x;
            var diffy=sprites[f].y-this.y;

            //if laser circle and bullet circle are overlapping
            if ( Math.sqrt((diffx*diffx)+(diffy*diffy)) < sprites[f].circle+this.circle)
            {
                //sets precision of the beat pressed: remember.beatexact is the value of the flash at the time bullet was hit 
                if (beat[sprites[f].beatlayer]>remember.beatexact && remember.beatlast==0){
                    remember.beatexact=beat[sprites[f].beatlayer];
                    if (remember.beatexact>0 && stagecount==4 && (musictime<19 || musictime>137.3)){
                        remember.beatexact=1;
                    }
                }
                
                //only set collision if flash intensity is at least 0.2
                if (beat[sprites[f].beatlayer]>0.2)
                {
                    sprites[f].delete = true; //delete the bullet 

                    //if the bullet has a parent: hit the parent by 5
                    if (typeof sprites[f].shotparent!=='undefined' && sprites[f].shotparent){
                        sprites[f].shotparent.hit += difficulty.flashhit;
                    }
                    

                    if (laserstock<0.8){laserstock=0.8;}//+=difficulty.lasergain;} //shield recharge from flashing bullets
                    
                    //create a laser for the bullet
                    if (typeof sprites[f].shotparent !=='undefined'){
                        create (ticks+1, 'laser', sprites[f].x, sprites[f].y, {parent: sprites[f].shotparent, subtype: 'bullet'}); //hier shotparent mitgeben
                    }
                    remember.combovalue+=scores.flashbullet;
                    if (beat[sprites[f].beatlayer]>=0.5){ //only cast stars if shield is hit on the beat with at least "ok"
                        if (difficulty.autocollect){
                            score+=scores.flashbullet;
                        }
                        else{
                            extra(sprites[f].x, sprites[f].y, 'smallstar');
                        }
                    }
                    
                    //particles that fly towards enemy
                    remember.lasthit++;
                    for (buffer=0; buffer<=difficulty.flashhit*settings.ntoenemy; buffer++){
                        set.toenemy(0, sprites[f].x, sprites[f].y, {speedX: Math.random()*20-10, speedY: Math.random()*20-10, target: sprites[f].shotparent/*(this.parent.x-this.x)/100+(5-buffer)*/, color: sprites[f].excolor});
                    }
                        effectf.call(sprites[f], sprites[f].x, sprites[f].y, 'bulletexplode', {color: sprites[f].excolor});
                        
                    
                }
                else{
                    //if the laser is from a bullet it can also cancel idle bullets
                    if (this.subtype!=='hero')
                    {
                        sprites[f].delete = true;
                        this.hit=0;

                        if (laserstock<0.8){laserstock=0.8;}//difficulty.lasergain;} //shield recharge from idle bullets
                        if (stagecount==3 && actcount==4){
                            if (temp.scoreskip++>4){
                                temp.scoreskip=0;
                                if (beat[sprites[f].beatlayer]>=0.5){ //only cast stars if shield is hit on the beat with at least "ok"
                                    if (difficulty.autocollect){
                                        score+=scores.flashbullet;
                                    }
                                    else{
                                        extra(sprites[f].x, sprites[f].y, 'smallstar');
                                    }
                                }
                            }
                        }
                        else{
                            remember.combovalue+=scores.idlebullet;
                            if (remember.combocount){ //beat[sprites[f].beatlayer]>=0.5){ //only cast stars if shield is hit on the beat with at least "ok"
                                if (difficulty.autocollect){
                                    score+=scores.idlebullet;
                                }
                                else{
                                    extra(sprites[f].x, sprites[f].y, 'bigstar');
                                }
                            }
                            //ctext(sprites[f].x, sprites[f].y, '+'+scores.idlebullet, {fontsize: 60, speedX: (1870 - sprites[f].x)/100, speedY:(sprites[f].y-50)/-100});
                            if (typeof sprites[f].parent!=='undefined' && sprites[f].parent){
                                sprites[f].shotparent.hit += difficulty.idlehit;
                                for (buffer=0; buffer<=difficulty.idlehit*settings.ntoenemy; buffer++){
                                    set.toenemy(0, this.x+Math.random()*300-150, this.y+Math.random()*300-150, {target: sprites[f].shotparent, speedX: 0/*(this.parent.x-this.x)/100+(5-buffer)*/, speedY: (this.parent.y-this.y)/100, color: {x:255-20*Math.random(), y:255-20*Math.random(), z:255-20*Math.random()}}/*sprites[f].excolor}*/);
                                }
                            } 
                            effectf.call(sprites[f], sprites[f].x, sprites[f].y, 'idlebulletexplode', {color: sprites[f].excolor});
                        }
                        
                        sprites[f].delete = true;
                        this.hit=0;
                    }
                }
                if (laserstock>difficulty.lasermax)
                {
                    laserstock=difficulty.lasermax;
                }
            }

        }

    }
}

//detects if sword hits bullets
function swordhitf(){
    if (invincible<=0)
    {
        for (var f =0; f<sprites.length; f++)
        {
            if (sprites[f].collision=='bullet')
            {
                if (Math.abs( (sprites[f].x) - (this.x) ) < sprites[f].circle + this.squarex)
                {
                    if (Math.abs( (sprites[f].y) - (this.y) ) < sprites[f].circle + this.squarey)
                    {
                        sprites[f].hit = 2;
                        this.hit=2;
                        if (laserstock<0.8){laserstock+=difficulty.lasergain;}
                        if (laserstock>1){laserstock=1}
                    }
                }
            }
        }
    }
}




//detects if a shot hits the object
function shothitf(){
    for (var f =0; f<sprites.length; f++)
    {
        if (sprites[f].collision=='enemy' && sprites[f].col==true && sprites[f].visible==true)
        {
            if (sprites[f].squarex > 0 && sprites[f].squarey > 0)
            {
                if (Math.abs( sprites[f].x + sprites[f].offsetX - (this.x+this.offsetX) ) < sprites[f].squarex + this.squarex)
                {
                    if (Math.abs( sprites[f].y + sprites[f].offsetY - (this.y+this.offsetY) ) < sprites[f].squarey + this.squarey)
                    {
                        particle(this.x, this.y, 6);
                        this.delete = true;
                        sprites[f].hit+=1;
                    }
                }
            }
        }
    }
}



//hits is slowly subtracted from health, 
//BLEND MODE changes during that time
function hitf(){
    if (this.hit>0)
    {
        if (this.hit<3){
            this.health-=this.hit;
            this.hit=0;
        }
        else if(this.hit>100){
            this.hit-=15;
            this.health-=15;
        }
        else
        {
            this.health-=3;
            this.hit-=3;
        }
        this.blendMode=PIXI.BLEND_MODES.ADD;
    }
    else if (this.health>=0)
    {
        this.blendMode=PIXI.BLEND_MODES.NORMAL;
    }
}

function extrahitf(type){ //life, energy
    if (Math.abs(this.x-herox)<100){
        if (Math.abs(this.y-heroy)<100){
            if (type=='life'){
                sfx.play('relief');
                if(difficulty.lifemax>lifestock)
                {
                    var thisscore=Math.round((lifestock-1)*scores.lifeitem);
                    thislife=1.4*(difficulty.lifemax+1.4-lifestock)*difficulty.lifeenergy;
                    thislife=Math.round(thislife*100);
                    lifestock+=thislife/100;
                    ctext(this.x, this.y, '+'+thislife+'%', {});
                    if (thisscore>0){
                        ctext(this.x, this.y+40, '+'+thisscore, {});
                        score+=thisscore;
                    }
                    if (difficulty.lifemax<lifestock){lifestock=difficulty.lifemax;}
                }
                else{
                    difficulty.lifemax=lifestock;
                    var thisscore=Math.round((difficulty.lifemax-1)*scores.lifeitem);
                    ctext(this.x, this.y+40, '+'+thisscore, {});
                    score+=thisscore;
                }
                
                
                //lifestock+=0.3;
                //create(0,'text', this.x, this.y, {text: 'life'}); 
                effectf.call(this, this.x, this.y, 'lifeget');
            }
            else if (type=='smallstar'){
                effectf.call(this, this.x, this.y, 'smallstar');
            }
            else if (type=='bigstar'){
                effectf.call(this, this.x, this.y, 'bigstar');
            }
            else{
                effectf.call(this, this.x, this.y, 'laserget');
                score+=Math.round(laserstock*scores.laseritem);
                ctext(this.x, this.y, '+'+Math.round(laserstock*scores.laseritem), {});
                laserstock=difficulty.lasermax;
                if (laserstock>difficulty.lasermax){laserstock=difficulty.lasermax;}
            }
            
            this.delete=true;
        }
    }
    //add life
    //schow life+ in red: +XX%
}
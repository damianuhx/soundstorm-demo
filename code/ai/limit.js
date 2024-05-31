//deletes object when off border
//size=tolarance of how far the object must be out of bounds to be deleted
function offborderf(size)
{
    if (typeof(size)==='undefined') size = 200;
    if (this.position.y>maxY+size || this.position.y< size*(-1) || this.position.x>maxX+size || this.position.x< size*(-1) )
    {
        this.delete=true;
    }
}


//pushes hero back into screen
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

//deletes the sprite immediately
function removef()
{
    this.delete=true;
}

//sets bosses difficulty/aggression proportional to the health left compared to max
function setdifficulty(max){
    this.difficulty=1-(this.health/max);
    if (this.difficulty>1){this.difficulty=1}
    if (this.difficulty<0){this.difficulty=0}
}
//deletes object when global variable health is 0
//creates particle explosion
function dief(explosion){
    if (this.health<0){
        //destroy bullets immediately
        if (this.collision=='bullet'){
            this.delete=true;
            particle(this.x, this.y, explosion);
                
        }
        //destroy enemies on the next beat
        else{
            this.blendMode=PIXI.BLEND_MODES.ADD;
            this.collision='none';
            if (beat[0]>0.1 && this.nobeat==true && this.ohealth<=0 && !this.delete)
            {
                this.delete=true;
                tutorialgoals++;

                if ((this.score || 0)>0)
                {
                    score+=this.score;
                    ctext(this.x, this.y, '+'+this.score, {});
                    if (this.score<20){
                        extra(this.x, this.y, 'energy');
                    }
                    else{
                        extra(this.x, this.y, 'life');
                    }
                }
                if (explosion>0)
                {
                    particle(this.x, this.y, explosion);
                }
                else if (explosion<0) {
                    effectf.call(this, this.x, this.y, explosion*-1);
                }
                else { //if it is a string
                    
                    effectf.call(this, this.x, this.y, explosion);
                }

            }
            else if (beat[0]==0)
            {
                this.nobeat=true;
            }
        }
        
        
    }
}

//fades out object and deletes it when disappeared completely
//speed =  alpha that is subtracted every frame
function autofadeout(speed){
    this.alpha-=speed;
    if (this.alpha<=0)
    {
        this.delete=true;
    }
}

//destroys object
function autodestroy()
{
    this.delete=true;
}

function timeoutdief(){
    if (scoretimer<=0)
    {
        this.ohealth=-1;
        this.health=-1;
    }
}



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
            var beatParticleExplosionAt=Number(this.beatParticleExplosionAt);
            var hasBeatParticleExplosion=Number.isFinite(beatParticleExplosionAt);
            var beatParticleExplosionReached=(
                hasBeatParticleExplosion
                && musictime+1/120>=beatParticleExplosionAt
            );
            if (
                (
                    beatParticleExplosionReached
                    || (beat[0]>0.1 && this.nobeat==true)
                )
                && this.ohealth<=0
                && !this.delete
            )
            {
                this.delete=true;
                if (hasBeatParticleExplosion){
                    this.beatParticleExplosionFrame=(
                        typeof currentBeatParticleStep==='function'
                            ? currentBeatParticleStep()
                            : ticks
                    );
                    this.beatParticleExplosionTime=musictime;
                }
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
            else if (!hasBeatParticleExplosion && beat[0]==0)
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

function timeoutdief(){
    if (scoretimer<=0)
    {
        this.ohealth=-1;
        this.health=-1;
    }
}

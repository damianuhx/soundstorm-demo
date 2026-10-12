
// Shot counter layout:
// 0 delay before progress starts
// 1 number of progress steps
// 2 cadence interval
// 3 elapsed delay
// 4 progress from 0 to 1
// 5 cadence position (shoot only at 0)
function advanceShotCounter(counter) {
    counter[3]++;

    if (counter[3] >= counter[0]) {
        counter[4] += 1 / counter[1];
    }

    if (counter[4] > 1) {
        counter[3] = 0;
        counter[4] = 0;
    }

    // Post-increment is intentional: the old cadence boundary depends on it.
    if (counter[5]++ >= counter[2]) {
        counter[5] = 0;
    }
}

function countf() {
    for (var i = 0; i < this.counter.length; i++) {
        advanceShotCounter(this.counter[i]);
    }
}

//wait 'frames' frames until next phase of object is triggered
function waitf(frames)
{
    if (this.c3++>frames)
    {
        this.c3=0;
        this.phase++;
    }
}

function phasechangef(value, property, biggerthan=false, collision)
{
    
    var valuebuffer=0;
    if (property=='speedy')
    {
        valuebuffer=this.speedY;
    }
    else if (property=='health')
    {
        valuebuffer=this.health;
    }
    else if (property=='y')
    {
        valuebuffer=this.y;
    }
    
    if (biggerthan==true)
    {
        if (valuebuffer > value)
        {
            this.phase++;
            if (typeof(collision)!=='undefined'){
                this.collision=collision;
            }
        }
    }
    else
    {
            if (valuebuffer<value)
            {
                this.phase++;
                if (typeof(collision)!=='undefined'){
                    this.collision=collision;
                }
            }

    }
}

function scenephasechangef(lscene, phase){
    if (lscene==scene){
        this.phase=phase;
    }
}
function scenenextf(value=110){
    scene=value;
    this.phase++;
}

//zooms object until its size is 100%, then go to next phase and activate collision detection
function zoomf(speed)
{
    this.z+=speed;
    if (this.z<=0)
    {
        this.phase++;
        this.col=true;
    }
}

function setcolf(collision='enemy'){
    this.collision = collision;
}

//increases phase as soon as 
//endx or endy value has been exceeded
function moveuntil(endx, endy){
    if (this.speedX>0){
        if (this.x<endx)
        {
            this.x+=this.speedX
        }
        else
        {
            this.phase++;
        }
    }
    else{
        if (this.x>endx)
        {
            this.x+=this.speedX
        }
        else
        {
            this.phase++;
        }
    }

    if (this.speedY>0){
        if (this.y<endy)
        {
            this.y+=this.speedY
        }
        else
        {
            this.phase++;
        }
    }
    else{
        if (this.y>endy)
        {
            this.y+=this.speedY
        }
        else
        {
            this.phase++;
        }
    }

}


ai.ziskadestroy = function (passed){
    if (this.passed++ > passed){
        this.health=-1;
        this.ohealth=-1;
    }
}

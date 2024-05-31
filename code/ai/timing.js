
//0: max of c3
//1: steps after max has reached (i.e. number of shots)
//2: max of c5 == shoot every c2 frame
//3: main counter
//4: goes from 0 to 1 after max (c0) has been reached
//5: second counter: shoot only if it is 0
function countf()
{
    for (i=0; i<this.counter.length; i++){
        this.counter[i][3]++;
        if (this.counter[i][3]>=this.counter[i][0])
        {
            this.counter[i][4]+=(1/this.counter[i][1]);
        }
        if (this.counter[i][4]>1)
        {
            this.counter[i][3]=0;
            this.counter[i][4]=0;
        }
        if (this.counter[i][5]++>=this.counter[i][2])
        {
            this.counter[i][5]=0;
        }
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
function scenechangef(limit){
    if (limit==scene){
        scene++;
        this.phase++;
        this.collision='enemy';
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

ai.zoom = function(x,y){
    this.scale.x*=x;
    this.scale.y*=y;
}

//sets speed and goes to the next phase
function setspeedf(speedx, speedy)
{
    this.speedX=speedx;
    this.speedY=speedy;
    this.phase++;
}

function setcolf(collision='enemy'){
    this.collision = 'enemy';
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
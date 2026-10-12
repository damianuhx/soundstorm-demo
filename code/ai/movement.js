//set the values of accX and accY
function accchangef(x, y)
{
    this.accY=x;
    this.accY=y;
}


//moves object by it's speed values
function movef()
{
    this.x += this.speedX;
    this.y += this.speedY;
}

/*ai.shifttohero = function (speed, tolerance)
{
    if (this.x>herox+tolerance){
        this.x-=speed;
        this.scale.x=-Math.abs(this.scale.x);
    }
    else if (this.x<herox-tolerance){
        this.x+=speed;
        this.scale.x=Math.abs(this.scale.x);
    }
}*/

/*
function shiftf(x, y)
{
    this.position.x += x*this.scale.x;
    this.position.y += y*this.scale.y;
}*/


/*function bgshiftf(x, y)
{
    this.position.x += x*2*(this.scale.x);
    this.position.y += y*2*(this.scale.y);
}*/

//accelarates speed of object by its accelorator values
function accf(limit=9999)
{
    if(this.accX>0 && this.speedX<limit){
        this.speedX+=this.accX;
    }

    if(this.accX<0 && this.speedX>-limit){
        this.speedX+=this.accX;
    }

    if(this.accY>0 && this.speedY<limit){
        this.speedY+=this.accY;
    }

    if(this.accY<0 && this.speedY>-limit){
        this.speedY+=this.accY;
    }
}


//slows down object by accX and accY
function breakf()
{
    this.speedX/=this.accX;
    this.speedY/=this.accY;

    if (Math.abs(this.speedX)+Math.abs(this.speedY)<1)
    {
        this.alpha-=0.1;
        if (this.alpha<0.1){
            this.delete=true;
        }
    }
}



//OBJECT ROTATION
//rotate object by 'speed'
function rotatef(speed){
    this.rotation+=speed;
}

//moves object in the direction it is pointing by 'speed'
function moveanglef(speed)
{
    this.position.x += Math.cos(this.rotation)*speed;
    this.position.y += Math.sin(this.rotation)*speed;
}

//rotates object towards hero by 'speed'
function aim2hero(speed, offset=0) {
    var direction=directionh(this.x, this.y)+offset;

    if (this.rotation>pi)
    {
        this.rotation-=2*pi;
    }
    else if (this.rotation<-pi)
    {
        this.rotation+=2*pi;
    }

    if (this.rotation>direction) {
        if (this.rotation-direction>pi)
        {
            this.rotation+=speed;
        }
        else
        {
            this.rotation-=speed;
        }
    }
    else
    {
        if (direction-this.rotation>pi)
        {
            this.rotation-=speed;
        }
        else
        {
            this.rotation+=speed;
        }
    }

}

//OBJECT FADE IN FADE OUT



//makes object smaller according to z-coordinate
function zset()
{
    this.scale.x=1/(this.z+1);
    this.scale.y=1/(this.z+1);
}

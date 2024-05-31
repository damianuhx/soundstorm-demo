//OBJECT SCROLLING

//scrolls screen
function scrollf(change)
{
    if (bgchange==change)
    {
        this.tilePosition.y += this.speedY;
    }
    else{
        this.y+=this.speedY;
        if (this.y>1500)
        {
            this.del=true;
        }
    }

}
//
function simplescrollf(speed=0)
{
        if (speed!==0){
            this.tilePosition.y += speed;
        }
        else{
            this.tilePosition.y += this.scroll * temp.plainspeed;
        }
        if (this.tilePosition.y>=this.texture.baseTexture.height*this.tileScale.y){
            this.tilePosition.y-=this.texture.baseTexture.height*this.tileScale.y;
        }
}

//scrolls screen, timedelta corrected
function timedscrollf(speed)
{
    if (typeof(speed)==='undefined') speed = 0;
    this.tilePosition.y += this.speedY*difftime*bgspeedy/16.66666;
    if (this.tilePosition.y>=this.texture.height)
    {
        this.tilePosition.y-=this.texture.height;
    }
    if (Math.abs(bgspeedy)<=Math.abs(speed))
    {
        this.phase++;
    }
}

//min, max, exponent (0=static, 1=linear)
//static, linear, exponential
//not used anymore?
function syncscrollf(modulo, height=1080, exponent=-2, variable='tilePosition.y', offset= 0, repeat=1)
{
    if ((repeat==0 || repeat>musictime/modulo) && musictime>0){
        var buffer=(musictime%modulo)/modulo;
        if (exponent>=0)
        {
            var result = height*Math.pow(buffer, exponent);
        }
        else 
        {
            var result = -height*Math.pow(1-buffer, -exponent);
        }
         
        result-=offset;

        if (variable=='tilePosition.y'){
            this.tilePosition.y = result;
        }
        else if (variable=='position.y')
        {
            this.position.y= result;
        }
    }
}

ai.syncscroll = function (modulo, height=1080, exponent=-2, variable='tilePosition.y', offset= 0, repeat=1) {
    //this.displacementfilter.offset.y -=1/2640;
    if ((repeat==0 || repeat>musictime/modulo) && musictime>0){
        var buffer=(musictime%modulo)/modulo;
        if (exponent>=0)
        {
            var result = height*Math.pow(buffer, exponent);
        }
        else 
        {
            var result = -height*Math.pow(1-buffer, -exponent);
        }
         
        result-=offset;
        this.displacementfilter.offset.y=-result/height;
    }
    
};

ai.filterscroll = function (acc, height, end) {
        this.speedY+=acc;   
        this.displacementfilter.offset.y+=this.speedY/height;
        //this.displacementfilter.offset.y-=0.001;this.speedY/height;
        //console.log('offset:'+this.displacementfilter.offset.y+' smaller than '+end);
        if (this.displacementfilter.offset.y<end){
            this.delete=true;
        }

};

ai.simplescroll = function (speed) {  
    this.displacementfilter.offset.y+=speed;
};



function bgzoomf(speed, max=2)
{

    /*this.x-=speed;
    this.y-=speed;*/
    
    this.scale.x+=2*speed;
    this.scale.y+=2*speed;
    this.position.x=-(this.scale.x-1)*960;
    this.position.y=-(this.scale.y-1)*540;

    if (this.scale.x>=max && speed>0)
    {
        scene++;
    }
}

//for zooming flies?
function backgroundzoomf(speed, max=2)
{
    this.scale.x*=1+speed;
    this.scale.y*=1+speed;
    if (this.scale.x>=max && speed>0)
    {
        this.phase++;
    }
}

//OBJECT SCROLLING

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

ai.bgpulse = function (beatlayer, min, max)
{
    this.scale.x=min+(max-min)*beat[beatlayer]*music[playing]._volume;
    this.scale.y=min+(max-min)*beat[beatlayer]*music[playing]._volume;
    this.x= 960-960*(min+(max-min)*beat[beatlayer]*music[playing]._volume);
    this.y= 540-540*(min+(max-min)*beat[beatlayer]*music[playing]._volume);
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

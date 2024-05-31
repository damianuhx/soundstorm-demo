ai.zoom = function (zoom, max, fadeout=0.05){
    this.scale.x*=zoom;
    this.scale.y*=zoom;

    if (this.scale.x>max){
        this.alpha-=fadeout;
    }
    if (this.alpha<=0){
        this.delete=true;
    }
}

ai.zoom2 = function (zoom, max, dark=1){
    if ((zoom>=1 && Math.abs(this.scale.x)<max) || (zoom<=1 && Math.abs(this.scale.x)>max)){
        this.scale.x*=zoom;
        this.scale.y*=zoom;
        buffer=(Math.abs(this.scale.x*dark))*255;
        this.tint=rgbToHex(buffer,buffer,buffer);
    }
    else{
        this.phase++;
    }
}


//this.floatcounter=-1.
ai.float = function (factor, steps){
    this.floatcounter+=1/steps;
    if (this.floatcounter>1){this.floatcounter=-1;}
    zoom=1+Math.sin(this.floatcounter*pi)*factor;
    this.scale.x=zoom;
    this.scale.y=zoom;
}

ai.float2 = function (factor, steps){
    this.floatcounter+=1/steps;
    if (this.floatcounter>1){this.floatcounter=-1;}
    this.rotation+=Math.sin(this.floatcounter*pi)*factor;
}

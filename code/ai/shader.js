//updates uniforms of dropShadowFilter
ai.shadow = function(shader, size=2){
    
    shader.drawSize={x: this.width/this.scale.x, y: this.height/this.scale.y};
    shader.drawPosition={x: this.x, y: this.y};
    shader.offset={x: -this.scale.x*(this.x-960)/4, y:-this.scale.y*(this.y*0.5-1080)/4};
    shader.size=1 + this.scale.x;
    
    //fadeout if position + abs(height/width) <0 or >1920
    //console.log(this.width);
};

ai.shadow2 = function(shader, offset=100){
    shader.offset={x: -this.scale.x*offset*(this.x-540)/540, y:-this.scale.y*offset*(this.y*0.5-1080)/1080};
    shader.size=1 + this.scale.x;
};

ai.stagelight = function (shader, multiply=1.0, beatindex=2, alpha=true){
    if (alpha){shader.alpha = stage.alpha*background.alpha;}
    //console.log(this.displacementfilter.shader.alpha);
    if (beatindex>=0){
        shader.beat = beat[beatindex]*multiply;
    }
    else{
        shader.beat = 0;
    }

    //sets invert if any fullscreen filter is applied to stage or background container
    shader.invert=1.0;
    if (stage.filters){
        stage.filters.forEach((filter)=>{
            if (filter.enabled){
                shader.invert=-1.0;
            }
        });
    }
    if (background.filters){
        background.filters.forEach((filter)=>{
            if (filter.enabled){
                shader.invert=-1.0;
            }
        });
    }
}

ai.beatadjust = function (shader, index=1){
        shader.contrast = 1 + beat[index]*beat[index];
        shader.saturation = 1 - beat[index]*beat[index];
        if (shader.contrast == 1){
            shader.enabled=false;
        }
        else {
            shader.enabled=true;
        }  
}

ai.glowbeat = function (shader, beatlayer, min=0.5, gain=1){
    shader.outerStrength=min+gain*beat[beatlayer];
}

ai.outlinebeat = function (shader, beatlayer=[]){
    let buffer = {x:0, y:0, z:0};
    beatlayer.forEach((element) => {
        buffer.x+=beat[element.beat]*element.color.x;
        buffer.y+=beat[element.beat]*element.color.y;
        buffer.z+=beat[element.beat]*element.color.z;
    });
    shader.color=rgbToHex(buffer.x,buffer.y,buffer.z);;
}

ai.shaderfade = function (shader, speed=0.01, limit=1.0)
{
    if ((shader.light<limit && speed>0) || (shader.light>limit && speed<0))
    {
        shader.light+=speed;
    }
    else{
        shader.light=limit;
    }
}


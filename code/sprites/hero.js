set.laserstar = function (index, active=0)
{
   
    var sprite=setsprite(
    new PIXI.Sprite(tex.p2),
    {anchor: true, active: active, x: 400, y: 300});
    //sprite.blendMode=PIXI.BLEND_MODES.ADD
    sprite.alpha=0.4;
    sprite.index=index;
    sprite.rotate=0;
    //sprite.scale.y=10;
    //sprite.scale.x=10;
    sprite.ai=[[]];
    sprite.ai[0].push(function (){
        this.rotation+=0.1;
        this.offset+=0.01;
        if (laserstock>=1){
            this.rotate+=0.3;
        }
        else{
            this.rotate+=0.03;
        }
        if (this.rotate>=2.0){
            this.rotate=0;
        }
        this.x=herox+(beat[0]*10+240)*Math.sin((index+this.rotate)*0.02*pi); 
        this.y=heroy-(beat[0]*10+240)*Math.cos((index+this.rotate)*0.02*pi);
        if (laserstock*100<this.index){
            this.tint=rgbToHex(0,0,0);
            this.scale.x=1;
            this.scale.y=1;
        }
        else {
            this.ncolor=1;
            //this.color={x:255, y:255, z:255};
            if (lifestock >=3){
                this.color={x:255, y:255, z:255};
                this.alpha=0.3;
            }
            else if (lifestock >=2){
                this.color={x:255, y:255, z:0};
                this.alpha=0.4;
            }
            else if (lifestock >=1){
                this.color={x:255, y:100, z:0};
                this.alpha=0.45;
            }
            else {
                this.color={x:255, y:0, z:0};
                this.alpha=0.5;
            }
            for(var i=1; i<=8; i++){
                if (!stagecount==0 || !(i==4 || i==5))
                {
                    this.color.x+=2*beat[i]*bcolor(i).x;
                    this.color.y+=2*beat[i]*bcolor(i).y;
                    this.color.z+=2*beat[i]*bcolor(i).z;
                    this.ncolor+=2*beat[i];
                }
            }
            this.tint=rgbToHex(this.color.x/this.ncolor,this.color.y/this.ncolor,this.color.z/this.ncolor);
            this.scale.x=this.ncolor;
            this.scale.y=this.ncolor;

        }
    }.bind(sprite));
}

function cherocenter(active=0)
{
    var sprite=setsprite(
        new PIXI.Sprite(tStar),
    {layer: 'front', anchor: true, active: active, x: herox, y: heroy});

    sprite.ai = [[]];
    
        sprite.ai[0].push(function () {
            this.x=herox;
            this.y=heroy-10;
            //this.light=0.5+0.5*laserstock;
            if (lifestock>=3){
                this.tint=rgbToHex(255,255,255);
            }
            else if (lifestock>=2){
                this.tint=rgbToHex(255,255,100);
            }
            else if (lifestock>=1){
                this.tint=rgbToHex(255,180,80);
            }
            else{
                this.tint=rgbToHex(255,80,80);
            }


            this.scale.x=laserstock;
                this.scale.y=laserstock;
            if (dead>0){
                this.renderable=0;
                
            }
            else if (laserstock>=1)
            {
                this.rotation+=0.1;
                this.renderable=1;
            }
        }.bind(sprite));
        //sprite.ai[0].push(brightset.bind(sprite));
        //container.addChild(sprite);
}

function cherostinger(type='right'){
    var sprite=setsprite(
        new PIXI.Sprite(tStinger),
    {anchor: true, active: 0, x: herox, y: heroy});

    sprite.ai = [[]];
    sprite.ai[0].push(hideondief.bind(sprite));
    sprite.ai[0].push(swordhitf.bind(sprite));

    if (type=='back'){
        sprite.squarex=5;
        sprite.squarey=40;
        sprite.scale.y=1.5;
        sprite.ai[0].push(function () {
            this.x=herox;
            this.y=heroy+80;
            }.bind(sprite));
    }

    if (type=='left'){
        sprite.squarex=27;
        sprite.squarey=5;
        sprite.rotation=pi/2;
        sprite.ai[0].push(function () {
            this.x=herox-100;
            this.y=heroy;
            }.bind(sprite));
    }

    if (type=='right'){
        sprite.squarex=27;
        sprite.squarey=5;
        sprite.rotation=-pi/2;
        sprite.ai[0].push(function () {
            this.x=herox+100;
            this.y=heroy;
            }.bind(sprite));
    }

    sprite.collision='sword';
    container.addChild(sprite);
}

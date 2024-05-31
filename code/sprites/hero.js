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
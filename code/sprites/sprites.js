function setsprite(sprite, options){
    //set variables
    active = options.active || options;
    if (active>0){sprite.visible=false;}
    sprite.active=active;
    sprite.ai = [[]];
    sprite.buffer=[];
    sprite.delete=0;
    sprite.x=options.x||0;
    sprite.y=options.y||0;
    sprite.z=options.z||0;
    sprite.position.x=options.x||0;
    sprite.position.y=options.y||0;

    sprite.phase=0;
    sprite.c1=0;
    sprite.c2=0;
    sprite.c3=0;
    sprite.counter=[];

    sprite.squarex=0;
    sprite.squarey=0;
    sprite.offsetX=0;
    sprite.offsetY=0;
    sprite.circle=0;
    sprite.rotation=0;
    fn.sethealth.call(sprite, 0);
    sprite.hit=0;
    sprite.collision='none';
    sprite.del = false;
    sprite.col=  true;

    sprite.speedX=options.speedX||0;
    sprite.speedY=options.speedY||0;
    sprite.accX=options.accX||0;
    sprite.accY=options.accY||0;

    if (options.anchor && sprite.anchor){
        sprite.anchor.x=0.5;
        sprite.anchor.y=0.5;
    }

    var layer=options.layer || 'sprite';
    
    if (layer=='background'){
        background.addChild(sprite);
    }
    else if (layer=='behindbackground')
    {
        background.addChildAt(sprite, 0);
    }
    else if (layer=='backlayer')
    {
        backlayer.addChild(sprite);
    }
    else if (layer=='behindbacklayer')
    {
        backlayer.addChildAt(sprite, 0);
    }
    else if (layer=='sortbacklayer')
    {
        //backlayer.addChildAt(sprite, 0);

        if (backlayer.children.length<=0){
            backlayer.addChild(sprite);
        }
        else
        {
            for (i=0; i<backlayer.children.length; i++)
            {
                if (i == backlayer.children.length-1 || (sprite.z<=backlayer.children[i].z))
                {
                    backlayer.addChildAt(sprite, i);
                    break;
                }
            }
        }
    }
    else if (layer=='particle')
    {
        particlelayer.addChild(sprite);
    }
    else if (layer=='sprite')
    {
        container.addChild(sprite);
    }
    else if (layer=='front')
    {
        frontlayer.addChild(sprite);
    }
    else if (layer=='backfront')
    {
    frontlayer.addChildAt(sprite, 0);
    }
    else
    {
        container.addChildAt(sprite, 0);
    }

    //push it to the array of all sprites
    sprites.push(sprite);

    //return the created object
    return sprite;
}


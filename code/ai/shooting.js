//OBJECT SHOT CREATION

//0, [0], [0], 0, 6, beatlayer, 'grain', 0, 2, 0.5, 6, 0.8, false, [0, 0, 0, 0], 0))
//counter = key of counter array that is applied
//positionx, positiony = x/y offset where bullet is created (from center of sprite)
//offset=angle offset
//speed of shot
//beatlayer
//type of shot
//type of aiming (e.g. directed to hero, static etc...)
//steps between 0 and 1 of counterbuffer
//speedgain = how much more speed foreach speedmulti
//speedmulti = how many bullets foreach speedgain
//offsetchange = how much the angle is changed foreach step between -1 to + 1
//circle = prototype of circle formed shots, array[5] or false
//acc = acceleration [relative speed gain x, y, absolute speedgain x, y
//accoffset=static accelaration [relative speed gain x, y, absolute speedgain x, y
//maxspeed: maximal speed of bullet
//suggestions: position random
//speed random
//acc random
//angle, speedgain, speedmulti random

//x, y, speedx, speedy, maxspeed, accx, accy
function patternfn(options){
    if (typeof(options)==='undefined') options = {};
    var counter = options.counter || 0;
    var positionx = options.positionx || [0];
    var positiony = options.positiony || [0];
    var offset = options.offset || 0;
    var speed = options.speed || 0;
    var beatlayer = options.beatlayer || 0;
    var type = options.type || 0;
    var aim = options.aim || 0;
    var steps = options.steps || 0;
    var speedgain = options.speedgain || 0;
    var speedmulti = options.speedmulti || 1;
    var offsetchange = options.offsetchange || 0;
    var circle = options.circle || false;
    var acc = options.acc || false;
    var accoffset = options. accoffset || false;
    var speedmax = options.speedmax || 0;
    var distance = options.distance || 0;

    //this.bind(patternf, counter, positionx, positiony, offset, speed, beatlayer, type, aim, steps, speedgain, speedmulti, offsetchange, circle, acc, speedmax);
   
    //set angle
    if (this.counter[counter][4] == 0) {
        //0: aim, 
        if (aim == 0) {
            this.shotangle[counter] = directionh(this.x + positionx[0], this.y + positiony[0]) + offset;
        }
        //1: aim from middle
        else if (aim == 1) {
            this.shotangle[counter] = directionh(this.x, this.y) + offset;
        }
        //2: linear
        else if (aim == 2) {
            this.shotangle[counter] = offset;
        }
        //5: linear
        else if (aim == 5) {
            this.shotangle[counter] = offset+this.rotation;
        }
        else {
            //3=aim every frame
            //4=aim every frame for every position
            this.shotangle[counter] = 0;
        }

    }


    if (this.counter[counter][4] > 0)
    {
        if (steps > 0) {
            counterbuffer = 0;
            counterend = 1;
        }
        else {
            counterbuffer = this.counter[counter][4];
            counterend = counterbuffer;
        }
        for (counterbuffer; counterbuffer <= counterend; counterbuffer += 1/steps)
        {
            if (this.counter[counter][5] == 0) {
                if (aim == 3) {
                    this.shotangle[counter] = directionh(this.x + positionx[0], this.y + positiony[0]) + offset;
                }
                for (var i = 0; i < positionx.length; i++) {
                    if (aim == 4) {
                        this.shotangle[counter] = directionh(this.x + positionx[i], this.y + positiony[i]) + offset;
                    }

                    var anglebuffer = this.shotangle[counter] + (offsetchange * (counterbuffer - 0.5));
                    var speedbuffer = speed;


                    //add accelaration to accelarationbuffer
                    var accxbuffer = 0;
                    var accybuffer = 0;
                    if (accoffset !== false) {
                        if (acc[0] !== 0 || acc[2] !== 0) {
                            accxbuffer += Math.cos(anglebuffer + 1.57) * ((accoffset[0]) + accoffset[2]);
                            accybuffer += Math.sin(anglebuffer + 1.57) * ((accoffset[0]) + accoffset[2]);
                        }

                        if (acc[1] !== 0 || acc[3] !== 0) {
                            accxbuffer += Math.cos(anglebuffer) * ((accoffset[1]) + accoffset[3]);
                            accybuffer += Math.sin(anglebuffer) * ((accoffset[1]) + accoffset[3]);
                        }

                    }
                    if (acc !== false) {
                        if (acc[0] !== 0 || acc[2] !== 0) {
                            accxbuffer += Math.cos(anglebuffer + 1.57) * ((2 * (counterbuffer - 0.5) * acc[0]) + acc[2]);
                            accybuffer += Math.sin(anglebuffer + 1.57) * ((2 * (counterbuffer - 0.5) * acc[0]) + acc[2]);
                        }

                        if (acc[1] !== 0 || acc[3] !== 0) {
                            accxbuffer += Math.cos(anglebuffer) * ((2 * (counterbuffer - 0.5) * acc[1]) + acc[3]);
                            accybuffer += Math.sin(anglebuffer) * ((2 * (counterbuffer - 0.5) * acc[1]) + acc[3]);
                        }

                    }

                    //circle:
                    //0: position x (cos)
                    //1: position y (sin)
                    //4: number of bullets?
                    for (var j = 0; j < speedmulti; j++) {
                        speedbuffer += speedgain;

                        if (circle == false) {
                            positionxbuffer = this.position.x + positionx[i];
                            positionybuffer = this.position.y + positiony[i];
                            //pass this to bullet
                            create(0, 'bullet', positionxbuffer+(distance * Math.cos(anglebuffer) * speedbuffer), positionybuffer+(distance * Math.sin(anglebuffer) * speedbuffer), {parent: this, speedX: Math.cos(anglebuffer) * speedbuffer, speedY: Math.sin(anglebuffer) * speedbuffer, subtype: type, beatlayer: beatlayer, accX: accxbuffer, accY: accybuffer, misc1: speedmax});
                        }
                        else if (circle[5] == false) {
                            positionxbuffer = this.position.x + positionx[i] + (Math.cos((counterbuffer) * 2 * pi) * circle[0]);
                            positionybuffer = this.position.y + positiony[i] + (Math.sin((counterbuffer) * 2 * pi) * circle[1]);
                            for (var k = 0; k <= circle[4]; k++) {
                                positionxbuffer = this.position.x + positionx[i] + Math.cos((counterbuffer - 0.5) * 2 * pi) * (circle[0] + circle[1] * k / circle[4]);
                                positionybuffer = this.position.y + positiony[i] + Math.sin((counterbuffer - 0.5) * 2 * pi) * (circle[2] + circle[3] * k / circle[4]);
                                create(0, 'bullet', positionxbuffer, positionybuffer, {
                                    parent: this, 
                                    speedX: Math.cos(anglebuffer) * speedbuffer, 
                                    speedY: Math.sin(anglebuffer) * speedbuffer, 
                                    subtype: type, 
                                    beatlayer: beatlayer, 
                                    accX: accxbuffer, 
                                    accY: accybuffer, 
                                    misc1: speedmax
                                });

                            }
                        }
                    }
                }
            }
        }
    }

}

function shootf(counter, type, options){  //type: type, subtype, beatlayer, 
    if (this.counter[counter][4] > 0 && this.counter[counter][5] == 0)
    {
        this.buffer['position']={x: 0, y: 0};
        this.buffer['speed']={x: 0, y: 0};
        this.buffer['acc']={x: 0, y: 0};
        this.buffer['zoom']={x: 1, y: 1};
        this.buffer['color']={x: 255, y: 255, z:255};
        this.buffer['delay']=0;
        this.buffer['angle']=0;
        this.buffer['alpha']=1;
        if (this.health-this.hit>=0){
            patternf.call(this, type, options, this.counter[counter][4]);
        }
    }
}
//array: [repeat, [functions]], [repeat, [functions]], [repeat, [functions]]
function patternf(type, options, counter=0){
    if (options.length)
    {
        var i=0;
        for (i=0; i<options[0][0]; i++)
        {
            for (j=0; j<options[0][1].length; j++)
            {
                distf.call(this, options[0][1][j], ((i)/options[0][0]), counter);
            }
            
            patternf.call(this, type, options.slice(1));
        }
    }
    else{
        if (type.type=='bullet')
        {
            //type.color
            create(0, 'bullet', this.buffer['position'].x+this.x, this.buffer['position'].y+this.y, {parent: this, speedX: this.buffer['speed'].x, speedY: this.buffer['speed'].y, subtype: type.subtype, beatlayer: type.beatlayer});  
        }     
        else if (type.type=='particle' || type.type=='solidparticle')
        {
            this.buffer['color']=this.buffer['color'] || {x:255, y:255, z:255};
            if (!this.buffer['zoom']){
                this.buffer['zoom']={x:1,y:1}
            }
            create(ticks+this.buffer['delay'], type.type, this.buffer['position'].x+this.x, this.buffer['position'].y+this.y, {
                color: {r:this.buffer['color'].x, g: this.buffer['color'].y, b:this.buffer['color'].z}, 
                speedX: this.buffer['speed'].x, 
                speedY: this.buffer['speed'].y, 
                accX: this.buffer['acc'].x, 
                accY: this.buffer['acc'].y, 
                zoomX: this.buffer['zoom'].x, 
                zoomY: this.buffer['zoom'].y, 
                rotspeed: this.buffer['rotspeed'] || 0, 
                subtype: type.subtype, 
                beatlayer: type.beatlayer,
                blendmode: this.buffer['blendmode'],
                alpha: this.buffer['alpha'] || 1, 
                misc1: 1,
            });
        }     
        else{

        }
    }
}

function distf(p, i, counter)
{
    var temp={};

    //set x & y linearly between 0 and gain, add offset
    if (p.fx=='xylinear'){
        temp.x=p.gainx*i+p.offsetx;
        temp.y=p.gainy*i+p.offsety;
    }
    //set fixed single value
    else if (p.fx=='set'){  
        temp=p.set;
    }
    //set value linearly between 0 and gain, add offset
    else if (p.fx=='linear'){
        temp=i*p.gain+p.offset;
    }
    else if (p.fx=='aim'){ //speed, angle offset
            p.step=p.step || 0;
            temp=directionh(this.buffer['position'].x + this.x, this.buffer['position'].y + this.y);
            temp+=p.step/2;
            if (p.step){
                temp=temp-temp%p.step;
                //temp-=p.step;
            }
        }
    else if (p.fx=='xycounterangle'){
        temp.x = Math.cos(counter*p.range+p.offset) * p.speed;
        temp.y = Math.sin(counter*p.range+p.offset) * p.speed;
        
    }
    else if (p.fx=='xyshift'){
        temp.x = p.x + this.buffer[p.key[0]].x;
        temp.y = p.y + this.buffer[p.key[0]].y;
    }
    else if (p.fx=='xyrelative'){  //key, offset, speed
        temp.x = Math.cos(this.buffer['angle']) * p.speed;
        temp.y = Math.sin(this.buffer['angle']) * p.speed;
    }
    //set random values for x & y
    else if (p.fx=='xyrandom'){
        temp.x=Math.random()*p.gainx+p.offsetx;
        temp.y=Math.random()*p.gainy+p.offsety;
    }
    //set random values for x & y & z
    else if (p.fx=='xyzrandom'){
        temp.x=Math.random()*p.gainx+p.offsetx;
        temp.y=Math.random()*p.gainy+p.offsety;
        temp.z=Math.random()*p.gainz+p.offsetz;
    }
    //set speed of x & y in direction of the hero
    else if (p.fx=='xy2hero'){
        if (this.x>herox){temp.x=-p.speedx;}
        else{temp.x=p.speedx;}
        if (this.y>heroy){temp.y=-p.speedy;}
        else{temp.y=p.speedy;}
    }
    else if (p.fx=='xyset'){
        temp.x=p.x;
        temp.y=p.y;
    }
    else if (p.fx=='xyzset'){
        temp.x=p.x;
        temp.y=p.y;
        temp.z=p.z;
    }
    else if (p.fx=='rotationset'){
        temp=this.rotation+ (p.offset || 0);
    }
    else if (p.fx=='xymultiply') //only works with 1 key
    {
        for(k=0; k<p.key.length; k++)
        {
        temp.x=this.buffer[p.key[k]].x*p.factorx;
        temp.y=this.buffer[p.key[k]].y*p.factory;
        }
    }
    else if (p.fx=='xyzmultiply') //only works with 1 key
    {
        for(k=0; k<p.key.length; k++)
        {
        temp.x=this.buffer[p.key[k]].x*p.factorx;
        temp.y=this.buffer[p.key[k]].y*p.factory;
        temp.z=this.buffer[p.key[k]].y*p.factorz;
        }
    }
    else if (p.fx=='xyrandomcircle') //only works with 1 key
    {
        for(k=0; k<p.key.length; k++)
        {
            temp.x=Math.random()*p.gainx+p.offsetx;
            temp.y=Math.random()*p.gainy+p.offsety;
            
            temp.x*= Math.abs(temp.x / Math.sqrt(Math.pow(temp.x,2)+Math.pow(temp.y, 2)));
            temp.y*= Math.abs(temp.y / Math.sqrt(Math.pow(temp.x,2)+Math.pow(temp.y, 2)));
        }
    }
    else if (p.fx=='xycircle') //only works with 1 key
    {
        temp.x= Math.sin(p.offset+i*p.gain)*p.speed;
        temp.y= Math.cos(p.offset+i*p.gain)*p.speed;
    }
    else if (p.fx=='multiply'){ //only works with 1 key
        for(k=0; k<p.key.length; k++)
        {
        temp=this.buffer[p.key[k]]*p.factor;
        }
    }
    else{
    }

    for(k=0; k<p.key.length; k++)
    {
        this.buffer[p.key[k]]=temp;
    }
}


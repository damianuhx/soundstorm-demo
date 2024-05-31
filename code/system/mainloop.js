

var lastlength=0;


function startpause(){
    if (music[playing].playing()){
        music[playing].pause();
        remember.playing=true;
    }
    lastticks=ticks;
    
}

function endpause(){
    var date = new Date();
    time=date.getTime();
    if (remember.playing){
        music[playing].play();
        remember.playing=false;
    }
}

function allai(){
//sprites ai
    remember.wait--;
    if (remember.combovalue>0){
        remember.combovalue-=0.2;
    }
    else{
        remember.combocount=0;
    }
    if (remember.combovalue>10){
        remember.combovalue-=(remember.combovalue-10)*0.01;
    }
    
    for (var i = 0; i < sprites.length; i++)
    {
        if (sprites[i].visible==true)
        {
            for (var j = 0; j < sprites[i].ai[0].length; j++)
            {
                sprites[i].ai[0][j]();
            }
            phase=sprites[i].phase || 0;
            if (sprites[i].phase>0)
            {
                for (var j = 0; j < sprites[i].ai[phase].length; j++)
                {
                    sprites[i].ai[phase][j]();
                }
            }
        }
        else
        {
            if (sprites[i].active<=ticks)
            {
                sprites[i].visible=true;
            }
        }
    }
}

function update()
{
        var gamepads = navigator.getGamepads();
        

            if (play){
                keycalc();
            }

        if (sfxonce !== ''){
            sfx.play(sfxonce);
            sfxonce='';
        }

        if (remember.beatlast>0){
            remember.beatlast--;
        }
        else {
            if (remember.beatexact>0.7){
                if (remember.combocount<difficulty.maxcombocount){
                    remember.combocount++;
                }
                if (remember.combocount!==difficulty.maxcombocount){
                    let yay = sfx.play('yay0');
                    sfx.rate(0.5+remember.combocount/20, yay);
                    sfx.volume(0.6+remember.combocount/30, yay);
                }
                else{
                    let yay = sfx.play('yay1');
                }
                
                //yay.volume(1);
                //yay.rate(0.5);
                //sfx.play('yay'+Math.floor(remember.combocount/difficulty.maxcombocount*6));
                if (remember.combocount>0){
                    ctext(herox, heroy+40, 'COMBO +'+remember.combocount, {speedY: -1});
                    //ctext(herox, heroy+30, '+'+Math.ceil( (remember.beatexact-0.5)*remember.combocount*2), {});
                }
                score+=remember.combocount;

            }
            if (remember.beatexact<0.4 && remember.shieldframe){
                remember.combocount=0;
                remember.combovalue=0;
            }

            if (remember.beatexact>0.99){
                ctext(herox, heroy, 'PERFECT', {speedY: -1, color:{x: 100, y: 255, z:100}});
                remember.beatlast=30;
                remember.beatexact=0;
            }
            else if (remember.beatexact>0.7){
                ctext(herox, heroy, 'PERFECT', {speedY: -1, color:{x: 100, y: 255, z:100}});
                remember.beatlast=30;
                remember.beatexact=0;
            }
            else if (remember.beatexact>=0.4){
                ctext(herox, heroy, 'OKAY', {speedY: -1, color:{x: 255, y: 255, z:100}});
                remember.beatlast=30;
                remember.beatexact=0;
            }
            else if (remember.beatexact>0.01){
                sfx.play('miss2');
                ctext(herox, heroy, 'BAD', {speedY: -1, color:{x: 255, y: 100, z:100}});
                remember.beatlast=30;
                remember.beatexact=0;
            }
            /*else if (remember.beatexact=0.0){
                ctext(herox, heroy, 'MISS', {speedY: -1, color:{x: 255, y: 100, z:100}});
                remember.beatlast=30;
                remember.beatexact=0;
            }*/
            remember.shieldframe=false;
        }
        

        


        //exit game if pause is held
        if (pause2){
            pausepressed++;
            pausereleased=0;
        }
        if (pausepressed>100){
            reset();
            pauseactive=0;
            pausepressed=0;
            if (remember.scoreattack){
                renderer.background.color = 0x000000;
                
                resettime();
                stage.alpha=1;
                stagecount=0;
                scene=8;
                actcount=0;
            }
        }

        if (pauseactive){
            if (!pause2){
                pausereleased++;
                pausepressed=0;
                pausedown=1;
            }
            else if (pausedown && pause2){
                pauseactive=0;
                pausepressed=0;
                pausedown=1;
                endpause();
                if (typeof pausesprite !== 'undefined'){
                    frontlayer.removeChild(pausesprite);
                    pausesprite.destroy();
                    frontlayer.removeChild(pausesprite2);
                    pausesprite2.destroy();
                    frontlayer.removeChild(pausesprite3);
                    pausesprite3.destroy();
                }
            }
        }
        else if (pause2 && !pauseactive && !pausedown && ((stagecount && scene>10) || scene>13)){
            startpause();

            pausesprite3 = new PIXI.Sprite(tex.frame);
            pausesprite3.x=960-pausesprite3.width*0.8/2;
            pausesprite3.y=620-pausesprite3.height*0.7/2;
            pausesprite3.scale.y=0.7;
            pausesprite3.scale.x=0.8;
            pausesprite3.alpha=0.6;
            frontlayer.addChild(pausesprite3);


            pausesprite = new PIXI.BitmapText('PAUSE', { 
                fontName: "inline",
                anchor: (0.5,0.5),
                textAlign: 'center',
                fontSize: 200,
            });
            pausesprite.x=960-pausesprite.width/2;
            pausesprite.y=540-pausesprite.height/2;
            frontlayer.addChild(pausesprite);

            pausesprite2 = new PIXI.BitmapText('HOLD PAUSE TO EXIT', { 
                fontName: "solid",
                anchor: (0.5,0.5),
                textAlign: 'center',
                fontSize: 50,
            });
            pausesprite2.x=960-pausesprite2.width/2;
            pausesprite2.y=700-pausesprite2.height/2;
            frontlayer.addChild(pausesprite2);
            
            
            
            pauseactive=1;
            pausereleased=0;
        }

        if(pause){
            
        }
        else if (pauseactive){

        }
        else{    
            
            if(!pause2){
                pausedown=0;
            }

        stats.begin();

        timer();
        invincible--;
        scorecombo=0;
        aidelete=0;

        if (frameskip){
            while(aicounter){
                aidelete=1;
                allai();
                aicounter--;
            }
        }
        else{
            aidelete=1;
            allai();
        }
    }
        

        //render screen
        if (aidelete){ //only draw new frame if ai was executed at leat once
        renderer.render(stage);
        }

        requestAnimationFrame(update);
        stats.end();

        //delete sprites when sprite.delete==true
            for ( i = sprites.length-1; i>=0; i--) {
                if(sprites[i].delete==true) //only if ai was executed
                {    
                    container.removeChild(sprites[i]);
                    background.removeChild(sprites[i]);
                    backlayer.removeChild(sprites[i]);
                    frontlayer.removeChild(sprites[i]);
                    particlelayer.removeChild(sprites[i]);
                    sprites[i].destroy(false);
                    sprites.splice(i, 1);
                }
            }
        
        keys.shoot.mouse = 0;
        remember.shield=0;
        remember.shothit=0;
        
}

function clear_sprites(stage)
{
    for (var i = 0; i < sprites.length; i++)
    {
        sprites[i].destroy(false);
    }
    sprites=[];
    music[playing].stop();
    backlayer.filters = [];
    if (!stage){
        setStage();
    }
}



function count(){
    //ticks++;
    pace1++;
}

function timer()
{
    count();
    
    //generate beats of playing music
    musictime=0;
    if (typeof(music[playing])=='object'){
        musictime = music[playing].seek();
        beatgenerator(musictime, playing)
    }

    //calc timediff
    var date = new Date();
    newtime = date.getTime();
    //time = date.getTime();
    aicounter=0;
    while ((newtime-time)/16.66666666666666>=16.66666666666666){
        aicounter++;
        ticks++;
        time+=16.66666666666666;
        globalfilters.shockwave.time = (globalfilters.shockwave.time >= 1 ) ? 0 : globalfilters.shockwave.time + 0.015;
        if (globalfilters.shockwave.enabled && globalfilters.shockwave.time>=0.06){
            globalfilters.shockwave.amplitude-=3;
            globalfilters.shockwave.brightness-=0.03;
            if (globalfilters.shockwave.brightness<=1.0){
                globalfilters.shockwave.enabled=false;
            }
        }
    }

    if (laserstock<=difficulty.lasermax)
    {
        if (settings.sword==1){
            laserstock+=difficulty.lasertime;
        }
        else{
            laserstock+=difficulty.lasertime*4;
        }
        if (remember.laser<1 && laserstock>=1)
        {
            set.laserrecharged();
        }
    }


    if (dead>0){
        dead++;
        if (dead==100){
            sfx.play('tryover');
        }
        if (dead>150){
            stage.alpha-=0.005;
        }
        if (dead>400){
            
            log2db('died');
            clear_sprites();
            scene=1;
            lifestock=2;
            if (remember.scoreattack){
                renderer.background.color = 0x000000;
                dead=0;
                resettime();
                stage.alpha=1;
                stagecount=0;
                scene=8;
                actcount=0;
            }
            if (trystock<=0){
                renderer.background.color = 0x000000;
                dead=0;
                resettime();
                stage.alpha=1;
                stagecount=6;
                actcount=0;
            }
        }
    }

    if (scene < 99 && dead<=0){
        if (stage.alpha<1.0){
            stage.alpha+=0.01;   
        }
        if (globalfilters.twist.radius>0){
            globalfilters.twist.radius-=10;
            globalfilters.twist.angle-=0.1;
        }
        else{
            globalfilters.twist.enabled=false;
        }
        
    }
    
    if (scene>=100 && dead==0)
    {
        if (stage.alpha<=0){
            scene=113;
        }
        if (scene==110)
        {
            ticks=0;
            music[playing].fade(1, 0, 6000);
            scene++;
            set.bonustext(300, true);
            }

        if (scene==111)
        {   
            
            if (ticks>500)  
            {
                ticks=0;
                scene++;
            }
        }
        if (scene == 112){
            stage.alpha-=0.01;
            if (ticks>100)
            {
                scene++;
            }
        }
        else if (scene==113){
            clear_sprites();
            ticks=0;
            stagecount++;
            actcount=1;
            scene=1;
        }
        
    }
    else if (scene==0){
        //console.log(nmusicloaded+' '+ntextures+' '+nmusicloadmax+' '+ntexmax+' '+(nmusicloadmax+ntexmax));
        if (done==0){updateloading(nmusicloaded+ (ntextures || 0));}
        if ((play==true) && nmusicloaded+ntextures>=ntexmax+nmusicloadmax){
            done=0;
            ticks=0;
            document.getElementById("settings").remove();
            scene++;
        }
    }
    else if (stagecount<0)
    {
        debugstage();
    }
    else if (stagecount==0)
    {
        stage0();
    }
    else if (stagecount==1)
    {
        stage1(); 
    }
    else if (settings.version!=='demo'){
        if (stagecount==2)
        {
            stage2();
        }
        else if (stagecount==3)
        {
            stage4();
        }
        else if (stagecount==4)
        {
            stage3();
        }
        else if (stagecount==5)
        {
            stage5();
        }
    }
    if((stagecount==6 || (stagecount>=2 && settings.version=='demo')) && play)
    {
        if (stage.alpha<1.0){
            stage.alpha+=0.01;   
        }
        if (globalfilters.twist.radius>0){
            globalfilters.twist.radius-=10;
            globalfilters.twist.angle-=0.1;
        }
        else{
            globalfilters.twist.enabled=false;
        }

        if (trystock>0 && settings.version!=='demo'){
            ending();
        }
        else if (settings.version=='demo' && settings.plattform=='web')
        {
            closeFullscreen();
            stagecount=-1;
            document.getElementById('demoend').style.display='block';
            canvas[0].style.display = "none";
        }
        else{
            gameover();
        }
    }
    
    else if (stagecount>6){
        stagecount=0;
        startstage=1;
        totalscore=0;
        trystock=3;
        
    }
    
}


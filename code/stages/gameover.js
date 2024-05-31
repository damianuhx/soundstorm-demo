function reset(){
    for (var i = frontlayer.children.length - 1; i >= 0; i--) {	frontlayer.removeChild(frontlayer.children[i]);};            
    for (var i = background.children.length - 1; i >= 0; i--) {	background.removeChild(background.children[i]);};  
    for (var i = backlayer.children.length - 1; i >= 0; i--) {	backlayer.removeChild(backlayer.children[i]);};     
    for (var i = container.children.length - 1; i >= 0; i--) {	container.removeChild(container.children[i]);};     
   
    clear_sprites();
    globalreset();
    stagecount=0;
    scene=1;
    lifestock=2;
    resettime();
}

function gameover()
{

    if (scene<=1)
    {
        stage.alpha=1;
        create(0, 'picture', 430, 540, {speedY: 0, subtype: tGameover, misc1: 200, misc2:1500, misc3:300, misc4: 1, misc5: 1});
        log2db('game over');
        music[playing].stop();
        playing = 'gameover';
        music[playing].volume(1);
        music[playing].play();
        musictime=0;
        scene++;
        ticks=0;

        var tsprite = new PIXI.BitmapText(' TRIP OVER \n'
        +'\n\n'
        +'\nFINAL SCORE\n   '+gstringformat(scoretotal)
        , { 
            fontName: "monospace",
            anchor: (0.5,0.5),
            textAlign: 'right',
            fontSize: 60,
        });
        
        tsprite.x=1150;
        tsprite.y=300;
        
        frontlayer.addChild(tsprite);
           
    }
    
    if (scene == 2){
        if ((shoot && ticks>300) || ticks>2200){
            reset();
        }
        
    }
}

function ending()
{
    if (scene<=1)
    {
        
        log2db('game cleared');
        stage.alpha=1;
        renderer.background.color = 0x000000;
        music[playing].stop();
        playing = 'ending';
        music[playing].volume(1);
        music[playing].play();
        musictime=0;
        scene++;
        ticks=0;


        var ssprite = new PIXI.BitmapText('GAME CLEAR', { 
            fontName: "inline",
            anchor: (0.5,0.5),
            textAlign: 'left',
            fontSize: 150,
        });
        ssprite.x=200;
        ssprite.y=250;
        frontlayer.addChild(ssprite);

        var tsprite = new PIXI.BitmapText('SCORE EARNED    ='+gstringformat(scoretotal)+
        '\n'+Math.floor(trystock/10)+(trystock%10)+' TRIES  X 400 ='+gstringformat(trystock*400)+'\n'
        +Math.floor(lifestock)+Math.round(lifestock*10)%10+' HEALTH X  20 ='+gstringformat(Math.round(lifestock*200))
        +'\n------------------------'
        +'\nFINAL SCORE     ='+gstringformat(Math.round(scoretotal+(trystock*500)+(lifestock*200)))
        , { 
            fontName: "monospace",
            anchor: (0.5,0.5),
            textAlign: 'left',
            fontSize: 80,
        });
        
        tsprite.x=200;
        tsprite.y=550;
        
        frontlayer.addChild(tsprite);
        
    }
    if (scene == 2)
    {
        if (ticks>900)
        {
            for (var i = frontlayer.children.length - 1; i >= 0; i--) {	frontlayer.removeChild(frontlayer.children[i]);};            
            //create(1000, 'picture', 1480, 2700, {speedY: -1, subtype: tScroll, misc1: 300, misc2:3400, misc3:300, misc4: 1, misc5: 1});

            set.creditstext('CONGRATULATIONS', 1000, {font:'inline'});
            set.creditstext('YOU SURVIVED ALL TRIPS AND\n        BECAME ENLIGHTENED', 1160, {font:'solid', fontsize: 60});

            set.creditstext('GAME', 1500, {font:'inline'});
            set.creditstext('DAMIAN HILTEBRAND', 1580, {font:'solid', fontsize: 60});
            
            set.creditstext('GRAPHICS', 1800, {font:'inline',});
            set.creditstext('ZISKA RENOLD', 1880, {font:'solid', fontsize: 60});

            set.creditstext('MUSIC', 2100, {font:'inline'});
            set.creditstext('NILS KUENZIG', 2180, {font:'solid',fontsize: 60});

            set.creditstext('SPECIAL THANKS', 2500, {font:'inline'});
            set.creditstext('MARCO STIRNEMANN', 2580, {font:'solid',fontsize: 60});
            set.creditstext('MARTIN MAUERSICS', 2660, {font:'solid',fontsize: 60});
            set.creditstext('DAVID GNESA', 2740, {font:'solid',fontsize: 60});
            set.creditstext('MARTIN RENOLD', 2820, {font:'solid',fontsize: 60});
            set.creditstext('IRINA MEIER', 2900, {font:'solid',fontsize: 60});
            set.creditstext('CHRISTIAN JENNI', 2980, {font:'solid',fontsize: 60});

            set.creditstext('HELPERS', 3300, {font:'inline'});
            set.creditstext('PIXI.JS', 3380, {font:'solid',fontsize: 60});
            set.creditstext('HOWLER.JS', 3460, {font:'solid',fontsize: 60});
            set.creditstext('FREESOUND.ORG', 3540, {font:'solid',fontsize: 60});

            set.creditstext('THANK YOU FOR PLAYING', 3800, {font:'solid',fontsize: 60});
            set.creditstext('SOUNDSTORM', 3880, {font:'inline'});
            
            create(900, 'picture', 540, 540, {speedY: 0, subtype: tEnding, misc1: 100, misc2:500, misc3:100, misc4: 1, misc5: 1});
            create(1600, 'picture', 540, 540, {speedY: 0, subtype: tex.end1, misc1: 100, misc2:300, misc3:100, misc4: 1, misc5: 1});
            create(2100, 'picture', 540, 540, {speedY: 0, subtype: tex.end2, misc1: 100, misc2:300, misc3:100, misc4: 1, misc5: 1});
            create(2600, 'picture', 540, 540, {speedY: 0, subtype: tex.end3, misc1: 100, misc2:300, misc3:100, misc4: 1, misc5: 1});
            create(3100, 'picture', 540, 540, {speedY: 0, subtype: tex.end4, misc1: 100, misc2:300, misc3:100, misc4: 1, misc5: 1});
            create(3600, 'picture', 540, 540, {speedY: 0, subtype: tex.end5, misc1: 100, misc2:300, misc3:100, misc4: 1, misc5: 1});
            create(4100, 'picture', 540, 540, {speedY: 0, subtype: tex.end6, misc1: 100, misc2:300, misc3:300, misc4: 1, misc5: 1});
            
            scene++;
        }
    }
    if (scene == 3)
    {
        if (ticks>2000)
        {
            //scroll
            scene++;
        }
    }

    if (scene == 4)
    {
        if (ticks>5000 || (ticks>2000 && shoot))
        {
            saveStage({
                stagecount: 1,
                actcount: 1,
                trystock: 3,
                scoretotal: 0
            });
            globalreset();
            reset();
        }
    }

}

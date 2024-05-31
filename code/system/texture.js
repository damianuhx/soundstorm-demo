var tex={}; //all textures
var set={}; //all sprites that are added to the scene

var preload;

function texload(name){
    var texture = PIXI.Texture.from(name);
    preload = new PIXI.Sprite(texture);
    console.log(ntextures);
    return texture;
    
}

    var ntextures = 0;
    var loadstage = 0;


    if (settings.version=='demo'){
        var ntexmax=27;
    }
    else{
        var ntexmax=93;
    }

    PIXI.Assets.load('./pics/fonts/solid.fnt').then(() => {ntextures++;});
    PIXI.Assets.load('./pics/fonts/inline.fnt').then(() => {ntextures++;});
    PIXI.Assets.load('./pics/fonts/monospace.fnt').then(() => {ntextures++;});
    PIXI.Assets.load('./pics/fonts/small.fnt').then(() => {ntextures++;});

    PIXI.Assets.load('pics/img01/fly/Spine.json').then((resource) => {
        tex.fly=resource.spineData;
    });

    PIXI.Assets.load('pics/animations/Spine.json').then((resource) => {
        tex.butterfly=resource.spineData;
        ntextures++;
    });

    PIXI.Assets.load('pics/img01/loewenzahn/Spine.json').then((resource) => {
        tex.hawkbit=resource.spineData;
        ntextures++;
    });

    PIXI.Assets.load('pics/img01/dragonfly/Spine.json').then((resource) => {
        tex.dragonfly=resource.spineData;
        ntextures++; 
    });

    PIXI.Assets.load('pics/img00/tut1/tut1.json').then((resource) => {
        tex.tut1=resource.spineData;      
        ntextures++; 
    });

    PIXI.Assets.load('pics/img00/tut2/Spine.json').then((resource) => {
        tex.tut2=resource.spineData; 
        ntextures++;      
    });

    PIXI.Assets.load('pics/img00/tut3/Spine.json').then((resource) => {
        tex.tut3=resource.spineData;   
        ntextures++;    
    });

    PIXI.Assets.load('pics/img00/tut4/Spine.json').then((resource) => {
        tex.tut4=resource.spineData;    
        ntextures++;   
    });


    PIXI.Assets.load('pics/img00/tuthero/Spine.json').then((resource) => {
        tex.tuthero=resource.spineData;   
        ntextures++;    
    });

    PIXI.Assets.load('pics/img00/gameover.jpg').then(() => {
        tGameover=texload('pics/img00/gameover.jpg');
        ntextures++;
    });
    PIXI.Assets.load('pics/img00/dunkelwald.png').then(() => {
        tDunkelwald=texload('pics/img00/dunkelwald.png');
        ntextures++;
    });
    PIXI.Assets.load('pics/img00/scroll.jpg').then(() => {
        tScroll=texload('pics/img00/scroll.jpg');
        ntextures++;
    });
    PIXI.Assets.load('pics/img00/logo.jpg').then(() => {
        tex.logo=texload('pics/img00/logo.jpg');
        ntextures++;
    });

    PIXI.Assets.load('pics/img00/base.json').then(() => {
        tSoundstorm = texload('soundstorm'); 
        tex.trip04 = texload('trip04');
        tex.trip03 = texload('trip03');
        tTrip02 = texload('trip02');
        tTrip01 = texload('trip01');
        tParticle01 = texload('particle01');
        tParticle02 = texload('particle02');
        tParticle03 = texload('particle03');
        tex.p1 = texload('p1');
        tex.p2 = texload('p2');
        tex.p3 = texload('p3');
        tex.p4 = texload('p4');
        tex.p5 = texload('p5');
        tex.p6 = texload('p6');
        tex.p7 = texload('p7');
        tex.p8 = texload('p8');
        tParticleHawkbit = texload('particle_hawkbit');
        tParticleSunflower = texload('particle_sunflower');
        tStar = texload('star');
        tWingparticle = texload('wingparticle');
        tex.frame = texload('frame');
        tex.air = texload('air');
        tex.oneup = texload('oneup');
        tex.trip05 = texload('trip05');
        tex.bigstar = texload('starbig');
        tex.smallstar = texload('starsmall');
        tex.recharge = texload('recharge');
        tBullet01 = texload('bullet01');
        tBullet02 = texload('bullet02');
        tBullet03 = texload('bullet03');
        tBullet04 = texload('bullet04');
        tBbullet02 = texload('bbullet02');
        tBbullet03 = texload('bbullet03');
        tBbullet04 = texload('bbullet04');
        tBulletWhite = texload('bullet white');
        tex.bulletline = texload('bullet line');
        tex.bbulletline = texload('bbullet line');
        tex.cbulletline = texload('cbullet line');
        tCbullet01 = texload('cbullet01');
        tCbullet02 = texload('cbullet02');
        tCbullet03 = texload('cbullet03');
        tCbullet04 = texload('cbullet04');
        tGrain01 = texload('grain01');
        tGrain02 = texload('grain02');
        tGrain03 = texload('grain03');
        tGrain04 = texload('grain04');
        tGrainWhite = texload('grain white');
        tex.grainline = texload('grain line');
        tStick01 = texload('stick02');
        tStick02 = texload('stick01');
        tStick03 = texload('stick03');
        tStick04 = texload('stick04');
        tStick05 = texload('stick05');
        tStickWhite = texload('stick white');
        tex.stickline = texload('stick line');
        tWhitecluster01 = texload('whitecluster01');
        tWhitecluster02 = texload('whitecluster02');
        tWhitecluster03 = texload('whitecluster03');
        tWhiteclusterWhite = texload('whitecluster white');
        tex.clusterline = texload('cluster line');
        tTrip00 = texload('trip00');
        tTut1 = texload('tut1');
        tTut2 = texload('tut2');
        tTut3 = texload('tut3');
        tTut4 = texload('tut4');
        tTutbig = texload('tutbig');
        tTuthero = texload('tuthero');
        tLife = texload('life');
        tex.lifewhite = texload('lifewhite');
        ntextures++;
    });

    var tLaser = [];
    PIXI.Assets.load('pics/img00/shields.json').then(() => {
        tLaser[0] = texload('shield1');
        tLaser[1] = texload('shield2');
        tLaser[2] = texload('shield3');
        tLaser[3] = texload('shield4');
        tLaser[4] = texload('shield5');
        ntextures++;
    });

    PIXI.Assets.load('pics/img00/ending.json').then(() => {
        tEnding = texload('ending');
        tex.end1 = texload('end1');
        tex.end2 = texload('end2');
        tex.end3 = texload('end3');
        tex.end4 = texload('end4');
        tex.end5 = texload('end5');
        tex.end6 = texload('end6');
        ntextures++;
    });



    //stage 1

    
    PIXI.Assets.load('pics/img01/trip1.json').then(() => {
        tex.mushanime = [
            texload('mushanime_01'),
            texload('mushanime_02'),
            texload('mushanime_03'),
            texload('mushanime_04'),
            texload('mushanime_05'),
        ];
        tex.mushdefeated = texload('mushdefeated');
        tFear01 = texload('fear01');
        tGrass1 = texload('grass1');
        tGrass2 = texload('grass2');
        tGrass3 = texload('grass3');
        tHero=texload('hero');
        tMushroom = texload('mushroom');
        tGrassborder = texload('grassborder');
        tSunflower = texload('sunflower');
        ntextures++;
    });

    PIXI.Assets.load('pics/img01/fog1.png').then(() => {
        tex.fog1=texload('pics/img01/fog1.png');
        ntextures++;
    });

    PIXI.Assets.load('pics/img00/foresttitle.jpg').then(() => {
        tex.foresttitle=texload('pics/img00/foresttitle.jpg');
        ntextures++;
    });

    PIXI.Assets.load('pics/img00/foresttitle_h.jpg').then(() => {
        tex.foresttitle_h=texload('pics/img00/foresttitle_h.jpg');
        ntextures++;
    });

    PIXI.Assets.load('pics/img00/foresttitle_n.png').then(() => {
        tex.foresttitle_n=texload('pics/img00/foresttitle_n.png');
        ntextures++;
    });

    PIXI.Assets.load('pics/img01/greengrass.jpg').then(() => {
        tGrass=texload('pics/img01/greengrass.jpg');
        ntextures++;
    });

    PIXI.Assets.load('pics/img01/forestground.jpg').then(() => {
        tex.forestground=texload('pics/img01/forestground.jpg');
        ntextures++;
    });

    PIXI.Assets.load('pics/img01/forestground_n.png').then(() => {
        tex.forestground_n=texload('pics/img01/forestground_n.png');
        ntextures++;
    });

    PIXI.Assets.load('pics/img01/forestground_h.jpg').then(() => {
        tex.forestground_h=texload('pics/img01/forestground_h.jpg');
        ntextures++;
    });

    if (settings.version!=='demo'){
        //stage2

        PIXI.Assets.load('pics/img02/alien/Spine.json').then((resource) => {
            tex.alien=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img02/satelite/Spine.json').then((resource) => {
            tex.satelite=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img02/ufo/Spine.json').then((resource) => {
            tex.ufo=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img02/hero/Spine.json').then((resource) => {
            tex.hero2=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img02/space.jpg').then(() => {
            tSpace=texload('pics/img02/space.jpg');
            ntextures++;
        });

        PIXI.Assets.load('pics/img02/space_n.png').then(() => {
            tex.space_n=texload('pics/img02/space_n.png');
            ntextures++;
        });

        PIXI.Assets.load('pics/img02/space_h.jpg').then(() => {
            tex.space_h=texload('pics/img02/space_h.jpg');
            ntextures++;
        });

        PIXI.Assets.load('pics/img02/hills/hill4.jpg').then(() => {
            tHill4=texload('pics/img02/hills/hill4.jpg');
            ntextures++;
        });
        PIXI.Assets.load('pics/img02/fog2.png').then(() => {
            tex.fog2=texload('pics/img02/fog2.png');
            ntextures++;
        });

        PIXI.Assets.load('pics/img02/meteor_h.png').then(() => {
            tex.meteor_h=texload('pics/img02/meteor_h.png');
            ntextures++;
        });

        PIXI.Assets.load('pics/img02/trip2.json').then(() => {
            
            tUfo= texload('ufo');
            tSaturn = texload('saturn');
            tBalloon1 = texload('balloon1');
            tBalloon2 = texload('balloon2');
            tex.meteor = texload('meteor');
            //tex.meteor_h = texload('meteor_h');
            tHero2 = texload('hero2');
            tFear02 = texload('fear02');
            ntextures++;
        });


    PIXI.Assets.load('pics/img02/hills/hill1.png').then(() => {
        tex.hill1=texload('pics/img02/hills/hill1.png');
        ntextures++;
    });

    PIXI.Assets.load('pics/img02/hills/hill1_n.png').then(() => {
        tex.hill1_n=texload('pics/img02/hills/hill1_n.png');
        ntextures++;
    });

    PIXI.Assets.load('pics/img02/hills/hill1_h.png').then(() => {
        tex.hill1_h=texload('pics/img02/hills/hill1_h.png');
        ntextures++;
    });

    PIXI.Assets.load('pics/img02/hills/hill2.png').then(() => {
        tex.hill2=texload('pics/img02/hills/hill2.png');
        ntextures++;
    });

    PIXI.Assets.load('pics/img02/hills/hill2_n.png').then(() => {
        tex.hill2_n=texload('pics/img02/hills/hill2_n.png');
        ntextures++;
    });

    PIXI.Assets.load('pics/img02/hills/hill2_h.png').then(() => {
        tex.hill2_h=texload('pics/img02/hills/hill2_h.png');
        ntextures++;
    });

    PIXI.Assets.load('pics/img02/hills/hill3.png').then(() => {
        tex.hill3=texload('pics/img02/hills/hill3.png');
        ntextures++;
    });

    PIXI.Assets.load('pics/img02/hills/hill3_n.png').then(() => {
        tex.hill3_n=texload('pics/img02/hills/hill3_n.png');
        ntextures++;
    });

    PIXI.Assets.load('pics/img02/hills/hill3_h.png').then(() => {
        tex.hill3_h=texload('pics/img02/hills/hill3_h.png');
        ntextures++;
    });

    PIXI.Assets.load('pics/img02/hills/hill4.jpg').then(() => {
        tex.hill4=texload('pics/img02/hills/hill4.jpg');
        ntextures++;
    });

    PIXI.Assets.load('pics/img02/hills/hill4_n.png').then(() => {
        tex.hill4_n=texload('pics/img02/hills/hill4_n.png');
        ntextures++;
    });

    PIXI.Assets.load('pics/img02/hills/hill4_h.jpg').then(() => {
        tex.hill4_h=texload('pics/img02/hills/hill4_h.jpg');
        ntextures++;
    });

        PIXI.Assets.load('pics/img02/T2hills.json').then(() => {
            tHill1 = texload('hill1');
            tHill2 = texload('hill2');
            tHill3 = texload('hill3');
            ntextures++;
        });
       


        //stage 3
        PIXI.Assets.load('pics/img03/city.jpg').then(() => {
            tex.city=texload('pics/img03/city.jpg');
            ntextures++;
        });
        PIXI.Assets.load('pics/img03/city_n.png').then(() => {
            tex.city_n=texload('pics/img03/city_n.png');
            ntextures++;
        });
        PIXI.Assets.load('pics/img03/city_h.png').then(() => {
            tex.city_h=texload('pics/img03/city_h.png');
            ntextures++;
        });
        PIXI.Assets.load('pics/img03/cemetry.jpg').then(() => {
            tex.cemetry=texload('pics/img03/cemetry.jpg');
            ntextures++;
        });
        PIXI.Assets.load('pics/img03/cemetry_h.jpg').then(() => {
            tex.cemetry_h=texload('pics/img03/cemetry_h.jpg');
            ntextures++;
        });
        PIXI.Assets.load('pics/img03/cemetry_n.png').then(() => {
            tex.cemetry_n=texload('pics/img03/cemetry_n.png');
            ntextures++;
        });
        PIXI.Assets.load('pics/img03/fog3.png').then(() => {
            tex.fog3=texload('pics/img03/fog3.png');
            ntextures++;
        });

        PIXI.Assets.load('pics/img03/trip3.json').then(() => {
            //tex.heli = texload('heli');
            //tex.heli2 = texload('heli2');
            //tex.rotor = texload('rotor');
            //tex.plane = texload('plane');
            tex.fear04 = texload('fear04');
            //tex.bomber = texload('bomber');
            
            tex.stripes = texload('stripes');
            tex.stars = texload('stars');
            //tex.hornet = texload('hornet');
            //tex.zeppelin = texload('zeppelin');    
            
            tHero4 = texload('engel');
            ntextures++;
        });

        PIXI.Assets.load('pics/img03/hero/Spine.json').then((resource) => {
            tex.hero4=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img03/bomber/Spine.json').then((resource) => {
            tex.bomber=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img03/ecloud/Spine.json').then((resource) => {
            tex.ecloud=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img03/heli1/skeleton.json').then((resource) => {
            tex.heli1=resource.spineData;
            ntextures++;
        });


        PIXI.Assets.load('pics/img03/heli2/skeleton.json').then((resource) => {
            tex.heli2=resource.spineData;
            ntextures++;
        });


        PIXI.Assets.load('pics/img03/hornet/Spine.json').then((resource) => {
            tex.hornet=resource.spineData;
            ntextures++;
        });


        PIXI.Assets.load('pics/img03/plane/Spine.json').then((resource) => {
            tex.plane=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img03/zeppelin/Spine.json').then((resource) => {
            tex.zeppelin=resource.spineData;
            ntextures++;
        });
       
        //stage 4
        PIXI.Assets.load('pics/img04/riverground.jpg').then(() => {
            tex.riverground=texload('pics/img04/riverground.jpg');
            ntextures++;
        });

        PIXI.Assets.load('pics/img04/riverground.jpg').then(() => {
            tex.riverground_n=texload('pics/img04/riverground_n.png');
            ntextures++;
        });

        PIXI.Assets.load('pics/img04/riverground_h.jpg').then(() => {
            tex.riverground_h=texload('pics/img04/riverground_h.jpg');
            ntextures++;
        });

        PIXI.Assets.load('pics/img04/mammut.jpg').then(() => {
            tex.mammut=texload('pics/img04/mammut.jpg');
            ntextures++;
        });
        PIXI.Assets.load('pics/img04/eagle.png').then(() => {
            tex.eagleb=texload('pics/img04/eagle.png');
            ntextures++;
        });

        PIXI.Assets.load('pics/img04/trip4.json').then(() => {

            tex.cloud1 = texload('cloud1');
            tex.cloud2 = texload('cloud2');
            tex.cloud3 = texload('cloud3');
            tex.cloud4 = texload('cloud4');
            tex.cloudstripe = texload('cloudstripe');
            //tex.cloudboss = texload('cloudboss');
            //tex.dragonblue = texload('dragonblue');
            //tex.dragonred = texload('dragonred');
            //tex.eagle = texload('eagle');
            //tex.parrot = texload('parrot');
            //tex.squirrel = texload('squirrel');
            tex.rain = texload('raindrop');
            tex.electro = texload('electro');
            tex.lightning = texload('lightning');
            tex.fear03 = texload('fear03');
            tex.feather = texload('feather');
            tex.dragonwing = texload('dragonwing');
            tex.featherparrot = texload('featherparrot');
            tHero3 = texload('hero3');
            ntextures++;
        });

        PIXI.Assets.load('pics/img04/dragon/Spine.json').then((resource) => {
            tex.dragon=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img04/cloud/Spine.json').then((resource) => {
            tex.cloud=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img04/eagle/Spine.json').then((resource) => {
            tex.eagle=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img04/parrot/Spine.json').then((resource) => {
            tex.parrot=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img04/squirrel/Spine.json').then((resource) => {
            tex.squirrel=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img04/hero3/Spine.json').then((resource) => {
            tex.hero3=resource.spineData;
            ntextures++;
        });


        //stage 5
        PIXI.Assets.load('pics/img05/trip5.json').then(() => {
            //tex.ghostw1 = texload('ghostw1');
            //tex.ghostw2 = texload('ghostw2');
            //tex.ghostw3 = texload('ghostw3');
            tex.ghostw4 = texload('ghostw4');
            //tex.ghostb1 = texload('ghostb1');
            //tex.ghostb2 = texload('ghostb2');
            //tex.ghostb3 = texload('ghostb3');
            tex.ghostb4 = texload('ghostb4');
            tex.cluster1 = texload('cluster1');
            tex.cluster2 = texload('cluster2');
            tex.cluster3 = texload('cluster3');
            tex.cluster4 = texload('cluster4');
            tex.cluster5 = texload('cluster5');
            tex.cluster6 = texload('cluster6');
            tex.cluster7 = texload('cluster7');
            tex.cluster8 = texload('cluster8');
            tex.farbmandala1 = texload('farbmandala1');
            tex.farbmandala2 = texload('farbmandala2');
            //tex.face1 = texload('face1');
            //tex.face2 = texload('face2');
            tex.fear05 = texload('fear05');
            ntextures++;
        });

        PIXI.Assets.load('pics/img05/ghostw1/Spine.json').then((resource) => {
            tex.ghostw1=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img05/ghostw2/Spine.json').then((resource) => {
            tex.ghostw2=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img05/ghostw3/Spine.json').then((resource) => {
            tex.ghostw3=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img05/ghostb1/Spine.json').then((resource) => {
            tex.ghostb1=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img05/ghostb2/Spine.json').then((resource) => {
            tex.ghostb2=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img05/ghostb3/Spine.json').then((resource) => {
            tex.ghostb3=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img05/face1/Spine.json').then((resource) => {
            tex.face1=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img05/face2/Spine.json').then((resource) => {
            tex.face2=resource.spineData;
            ntextures++;
        });

        PIXI.Assets.load('pics/img05/T5faces.json').then(() => {
       
            tex.bface1 = texload('bface1');
            tex.bface2 = texload('bface2');
            tex.bface3 = texload('bface3');
            tex.bface4 = texload('bface4');
            tex.bface5 = texload('bface5');
            tex.bface6 = texload('bface6');
            tex.bface7 = texload('bface7');
            tex.bface8 = texload('bface8');
            tex.bface9 = texload('bface9');
            tex.bface10 = texload('bface10');
            tex.bface11 = texload('bface10');
            tex.bface12 = texload('bface12');
            tex.bface13 = texload('bface13');
            tex.bface14 = texload('bface14');
            tex.bface15 = texload('bface15');
            tex.bface16 = texload('bface16');
            tex.bface19 = texload('bface19');
            tex.bface20 = texload('bface20');
            ntextures++;
        });

        PIXI.Assets.load('pics/img05/T5pictrip.json').then(() => {
            tex.pictrip=[];
            tex.pictrip[0] = texload('pic00');
            tex.pictrip[1] = texload('pic01');
            tex.pictrip[2] = texload('pic02');
            tex.pictrip[3] = texload('pic03');
            tex.pictrip[4] = texload('pic04');
            tex.pictrip[5] = texload('pic05');
            tex.pictrip[6] = texload('pic06');
            tex.pictrip[7] = texload('pic07');
            tex.pictrip[8] = texload('pic08');
            tex.pictrip[9] = texload('pic09');
            tex.pictrip[10] = texload('pic10');
            tex.pictrip[11] = texload('pic11');
            tex.pictrip[12] = texload('pic12');
            tex.pictrip[13] = texload('pic13');
            tex.pictrip[14] = texload('pic14');
            tex.pictrip[15] = texload('pic15');
            tex.pictrip[16] = texload('pic16');
            tex.pictrip[17] = texload('pic17');
            tex.pictrip[18] = texload('pic18');
            tex.pictrip[19] = texload('pic19');
            ntextures++;
        });

        PIXI.Assets.load('pics/img05/T5mandalas.json').then(() => {
            tex.mandala=[];
            tex.mandala[0] = texload('mandala0');
            tex.mandala[1] = texload('mandala1');
            tex.mandala[2] = texload('mandala2');
            tex.mandala[3] = texload('mandala3');
            tex.mandala[4] = texload('mandala4');
            tex.mandala[5] = texload('mandala5');
            tex.mandala[6] = texload('mandala6');
            tex.mandala[7] = texload('mandala7');
            tex.mandala[8] = texload('mandala8');
            tex.mandala[9] = texload('mandala9');
            ntextures++;
        });

        PIXI.Assets.load('pics/img05/fullmandala.jpg').then(() => {
            tex.fullmandala=texload('pics/img05/fullmandala.jpg');
            ntextures++;
        });

        PIXI.Assets.load('pics/img05/dunkelberg.jpg').then(() => {
            tex.dunkelberg=texload('pics/img05/dunkelberg.jpg');
            ntextures++;
        });

    }
    



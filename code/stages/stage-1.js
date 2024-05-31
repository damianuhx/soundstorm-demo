function debugstage(){


    if (scene <= 9){
        startscreen();
    }

    //act0
    if (scene==10)
    {

        create(0, 'e_dragonfly', 400, 1200, {speedY: -2, misc1: 1, texture: tex.zeppelin, beatlayer: 4, zep: true});

        create(100, 'e_dragonfly', 400, 1200, {speedY: -2, misc1: 1, texture: tex.zeppelin, beatlayer: 4, zep: true});

        /*create(0, 'plane', 1600, -100, {speedY: 6, shotspeedX: -2, beatlayer: 4});
        create(100, 'plane', 1600, -100, {speedY: 6, shotspeedX: -2, beatlayer: 4});
        create(200, 'plane', 1600, -100, {speedY: 6, shotspeedX: -2, beatlayer: 4});
        create(300, 'plane', 1600, -100, {speedY: 6, shotspeedX: -2, beatlayer: 4});*/
        scene++;


    }
}
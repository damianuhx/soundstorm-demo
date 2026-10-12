function debugstage(){


    if (scene <= 9){
        startscreen();
    }

    //act0
    if (scene==10)
    {
        //set.preflash(100, 100, 100);
        //create(0, 'laserbars', 100, 100);
        //spawnEnemy('dragonfly', {speedY: -2, misc1: 1, texture: tex.zeppelin, beatlayer: 4, zep: true, active: 0, x: 400, y: 1200});

        //spawnEnemy('dragonfly', {speedY: -2, misc1: 1, texture: tex.zeppelin, beatlayer: 4, zep: true, active: 100, x: 400, y: 1200});

        set.preflash(500, 500, {})
        //spawnEnemy('plane', {speedY: 6, shotspeedX: -2, beatlayer: 4, active: 0, x: 1600, y: -100});
        /*spawnEnemy('plane', {speedY: 6, shotspeedX: -2, beatlayer: 4, active: 100, x: 1600, y: -100});
        spawnEnemy('plane', {speedY: 6, shotspeedX: -2, beatlayer: 4, active: 200, x: 1600, y: -100});
        spawnEnemy('plane', {speedY: 6, shotspeedX: -2, beatlayer: 4, active: 300, x: 1600, y: -100});*/
        scene++;


    }
}
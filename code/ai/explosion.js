//required global: ex_timer, ex_cicles;
function alien_ex(cicles){
    if (this.ex_cicles<cicles){
        if (this.ex_timer == 0)
        {
            effectf.call(this, this.x, this.y, 'alienexploding');
            this.ex_cicles++;
            this.ex_timer=30;
        }
        this.ex_timer--;
    }
    else{
        this.phase++;
    }
    
}

function mushroom_ex(cicles){
    cancel_all_bullets();
    if (this.ex_cicles<cicles){
        if (this.ex_timer == 0)
        {
            effectf.call(this, this.x, this.y, 'mushroomexploding');
            this.ex_cicles++;
            this.ex_timer=30;
        }
        this.ex_timer--;
    }
    else{
        //effectf.call(this, this.x, this.y, 1);
        this.phase++;
    }
    
}

function cloud_ex(cicles){
    if (this.ex_cicles<cicles){
        if (this.ex_timer == 0)
        {
            effectf.call(this, this.x, this.y, 'cloudexploding');
            this.ex_cicles++;
            this.ex_timer=30;
        }
        this.ex_timer--;
    }
    else{
        //effectf.call(this, this.x, this.y, 1);
        this.phase++;
    }
    
}

function smoke(x, y, max, value, factor=-1){
    if (this.health<value){
        if (Math.random()>0.5 && this.health>0){
            var blue=this.health-(max/2)/(max/2);
            var green=this.health-(max/2)/(max/2);
            if (this.health>max/2){
                blue=(this.health-(max/2))/(max/2);
                green=1;
            }
            else{
                blue=0;
                green=this.health/(max/2);
            }
                create(0, 'picture', this.x+x, this.y+y, {
                tint: rgbToHex(
                    255,
                    255*green,
                    255*blue
                ),
                accY: 0.2, 
                layer: 'front', 
                speedX: 1-2*Math.random(), 
                speedY: factor*(Math.random()*3+5), 
                subtype: tParticle02, 
                alpha: 0.5,
                misc1:4, misc2:15, misc3:10, misc4: 1, misc5: 1});
            }
        }
    }


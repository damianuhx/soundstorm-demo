



//ATTACHED ONE FRAME OBJECTS
//create flash of bullet at bullets position
function flash(beatlayer, subtype)
{
    if (this.scale.x>0.8)
    {
        if (beat[beatlayer]>0){
            create (0, 'shotflash', this.x, this.y, {color:this.excolor, subtype: subtype, beatlayer: beatlayer, speedX: this.rotation});
            create (0, 'preflash', this.x, this.y, {color:this.excolor, subtype: subtype, beatlayer: beatlayer, speedX: this.rotation});
        }
        if (prebeat[beatlayer]>0){
            create (0, 'preflash', this.x, this.y, {kind: 'outer', color:this.excolor, subtype: subtype, beatlayer: beatlayer, speedX: this.rotation});
            create (0, 'preflash', this.x, this.y, {kind: 'inner', color:this.excolor, subtype: subtype, beatlayer: beatlayer, speedX: this.rotation});
        }
    }
}

//create sword of hero at relative position
function sword()
{
    if (settings.sword==1){
        create (0, 'sword', this.x, this.y+75)
    }
}



//MENU
//displays the menu
function varupdate(variable){
    if (variable=='score'){
        this.text='+'+score+'';
        while (this.text.length<12)
        {
            this.text=' ' + this.text;
        }
    }
    if (variable=='scoretotal'){
        this.text=scoretotal+'';
        while (this.text.length<12)
        {
            this.text=' ' + this.text;
        }
    }
    if (variable=='trystock'){
        this.text=trystock+'';
        while (this.text.length<12)
        {
            this.text=this.text+' ';
        }
    }
    else if (variable=='life'){
        if (this.index<=lifestock-1){
            this.scale.x=0.5;
            this.scale.y=0.5;
            this.alpha=0.7;
        }
        else if (this.index<lifestock) {

            this.scale.x=0.5*(lifestock-this.index);
            this.scale.y=0.5*(lifestock-this.index);
            this.alpha=0.3;
        }
        else {
            this.scale.x=0;
            this.scale.x=0;
            this.alpha=0;
        }
    }
    else if (variable=='laser'){
        this.clear();
        if (laserstock<1)
        {
            this.beginFill(0xA7FFF9, 0.8);
            this.drawRect(3, -3, 14, (-194*(laserstock)));
            this.endFill();
            this.beginFill(0x000000, 0.3);
            this.drawRect(0, 0, 20, -200);
            this.endFill();
        }
        if (laserstock>=1)
        {
            this.lineStyle(3, 0x000000, 1);
            this.beginFill(0xA7FFF9);
            this.drawRect(0, 0, 20, -200);
            this.endFill();
        }
    }
    else if (variable=='combovalue'){
        this.clear();
        this.x=herox-50;
        this.y=heroy+50;
        remember.combovalue/difficulty.maxcombovalue
        if (remember.combovalue>0)
        if (remember.combovalue>difficulty.maxcombovalue){
            remember.combovalue=difficulty.maxcombovalue;
        }
        if (remember.combovalue>0)
        {
            this.beginFill(0xA7FFF9, 0.8);
            this.drawRect(3, 3,  (97*(remember.combovalue/difficulty.maxcombovalue)), 14,);
            this.endFill();
            this.beginFill(0x000000, 0.3);
            this.drawRect(0, 0, 100, 20, );
            this.endFill();
        }
    }
}

ai.mushanime = function (){
    //this.blendMode=this.parent.blendMode;
    if (scene<21){
        this.renderable=false;
    }
    else if (this.parent.delete==true || dead>0){
        this.delete=true;
    }
    else if (this.parent.health<=0){
        this.renderable=true;
        this.gotoAndStop(4);
    }
    else{
        this.atimer++;
        if (this.atimer<5){
            this.renderable=false;
        }
        else{
            this.renderable=true;
            if (this.atimer<10){
                this.gotoAndStop(0);
            }
            else if (this.atimer<10){
                this.gotoAndStop(1);
            }
            else if (this.atimer<15){
                this.gotoAndStop(2);
            }
            else if (this.atimer<20){
                this.gotoAndStop(3);
            }
            else if (this.atimer<25){
                this.gotoAndStop(2);
            }
            else if (this.atimer<30){
                this.gotoAndStop(1);
            }
            else if (this.atimer<35){
                this.gotoAndStop(0);
            }
        }
        if (this.atimer>35){
            this.atimer=0;
        }
    }
}